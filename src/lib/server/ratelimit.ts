import "server-only";
import crypto from "crypto";

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
  retryAfterSeconds?: number;
  isBudgetExceeded?: boolean;
  isSharedQuotaUnavailable?: boolean;
}

export interface RateLimitOptions {
  maxRequests: number;
  windowSeconds: number;
}

export interface CheckRateLimitOptions extends RateLimitOptions {
  requireSharedQuota?: boolean;
}

interface WindowEntry {
  timestamps: number[];
}

// In-memory sliding window cache for local development and warm serverless containers
const inMemoryStore = new Map<string, WindowEntry>();

// Global budget in-memory counter
const inMemoryBudgetStore = new Map<string, { count: number; expiresAt: number }>();

// Atomic rate limit Lua script for Redis
// Executes INCR, sets EXPIRE on first increment, and retrieves TTL atomically
const LUA_RATE_LIMIT_SCRIPT = `
local current = redis.call('INCR', KEYS[1])
if current == 1 then
  redis.call('EXPIRE', KEYS[1], ARGV[1])
end
local ttl = redis.call('TTL', KEYS[1])
if ttl < 0 then
  redis.call('EXPIRE', KEYS[1], ARGV[1])
  ttl = tonumber(ARGV[1])
end
return {current, ttl}
`;

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

export async function checkUpstashAtomic(
  url: string,
  token: string,
  key: string,
  options: RateLimitOptions
): Promise<RateLimitResult | null> {
  try {
    const rootUrl = url.replace(/\/pipeline\/?$/, "").replace(/\/$/, "");
    // Genuine atomic Redis transaction via EVAL Lua script:
    // 1. Atomically increments key
    // 2. Sets EXPIRE only on first increment
    // 3. Atomically checks TTL, re-arming expiration if missing
    // 4. Returns {current, ttl} atomically without race conditions
    const res = await fetch(rootUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        "EVAL",
        LUA_RATE_LIMIT_SCRIPT,
        1,
        key,
        String(options.windowSeconds),
      ]),
      signal: AbortSignal.timeout(2000),
    });

    if (!res.ok) {
      return null;
    }

    const data = (await res.json()) as { result?: unknown; error?: string };
    if (!data || typeof data !== "object" || data.error) {
      return null;
    }

    if (!Array.isArray(data.result) || data.result.length < 2) {
      return null;
    }

    const count = Number(data.result[0]);
    const ttlRaw = Number(data.result[1]);

    if (!Number.isFinite(count) || !Number.isFinite(ttlRaw) || count < 1) {
      return null;
    }

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
  options: CheckRateLimitOptions
): Promise<RateLimitResult> {
  const isSharedRequired = Boolean(
    options.requireSharedQuota ||
    process.env.REQUIRE_SHARED_QUOTA === "true"
  );

  const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  // Fail closed if shared quota is required but credentials are missing or empty
  if (isSharedRequired && (!redisUrl || !redisToken || !redisUrl.trim() || !redisToken.trim())) {
    return {
      allowed: false,
      limit: options.maxRequests,
      remaining: 0,
      resetSeconds: options.windowSeconds,
      retryAfterSeconds: options.windowSeconds,
      isSharedQuotaUnavailable: true,
    };
  }

  if (redisUrl && redisToken && redisUrl.trim() && redisToken.trim()) {
    const remoteResult = await checkUpstashAtomic(redisUrl, redisToken, key, options);
    if (remoteResult) {
      return remoteResult;
    }

    // Fail closed if shared quota is required and Redis call fails or returns error
    if (isSharedRequired) {
      return {
        allowed: false,
        limit: options.maxRequests,
        remaining: 0,
        resetSeconds: options.windowSeconds,
        retryAfterSeconds: options.windowSeconds,
        isSharedQuotaUnavailable: true,
      };
    }
  }

  // Fallback to in-memory sliding window only when shared quota is not strictly required
  return checkInMemoryRateLimit(key, options);
}

export async function enforceRateLimit(
  request: Request,
  endpoint: "analyze" | "correction",
  customOptions?: Partial<CheckRateLimitOptions>
): Promise<RateLimitResult> {
  const ip = getClientIp(request);
  const key = hashClientKey(ip, endpoint);

  const defaultMax =
    endpoint === "analyze"
      ? Number(process.env.RATE_LIMIT_ANALYZE_MAX) || 30
      : Number(process.env.RATE_LIMIT_CORRECTION_MAX) || 20;

  const defaultWindow = Number(process.env.RATE_LIMIT_WINDOW_SECONDS) || 60;

  const options: CheckRateLimitOptions = {
    maxRequests: customOptions?.maxRequests ?? defaultMax,
    windowSeconds: customOptions?.windowSeconds ?? defaultWindow,
    requireSharedQuota: customOptions?.requireSharedQuota,
  };

  return checkRateLimit(key, options);
}

export async function enforceGlobalAIBudget(
  endpoint: "analyze" | "correction",
  options?: {
    customBudget?: number;
    requireSharedQuota?: boolean;
  }
): Promise<RateLimitResult> {
  const budgetLimit =
    options?.customBudget ??
    (Number(process.env.GLOBAL_AI_MAX_REQUESTS) || 300);

  const todayKey = `mm_global_ai_budget:${new Date().toISOString().slice(0, 10)}`;
  const windowSeconds = 86400; // 24 hours

  const isSharedRequired = Boolean(
    options?.requireSharedQuota ||
    process.env.REQUIRE_SHARED_QUOTA === "true"
  );

  const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  // Fail closed if shared quota is required but credentials are missing or empty
  if (isSharedRequired && (!redisUrl || !redisToken || !redisUrl.trim() || !redisToken.trim())) {
    return {
      allowed: false,
      limit: budgetLimit,
      remaining: 0,
      resetSeconds: windowSeconds,
      retryAfterSeconds: windowSeconds,
      isBudgetExceeded: true,
      isSharedQuotaUnavailable: true,
    };
  }

  if (redisUrl && redisToken && redisUrl.trim() && redisToken.trim()) {
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

    // Fail closed if shared quota is required and Redis call fails
    if (isSharedRequired) {
      return {
        allowed: false,
        limit: budgetLimit,
        remaining: 0,
        resetSeconds: windowSeconds,
        retryAfterSeconds: windowSeconds,
        isBudgetExceeded: true,
        isSharedQuotaUnavailable: true,
      };
    }
  }

  // In-memory global budget fallback only when shared quota is not strictly required
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
