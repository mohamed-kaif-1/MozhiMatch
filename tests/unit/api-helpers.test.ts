import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { z } from "zod";
import {
  createErrorResponse,
  createRateLimitHeaders,
  createRateLimitBlockedHeaders,
  validateContentType,
  parseAndValidateJsonBody,
} from "../../src/lib/server/api-helpers";

describe("Server API Helpers", () => {
  describe("createErrorResponse", () => {
    it("constructs standard error JSON with specified status code", async () => {
      const res = createErrorResponse(403, "FORBIDDEN_ORIGIN", "errors.forbiddenOrigin", "req-123");
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json).toEqual({
        error: {
          code: "FORBIDDEN_ORIGIN",
          messageKey: "errors.forbiddenOrigin",
          requestId: "req-123",
        },
      });
    });

    it("attaches custom headers when provided", () => {
      const res = createErrorResponse(429, "RATE_LIMITED", "errors.rateLimited", null, {
        "Retry-After": "60",
      });
      expect(res.headers.get("Retry-After")).toBe("60");
    });
  });

  describe("createRateLimitHeaders", () => {
    it("formats standard rate limit headers correctly", () => {
      const headers = createRateLimitHeaders({
        allowed: true,
        limit: 10,
        remaining: 9,
        resetSeconds: 60,
      });
      expect(headers["X-RateLimit-Limit"]).toBe("10");
      expect(headers["X-RateLimit-Remaining"]).toBe("9");
      expect(headers["X-RateLimit-Reset"]).toBe("60");
    });

    it("formats blocked rate limit headers with Retry-After", () => {
      const headers = createRateLimitBlockedHeaders({
        allowed: false,
        limit: 10,
        remaining: 0,
        resetSeconds: 45,
        retryAfterSeconds: 45,
      });
      expect(headers["Retry-After"]).toBe("45");
      expect(headers["X-RateLimit-Remaining"]).toBe("0");
    });
  });

  describe("validateContentType", () => {
    it("returns 415 response for non-JSON content type", async () => {
      const req = new NextRequest("http://localhost:3000/api/analyze", {
        headers: { "content-type": "text/html" },
      });
      const err = validateContentType(req);
      expect(err).not.toBeNull();
      expect(err?.status).toBe(415);
      const json = await err?.json();
      expect(json.error.code).toBe("UNSUPPORTED_MEDIA_TYPE");
    });

    it("returns null for application/json content type", () => {
      const req = new NextRequest("http://localhost:3000/api/analyze", {
        headers: { "content-type": "application/json; charset=utf-8" },
      });
      const err = validateContentType(req);
      expect(err).toBeNull();
    });
  });

  describe("parseAndValidateJsonBody", () => {
    const TestSchema = z.object({
      name: z.string().max(10),
      count: z.number().int(),
    });

    it("parses valid JSON matching schema", async () => {
      const req = new NextRequest("http://localhost:3000/api/test", {
        method: "POST",
        body: JSON.stringify({ name: "Mozhi", count: 42 }),
      });
      const result = await parseAndValidateJsonBody(req, TestSchema);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ name: "Mozhi", count: 42 });
      }
    });

    it("rejects malformed JSON with 400 INVALID_REQUEST", async () => {
      const req = new NextRequest("http://localhost:3000/api/test", {
        method: "POST",
        body: "{ malformed json",
      });
      const result = await parseAndValidateJsonBody(req, TestSchema);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.response.status).toBe(400);
      }
    });

    it("rejects schema mismatch with 422 INVALID_REQUEST", async () => {
      const req = new NextRequest("http://localhost:3000/api/test", {
        method: "POST",
        body: JSON.stringify({ name: "WayTooLongStringHere", count: 42 }),
      });
      const result = await parseAndValidateJsonBody(req, TestSchema);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.response.status).toBe(422);
      }
    });
  });
});

