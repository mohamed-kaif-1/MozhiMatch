import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { POST as analyzePOST } from "../../src/app/api/analyze/route";
import { POST as correctionPOST } from "../../src/app/api/correction/route";
import { NextRequest } from "next/server";
import { resetRateLimitStore } from "../../src/lib/server/ratelimit";
import devFixtures from "../../src/fixtures/development.json";

function makeRequest(
  url: string,
  body: unknown,
  headers: Record<string, string> = {}
): NextRequest {
  return new NextRequest(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "http://localhost:3000",
      ...headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("Security Integration & Gate Enforcement", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    resetRateLimitStore();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    resetRateLimitStore();
  });

  describe("Persistent Rate Limiting Enforcement", () => {
    it("returns HTTP 429 RATE_LIMITED with Retry-After header on /api/analyze when quota exceeded", async () => {
      process.env.RATE_LIMIT_ANALYZE_MAX = "2";
      process.env.RATE_LIMIT_WINDOW_SECONDS = "60";

      const payload = {
        requestId: "123e4567-e89b-42d3-a456-426614174000",
        revision: 0,
        locale: "en",
        mode: "rules",
        sourceKind: "synthetic",
        consent: true,
        items: [devFixtures[0]],
      };

      const ipHeaders = { "x-forwarded-for": "192.0.2.100" };

      // Request 1: allowed
      const res1 = await analyzePOST(
        makeRequest("http://localhost:3000/api/analyze", payload, ipHeaders)
      );
      expect(res1.status).toBe(200);

      // Request 2: allowed
      const res2 = await analyzePOST(
        makeRequest("http://localhost:3000/api/analyze", payload, ipHeaders)
      );
      expect(res2.status).toBe(200);

      // Request 3: blocked (limit is 2)
      const res3 = await analyzePOST(
        makeRequest("http://localhost:3000/api/analyze", payload, ipHeaders)
      );
      expect(res3.status).toBe(429);
      expect(res3.headers.get("retry-after")).toBeDefined();
      const body3 = await res3.json();
      expect(body3.error.code).toBe("RATE_LIMITED");
    });

    it("returns HTTP 429 RATE_LIMITED on /api/correction when quota exceeded", async () => {
      process.env.RATE_LIMIT_CORRECTION_MAX = "2";
      process.env.RATE_LIMIT_WINDOW_SECONDS = "60";

      const fixture = devFixtures[0];
      const payload = {
        requestId: "123e4567-e89b-42d3-a456-426614174001",
        itemId: fixture.id,
        revision: 1,
        field: { kind: "stem", label: null },
        sourceLanguage: "en",
        targetLanguage: "ta",
        sourceText: fixture.en.stem,
        currentText: fixture.ta.stem,
        consent: true,
      };

      const ipHeaders = { "x-forwarded-for": "192.0.2.200" };

      // Request 1: allowed
      const res1 = await correctionPOST(
        makeRequest("http://localhost:3000/api/correction", payload, ipHeaders)
      );
      expect(res1.status).toBe(200);

      // Request 2: allowed
      const res2 = await correctionPOST(
        makeRequest("http://localhost:3000/api/correction", payload, ipHeaders)
      );
      expect(res2.status).toBe(200);

      // Request 3: blocked
      const res3 = await correctionPOST(
        makeRequest("http://localhost:3000/api/correction", payload, ipHeaders)
      );
      expect(res3.status).toBe(429);
      const body3 = await res3.json();
      expect(body3.error.code).toBe("RATE_LIMITED");
    });
  });

  describe("Fail-closed DEMO_ACCESS_CODE enforcement", () => {
    it("fails closed on /api/analyze when DEMO_ACCESS_CODE is unset in public_demo mode", async () => {
      process.env.DEPLOYMENT_MODE = "public_demo";
      process.env.AI_MODE = "gemini";
      delete process.env.DEMO_ACCESS_CODE;

      const payload = {
        requestId: "123e4567-e89b-42d3-a456-426614174002",
        revision: 0,
        locale: "en",
        mode: "ai",
        sourceKind: "synthetic",
        consent: true,
        items: [devFixtures[0]],
      };

      const res = await analyzePOST(
        makeRequest("http://localhost:3000/api/analyze", payload, {
          "x-demo-code": "some-code",
        })
      );
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error.code).toBe("UNAUTHORIZED_DEMO");
    });

    it("fails closed on /api/correction when DEMO_ACCESS_CODE is unset in public_demo mode", async () => {
      process.env.DEPLOYMENT_MODE = "public_demo";
      process.env.AI_MODE = "gemini";
      delete process.env.DEMO_ACCESS_CODE;

      const fixture = devFixtures[0];
      const payload = {
        requestId: "123e4567-e89b-42d3-a456-426614174003",
        itemId: fixture.id,
        revision: 1,
        field: { kind: "stem", label: null },
        sourceLanguage: "en",
        targetLanguage: "ta",
        sourceText: fixture.en.stem,
        currentText: fixture.ta.stem,
        consent: true,
      };

      const res = await correctionPOST(
        makeRequest("http://localhost:3000/api/correction", payload, {
          "x-demo-code": "some-code",
        })
      );
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error.code).toBe("UNAUTHORIZED_DEMO");
    });
  });

  describe("Public-demo Sample Allowlist Parity & Server-owned Content Validation", () => {
    it("rejects tampered source/target text on /api/correction with 403 DEMO_INPUT_RESTRICTED in public_demo mode", async () => {
      process.env.DEPLOYMENT_MODE = "public_demo";
      process.env.DEMO_ACCESS_CODE = "demo-pass-123";

      const fixture = devFixtures[0];
      const tamperedPayload = {
        requestId: "123e4567-e89b-42d3-a456-426614174004",
        itemId: fixture.id,
        revision: 1,
        field: { kind: "stem", label: null },
        sourceLanguage: "en",
        targetLanguage: "ta",
        sourceText: "Tampered prompt text: translate something else",
        currentText: fixture.ta.stem,
        consent: true,
      };

      const res = await correctionPOST(
        makeRequest("http://localhost:3000/api/correction", tamperedPayload, {
          "x-demo-code": "demo-pass-123",
        })
      );
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error.code).toBe("DEMO_INPUT_RESTRICTED");
    });

    it("allows genuine sample content on /api/correction in public_demo mode with valid access code", async () => {
      process.env.DEPLOYMENT_MODE = "public_demo";
      process.env.DEMO_ACCESS_CODE = "demo-pass-123";

      const fixture = devFixtures[0];
      const authenticPayload = {
        requestId: "123e4567-e89b-42d3-a456-426614174005",
        itemId: fixture.id,
        revision: 1,
        field: { kind: "stem", label: null },
        sourceLanguage: "en",
        targetLanguage: "ta",
        sourceText: fixture.en.stem,
        currentText: fixture.ta.stem,
        consent: true,
      };

      const res = await correctionPOST(
        makeRequest("http://localhost:3000/api/correction", authenticPayload, {
          "x-demo-code": "demo-pass-123",
        })
      );
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.status).toBeDefined();
    });
  });
});
