import { describe, it, expect, beforeEach } from "vitest";
import {
  checkInMemoryRateLimit,
  getClientIp,
  hashClientKey,
  resetRateLimitStore,
} from "../../src/lib/server/ratelimit";

describe("Rate Limiter Unit Tests", () => {
  beforeEach(() => {
    resetRateLimitStore();
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
});

