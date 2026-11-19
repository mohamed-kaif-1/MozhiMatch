import "server-only";
import crypto from "crypto";

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
  retryAfterSeconds?: number;
  isBudgetExceeded?: boolean;
}

export interface RateLimitOptions {
  maxRequests: number;
  windowSeconds: number;
}

interface WindowEntry {
  timestamps: number[];
}

// In-memory sliding window cache for local development and warm serverless containers
const inMemoryStore = new Map<string, WindowEntry>();

// Global budget in-memory counter
const inMemoryBudgetStore = new Map<string, { count: number; expiresAt: number }>();

export function resetRateLimitStore(): void {
  inMemoryStore.clear();
  inMemoryBudgetStore.clear();
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0].trim();
    if (firstIp) return firstIp;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp && realIp.trim()) {
    return realIp.trim();
  }
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  if (cfConnectingIp && cfConnectingIp.trim()) {
    return cfConnectingIp.trim();
  }
  return "127.0.0.1";
}

export function hashClientKey(ip: string, prefix: string): string {
  const hash = crypto.createHash("sha256").update(ip, "utf8").digest("hex").slice(0, 16);
  return `mm_rl:${prefix}:${hash}`;
}

function pruneOldEntries(cutoff: number): void {
  if (inMemoryStore.size > 2000) {
    for (const [k, v] of inMemoryStore.entries()) {
      v.timestamps = v.timestamps.filter((t) => t > cutoff);
      if (v.timestamps.length === 0) {
        inMemoryStore.delete(k);
      }
    }
  }
}

export function checkInMemoryRateLimit(
  key: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const windowMs = options.windowSeconds * 1000;
  const cutoff = now - windowMs;

  pruneOldEntries(cutoff);

  let entry = inMemoryStore.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    inMemoryStore.set(key, entry);
  }

  // Sliding window filter
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= options.maxRequests) {
    const oldest = entry.timestamps[0] || cutoff;
    const resetMs = oldest + windowMs - now;
    const retryAfterSeconds = Math.max(1, Math.ceil(resetMs / 1000));
    return {
      allowed: false,
      limit: options.maxRequests,
      remaining: 0,
      resetSeconds: retryAfterSeconds,
      retryAfterSeconds,
    };
  }

  entry.timestamps.push(now);
  const remaining = Math.max(0, options.maxRequests - entry.timestamps.length);
  return {
    allowed: true,
    limit: options.maxRequests,
    remaining,
    resetSeconds: options.windowSeconds,
  };
}

async function checkUpstashAtomic(
  url: string,
  token: string,
  key: string,
  options: RateLimitOptions
): Promise<RateLimitResult | null> {
  try {
    const pipelineUrl = `${url.replace(/\/$/, "")}/pipeline`;
    // Atomic multi-command pipeline:
    // 1. INCR key
    // 2. EXPIRE key windowSeconds NX (atomically sets expiry only on first increment)
    // 3. TTL key (returns remaining lifetime)
    const res = await fetch(pipelineUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, options.windowSeconds, "NX"],
        ["TTL", key],
      ]),
      signal: AbortSignal.timeout(2000),
    });

    if (!res.ok) {
      return null;
    }

    const data = (await res.json()) as Array<{ result?: unknown; error?: string }>;
    if (!Array.isArray(data) || data.length < 3) {
      return null;
    }

    const count = Number(data[0].result);
    const ttlRaw = Number(data[2].result);
    const resetSeconds = ttlRaw > 0 ? ttlRaw : options.windowSeconds;

    if (count > options.maxRequests) {
      return {
        allowed: false,
        limit: options.maxRequests,
        remaining: 0,
        resetSeconds,
        retryAfterSeconds: resetSeconds,
      };
    }

    return {
      allowed: true,
      limit: options.maxRequests,
      remaining: Math.max(0, options.maxRequests - count),
      resetSeconds,
    };
  } catch {
    return null;
  }
}

export async function checkRateLimit(
  key: string,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  // Check for Vercel KV / Upstash Redis REST credentials
  const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (redisUrl && redisToken) {
    const remoteResult = await checkUpstashAtomic(redisUrl, redisToken, key, options);
    if (remoteResult) {
      return remoteResult;
    }

    // Fail closed in public_demo if strict shared quota is required and Redis call fails
    if (
      process.env.DEPLOYMENT_MODE === "public_demo" &&
      process.env.REQUIRE_SHARED_QUOTA === "true"
    ) {
      return {
        allowed: false,
        limit: options.maxRequests,
        remaining: 0,
        resetSeconds: 60,
        retryAfterSeconds: 60,
      };
    }
  }

  // Fallback to in-memory sliding window
  return checkInMemoryRateLimit(key, options);
}

export async function enforceRateLimit(
  request: Request,
  endpoint: "analyze" | "correction",
  customOptions?: Partial<RateLimitOptions>
): Promise<RateLimitResult> {
  const ip = getClientIp(request);
  const key = hashClientKey(ip, endpoint);

  const defaultMax =
    endpoint === "analyze"
      ? Number(process.env.RATE_LIMIT_ANALYZE_MAX) || 30
      : Number(process.env.RATE_LIMIT_CORRECTION_MAX) || 20;

  const defaultWindow = Number(process.env.RATE_LIMIT_WINDOW_SECONDS) || 60;

  const options: RateLimitOptions = {
    maxRequests: customOptions?.maxRequests ?? defaultMax,
    windowSeconds: customOptions?.windowSeconds ?? defaultWindow,
  };

  return checkRateLimit(key, options);
}

export async function enforceGlobalAIBudget(
  endpoint: "analyze" | "correction",
  customBudget?: number
): Promise<RateLimitResult> {
  const budgetLimit =
    customBudget ??
    (Number(process.env.GLOBAL_AI_MAX_REQUESTS) || 300);

  const todayKey = `mm_global_ai_budget:${new Date().toISOString().slice(0, 10)}`;
  const windowSeconds = 86400; // 24 hours

  const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (redisUrl && redisToken) {
    const remoteResult = await checkUpstashAtomic(redisUrl, redisToken, todayKey, {
      maxRequests: budgetLimit,
      windowSeconds,
    });
    if (remoteResult) {
      if (!remoteResult.allowed) {
        return { ...remoteResult, isBudgetExceeded: true };
      }
      return remoteResult;
    }

    if (
      process.env.DEPLOYMENT_MODE === "public_demo" &&
      process.env.REQUIRE_SHARED_QUOTA === "true"
    ) {
      return {
        allowed: false,
        limit: budgetLimit,
        remaining: 0,
        resetSeconds: windowSeconds,
        retryAfterSeconds: windowSeconds,
        isBudgetExceeded: true,
      };
    }
  }

  // In-memory global budget fallback
  const now = Date.now();
  let entry = inMemoryBudgetStore.get(todayKey);
  if (!entry || entry.expiresAt < now) {
    entry = { count: 0, expiresAt: now + windowSeconds * 1000 };
    inMemoryBudgetStore.set(todayKey, entry);
  }

  entry.count += 1;
  const remaining = Math.max(0, budgetLimit - entry.count);
  const resetSeconds = Math.ceil((entry.expiresAt - now) / 1000);

  if (entry.count > budgetLimit) {
    return {
      allowed: false,
      limit: budgetLimit,
      remaining: 0,
      resetSeconds,
      retryAfterSeconds: resetSeconds,
      isBudgetExceeded: true,
    };
  }

  return {
    allowed: true,
    limit: budgetLimit,
    remaining,
    resetSeconds,
  };
}
