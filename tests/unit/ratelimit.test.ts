import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  checkInMemoryRateLimit,
  checkUpstashAtomic,
  checkRateLimit,
  enforceGlobalAIBudget,
  getClientIp,
  hashClientKey,
  resetRateLimitStore,
} from "../../src/lib/server/ratelimit";

describe("Rate Limiter Unit Tests", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    resetRateLimitStore();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("extracts client IP from x-forwarded-for header (first address)", () => {
    const req = new Request("http://localhost:3000/api/analyze", {
      headers: {
        "x-forwarded-for": "203.0.113.195, 70.41.3.18, 150.172.238.178",
      },
    });
    expect(getClientIp(req)).toBe("203.0.113.195");
  });

  it("extracts client IP from x-real-ip when x-forwarded-for is missing", () => {
    const req = new Request("http://localhost:3000/api/analyze", {
      headers: {
        "x-real-ip": "198.51.100.42",
      },
    });
    expect(getClientIp(req)).toBe("198.51.100.42");
  });

  it("falls back to 127.0.0.1 when no IP headers are present", () => {
    const req = new Request("http://localhost:3000/api/analyze");
    expect(getClientIp(req)).toBe("127.0.0.1");
  });

  it("hashes IP to a non-reversible, deterministic client key", () => {
    const key1 = hashClientKey("203.0.113.195", "analyze");
    const key2 = hashClientKey("203.0.113.195", "analyze");
    const keyOther = hashClientKey("198.51.100.42", "analyze");

    expect(key1).toBe(key2);
    expect(key1).not.toBe(keyOther);
    expect(key1).toContain("mm_rl:analyze:");
    // Verify raw IP is not in the key
    expect(key1).not.toContain("203.0.113.195");
  });

  it("allows requests within quota and decrements remaining count", () => {
    const key = "test_client_allow";
    const options = { maxRequests: 3, windowSeconds: 60 };

    const r1 = checkInMemoryRateLimit(key, options);
    expect(r1.allowed).toBe(true);
    expect(r1.limit).toBe(3);
    expect(r1.remaining).toBe(2);

    const r2 = checkInMemoryRateLimit(key, options);
    expect(r2.allowed).toBe(true);
    expect(r2.remaining).toBe(1);

    const r3 = checkInMemoryRateLimit(key, options);
    expect(r3.allowed).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it("blocks requests once quota is exhausted and reports retryAfterSeconds", () => {
    const key = "test_client_block";
    const options = { maxRequests: 2, windowSeconds: 60 };

    checkInMemoryRateLimit(key, options);
    checkInMemoryRateLimit(key, options);

    const blocked = checkInMemoryRateLimit(key, options);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    expect(blocked.retryAfterSeconds).toBeLessThanOrEqual(60);
  });

  it("resets store correctly on resetRateLimitStore", () => {
    const key = "test_client_reset";
    const options = { maxRequests: 1, windowSeconds: 60 };

    checkInMemoryRateLimit(key, options);
    expect(checkInMemoryRateLimit(key, options).allowed).toBe(false);

    resetRateLimitStore();
    expect(checkInMemoryRateLimit(key, options).allowed).toBe(true);
  });

  describe("Upstash Redis Atomic Lua Transaction", () => {
    it("executes atomic EVAL command and parses valid [count, ttl] response", async () => {
      let interceptedBody: unknown = null;
      vi.spyOn(globalThis, "fetch").mockImplementation(async (url, init) => {
        interceptedBody = JSON.parse(init?.body as string);
        return new Response(JSON.stringify({ result: [2, 45] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      });

      const res = await checkUpstashAtomic(
        "https://test-redis.upstash.io",
        "mock-token",
        "mm_rl:test:key",
        { maxRequests: 5, windowSeconds: 60 }
      );

      expect(res).not.toBeNull();
      expect(res?.allowed).toBe(true);
      expect(res?.limit).toBe(5);
      expect(res?.remaining).toBe(3); // 5 - 2
      expect(res?.resetSeconds).toBe(45);

      // Verify command sent was EVAL with script, 1 key, and windowSeconds
      expect(Array.isArray(interceptedBody)).toBe(true);
      const cmd = interceptedBody as unknown[];
      expect(cmd[0]).toBe("EVAL");
      expect(cmd[2]).toBe(1);
      expect(cmd[3]).toBe("mm_rl:test:key");
      expect(cmd[4]).toBe("60");
    });

    it("blocks request when atomic count exceeds limit", async () => {
      vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
        return new Response(JSON.stringify({ result: [6, 30] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      });

      const res = await checkUpstashAtomic(
        "https://test-redis.upstash.io",
        "mock-token",
        "mm_rl:test:key",
        { maxRequests: 5, windowSeconds: 60 }
      );

      expect(res).not.toBeNull();
      expect(res?.allowed).toBe(false);
      expect(res?.remaining).toBe(0);
      expect(res?.resetSeconds).toBe(30);
      expect(res?.retryAfterSeconds).toBe(30);
    });

    it("returns null on non-200, Redis error, or invalid result format", async () => {
      // 1. Non-200
      vi.spyOn(globalThis, "fetch").mockImplementationOnce(async () => {
        return new Response("Unauthorized", { status: 401 });
      });
      const r1 = await checkUpstashAtomic(
        "https://test-redis.upstash.io",
        "bad-token",
        "key",
        { maxRequests: 5, windowSeconds: 60 }
      );
      expect(r1).toBeNull();

      // 2. Redis error object
      vi.spyOn(globalThis, "fetch").mockImplementationOnce(async () => {
        return new Response(JSON.stringify({ error: "ERR syntax error" }), { status: 200 });
      });
      const r2 = await checkUpstashAtomic(
        "https://test-redis.upstash.io",
        "token",
        "key",
        { maxRequests: 5, windowSeconds: 60 }
      );
      expect(r2).toBeNull();

      // 3. Invalid result array
      vi.spyOn(globalThis, "fetch").mockImplementationOnce(async () => {
        return new Response(JSON.stringify({ result: "not-an-array" }), { status: 200 });
      });
      const r3 = await checkUpstashAtomic(
        "https://test-redis.upstash.io",
        "token",
        "key",
        { maxRequests: 5, windowSeconds: 60 }
      );
      expect(r3).toBeNull();
    });
  });

  describe("Fail-Closed Behavior for Shared Quota", () => {
    it("fails closed when requireSharedQuota is true and credentials are missing", async () => {
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
      delete process.env.KV_REST_API_URL;
      delete process.env.KV_REST_API_TOKEN;

      const res = await checkRateLimit("test_key", {
        maxRequests: 10,
        windowSeconds: 60,
        requireSharedQuota: true,
      });

      expect(res.allowed).toBe(false);
      expect(res.isSharedQuotaUnavailable).toBe(true);
      expect(res.remaining).toBe(0);
    });

    it("fails closed when requireSharedQuota is true and Redis call fails", async () => {
      process.env.UPSTASH_REDIS_REST_URL = "https://redis.example.com";
      process.env.UPSTASH_REDIS_REST_TOKEN = "valid-token";

      vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network timeout"));

      const res = await checkRateLimit("test_key", {
        maxRequests: 10,
        windowSeconds: 60,
        requireSharedQuota: true,
      });

      expect(res.allowed).toBe(false);
      expect(res.isSharedQuotaUnavailable).toBe(true);
    });

    it("fails closed on global budget when requireSharedQuota is true and credentials missing", async () => {
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
      delete process.env.KV_REST_API_URL;
      delete process.env.KV_REST_API_TOKEN;

      const res = await enforceGlobalAIBudget("analyze", {
        requireSharedQuota: true,
      });

      expect(res.allowed).toBe(false);
      expect(res.isSharedQuotaUnavailable).toBe(true);
      expect(res.isBudgetExceeded).toBe(true);
    });

    it("allows fallback to in-memory store when requireSharedQuota is false", async () => {
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
      delete process.env.KV_REST_API_URL;
      delete process.env.KV_REST_API_TOKEN;

      const res = await checkRateLimit("test_local_key", {
        maxRequests: 5,
        windowSeconds: 60,
        requireSharedQuota: false,
      });

      expect(res.allowed).toBe(true);
      expect(res.remaining).toBe(4);
    });
  });
});

