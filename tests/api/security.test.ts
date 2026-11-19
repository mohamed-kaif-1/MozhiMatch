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

  describe("Persistent Rate Limiting & Global AI Budget Enforcement", () => {
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

    it("enforces shared global AI request budget limit when exceeded", async () => {
      process.env.GLOBAL_AI_MAX_REQUESTS = "1";

      const fixture = devFixtures[0];
      const payload = {
        requestId: "123e4567-e89b-42d3-a456-426614174099",
        itemId: fixture.id,
        revision: 1,
        field: { kind: "stem", label: null },
        sourceLanguage: "en",
        targetLanguage: "ta",
        sourceText: fixture.en.stem,
        currentText: fixture.ta.stem,
        consent: true,
      };

      // Request 1: within budget
      const res1 = await correctionPOST(
        makeRequest("http://localhost:3000/api/correction", payload, {
          "x-forwarded-for": "10.0.0.1",
        })
      );
      expect(res1.status).toBe(200);

      // Request 2 from a different IP: global budget exhausted
      const res2 = await correctionPOST(
        makeRequest("http://localhost:3000/api/correction", payload, {
          "x-forwarded-for": "10.0.0.2",
        })
      );
      expect(res2.status).toBe(429);
      const json = await res2.json();
      expect(json.error.code).toBe("RATE_LIMITED");
    });
  });

  describe("Public Judge Demo (Password-Free AI) & Private Operator Mode", () => {
    it("allows anonymous judges to run AI on approved sample questions without a password", async () => {
      process.env.DEPLOYMENT_MODE = "public_demo";
      process.env.AI_MODE = "mock";
      process.env.DEMO_ACCESS_CODE = "secret-operator-pass";

      const payload = {
        requestId: "123e4567-e89b-42d3-a456-426614174002",
        revision: 0,
        locale: "en",
        mode: "ai",
        sourceKind: "synthetic",
        consent: true,
        items: [devFixtures[0]],
      };

      // No x-demo-code sent
      const res = await analyzePOST(
        makeRequest("http://localhost:3000/api/analyze", payload)
      );
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.mode).toBeDefined();
    });

    it("allows anonymous judges to request AI corrections on approved sample questions without a password", async () => {
      process.env.DEPLOYMENT_MODE = "public_demo";
      process.env.AI_MODE = "mock";
      process.env.DEMO_ACCESS_CODE = "secret-operator-pass";

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

      // No x-demo-code sent
      const res = await correctionPOST(
        makeRequest("http://localhost:3000/api/correction", payload)
      );
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.status).toBeDefined();
    });

    it("rejects unauthorized custom/tampered questions for anonymous users with 403 DEMO_INPUT_RESTRICTED", async () => {
      process.env.DEPLOYMENT_MODE = "public_demo";
      process.env.AI_MODE = "mock";
      process.env.DEMO_ACCESS_CODE = "secret-operator-pass";

      const customPayload = {
        requestId: "123e4567-e89b-42d3-a456-426614174004",
        revision: 0,
        locale: "en",
        mode: "ai",
        sourceKind: "synthetic",
        consent: true,
        items: [
          {
            id: "CUSTOM_EXAM_99",
            en: {
              stem: "Arbitrary custom question?",
              options: [
                { label: "A", text: "1" },
                { label: "B", text: "2" },
              ],
            },
            ta: {
              stem: "தனிப்பயன் வினா?",
              options: [
                { label: "A", text: "1" },
                { label: "B", text: "2" },
              ],
            },
          },
        ],
      };

      const res = await analyzePOST(
        makeRequest("http://localhost:3000/api/analyze", customPayload)
      );
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error.code).toBe("DEMO_INPUT_RESTRICTED");
    });

    it("rejects invalid operator code with 401 UNAUTHORIZED_DEMO", async () => {
      process.env.DEPLOYMENT_MODE = "public_demo";
      process.env.AI_MODE = "mock";
      process.env.DEMO_ACCESS_CODE = "correct-operator-pass";

      const payload = {
        requestId: "123e4567-e89b-42d3-a456-426614174005",
        revision: 0,
        locale: "en",
        mode: "ai",
        sourceKind: "synthetic",
        consent: true,
        items: [devFixtures[0]],
      };

      const res = await analyzePOST(
        makeRequest("http://localhost:3000/api/analyze", payload, {
          "x-demo-code": "wrong-operator-pass",
        })
      );
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error.code).toBe("UNAUTHORIZED_DEMO");
    });
  });
});
