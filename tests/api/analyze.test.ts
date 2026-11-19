import { describe, it, expect } from "vitest";
import { POST } from "../../src/app/api/analyze/route";
import { GET } from "../../src/app/api/health/route";
import { NextRequest } from "next/server";
import requestExample from "../../docs/examples/request.json";
import devFixtures from "../../src/fixtures/development.json";
import { validateItemComparisons } from "../../src/lib/core/evidence";
import { QuestionItem, ProviderResultItem } from "../../src/lib/contracts/types";

function createPostRequest(body: unknown, headers: Record<string, string> = {}): NextRequest {
  const serialized = typeof body === "string" ? body : JSON.stringify(body);
  return new NextRequest("http://localhost:3000/api/analyze", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...headers,
    },
    body: serialized,
  });
}

describe("API Routes", () => {
  describe("GET /api/health", () => {
    it("returns 200 with no-store and safe health metadata", async () => {
      const res = await GET();
      expect(res.status).toBe(200);
      expect(res.headers.get("cache-control")).toBe("no-store");
      const json = await res.json();
      expect(json.status).toBe("ok");
      expect(typeof json.aiConfigured).toBe("boolean");
      expect(["public_demo", "local"]).toContain(json.deploymentMode);
    });
  });

  describe("POST /api/analyze", () => {
    it("rejects non-JSON requests with 415 UNSUPPORTED_MEDIA_TYPE", async () => {
      const req = new NextRequest("http://localhost:3000/api/analyze", {
        method: "POST",
        headers: { "content-type": "text/plain" },
        body: "Hello world",
      });
      const res = await POST(req);
      expect(res.status).toBe(415);
      const json = await res.json();
      expect(json.error.code).toBe("UNSUPPORTED_MEDIA_TYPE");
    });

    it("rejects oversized body (>64,000 bytes) with 413 BODY_TOO_LARGE", async () => {
      const largePayload = {
        ...requestExample,
        items: [
          {
            ...requestExample.items[0],
            en: {
              ...requestExample.items[0].en,
              stem: "A".repeat(65000),
            },
          },
        ],
      };
      const req = createPostRequest(largePayload);
      const res = await POST(req);
      expect(res.status).toBe(413);
      const json = await res.json();
      expect(json.error.code).toBe("BODY_TOO_LARGE");
    });

    it("rejects missing consent in AI mode with 422 CONSENT_REQUIRED", async () => {
      const payloadWithoutConsent = {
        ...requestExample,
        mode: "ai",
        consent: false,
      };
      const req = createPostRequest(payloadWithoutConsent);
      const res = await POST(req);
      expect(res.status).toBe(422);
      const json = await res.json();
      expect(json.error.code).toBe("CONSENT_REQUIRED");
    });

    it("runs structural rules directly in rules mode", async () => {
      const rulesPayload = {
        ...requestExample,
        mode: "rules",
      };
      const req = createPostRequest(rulesPayload);
      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.mode).toBe("rules_only");
      expect(json.providerStatus).toBe("not_requested");
      expect(json.items.length).toBe(1);
      expect(json.items[0].id).toBe("DEV_NEGATION");
      expect(json.items[0].status).toBe("needs_review");
    });

    // REGRESSION TEST: In rules-only mode, clean questions must NEVER return no_issue_found
    it("regression test: rules-only mode returns needs_review even on clean questions to prevent false semantic clear", async () => {
      const devClean = devFixtures.find((i) => i.id === "DEV_CLEAN");
      expect(devClean).toBeDefined();

      const rulesCleanPayload = {
        ...requestExample,
        mode: "rules",
        items: [devClean],
      };

      const req = createPostRequest(rulesCleanPayload);
      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.mode).toBe("rules_only");
      expect(json.providerStatus).toBe("not_requested");
      expect(json.items.length).toBe(1);
      expect(json.items[0].id).toBe("DEV_CLEAN");
      expect(json.items[0].structuralFindings).toEqual([]);
      // Crucial: Must be needs_review, never no_issue_found
      expect(json.items[0].status).toBe("needs_review");
      expect(json.items[0].comparisons).toEqual([]);
    });

    // Verify live-AI clean results with complete validated comparisons still produce no_issue_found
    it("preserves no_issue_found for live-AI clean results with complete validated comparisons", () => {
      const devClean = devFixtures.find((i) => i.id === "DEV_CLEAN") as QuestionItem;
      const cleanAiOutput: ProviderResultItem = {
        itemId: "DEV_CLEAN",
        comparisons: [
          {
            field: { kind: "stem", label: null },
            relation: "equivalent",
            enQuote: "Which is a prime number?",
            taQuote: "பகா எண் எது?",
            reasonCode: "equivalent",
            explanation: "Meaning preserved.",
          },
          {
            field: { kind: "option", label: "A" },
            relation: "equivalent",
            enQuote: "2",
            taQuote: "2",
            reasonCode: "equivalent",
            explanation: "Preserved.",
          },
          {
            field: { kind: "option", label: "B" },
            relation: "equivalent",
            enQuote: "4",
            taQuote: "4",
            reasonCode: "equivalent",
            explanation: "Preserved.",
          },
          {
            field: { kind: "option", label: "C" },
            relation: "equivalent",
            enQuote: "6",
            taQuote: "6",
            reasonCode: "equivalent",
            explanation: "Preserved.",
          },
          {
            field: { kind: "option", label: "D" },
            relation: "equivalent",
            enQuote: "8",
            taQuote: "8",
            reasonCode: "equivalent",
            explanation: "Preserved.",
          },
        ],
      };

      const val = validateItemComparisons(devClean, cleanAiOutput, []);
      expect(val.valid).toBe(true);
      expect(val.status).toBe("no_issue_found");
    });

    it("handles AI mode when AI key is absent with safe fallback to rules_only and needs_review", async () => {
      const aiPayload = {
        ...requestExample,
        mode: "ai",
        consent: true,
      };
      const req = createPostRequest(aiPayload);
      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.mode).toBe("rules_only");
      expect(["unavailable", "ok"]).toContain(json.providerStatus);
      expect(json.items[0].status).toBe("needs_review");
    });
  });
});
