import "server-only";
import crypto from "crypto";

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
  retryAfterSeconds?: number;
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

export function resetRateLimitStore(): void {
  inMemoryStore.clear();
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

async function checkUpstashRateLimit(
  url: string,
  token: string,
  key: string,
  options: RateLimitOptions
): Promise<RateLimitResult | null> {
  try {
    const pipelineUrl = `${url.replace(/\/$/, "")}/pipeline`;
    const res = await fetch(pipelineUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", key],
        ["TTL", key],
      ]),
      signal: AbortSignal.timeout(1500),
    });

    if (!res.ok) {
      return null;
    }

    const data = (await res.json()) as Array<{ result?: unknown; error?: string }>;
    if (!Array.isArray(data) || data.length < 2) {
      return null;
    }

    const count = Number(data[0].result);
    let ttl = Number(data[1].result);

    // If key has no expiration set (-1), set it to the window
    if (ttl === -1 || ttl === -2) {
      ttl = options.windowSeconds;
      fetch(`${url.replace(/\/$/, "")}/expire/${encodeURIComponent(key)}/${options.windowSeconds}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(1000),
      }).catch(() => {});
    }

    const resetSeconds = ttl > 0 ? ttl : options.windowSeconds;

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
    const remoteResult = await checkUpstashRateLimit(redisUrl, redisToken, key, options);
    if (remoteResult) {
      return remoteResult;
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

