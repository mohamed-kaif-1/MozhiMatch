import { describe, it, expect } from "vitest";
import { POST } from "../../src/app/api/correction/route";
import { NextRequest } from "next/server";
import { CorrectionRequest } from "../../src/lib/contracts/correction";

function createCorrectionPostRequest(
  body: unknown,
  headers: Record<string, string> = {}
): NextRequest {
  const serialized = typeof body === "string" ? body : JSON.stringify(body);
  return new NextRequest("http://localhost:3000/api/correction", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "http://localhost:3000",
      ...headers,
    },
    body: serialized,
  });
}

describe("POST /api/correction", () => {
  const validPayload: CorrectionRequest = {
    requestId: "123e4567-e89b-42d3-a456-426614174000",
    itemId: "DEV_NEGATION",
    revision: 1,
    field: { kind: "stem", label: null },
    sourceLanguage: "en",
    targetLanguage: "ta",
    sourceText: "Which of these is NOT an operating system?",
    currentText: "பின்வருவனவற்றில் இயக்க முறைமை எது?",
    findingExplanation: "The word corresponding to NOT was missing.",
    reasonCode: "different",
    consent: true,
  };

  it("rejects non-JSON requests with 415 UNSUPPORTED_MEDIA_TYPE", async () => {
    const req = new NextRequest("http://localhost:3000/api/correction", {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: "not json",
    });
    const res = await POST(req);
    expect(res.status).toBe(415);
    const json = await res.json();
    expect(json.error.code).toBe("UNSUPPORTED_MEDIA_TYPE");
  });

  it("rejects oversized requests with 413 BODY_TOO_LARGE", async () => {
    const largeReq = {
      ...validPayload,
      sourceText: "x".repeat(65000),
    };
    const req = createCorrectionPostRequest(largeReq);
    const res = await POST(req);
    expect(res.status).toBe(413);
    const json = await res.json();
    expect(json.error.code).toBe("BODY_TOO_LARGE");
  });

  it("rejects malformed JSON with 400 INVALID_REQUEST", async () => {
    const req = new NextRequest("http://localhost:3000/api/correction", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{ invalid json ...",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe("INVALID_REQUEST");
  });

  it("rejects missing consent with 422 CONSENT_REQUIRED", async () => {
    const noConsentPayload = {
      ...validPayload,
      consent: false,
    };
    const req = createCorrectionPostRequest(noConsentPayload);
    const res = await POST(req);
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.error.code).toBe("CONSENT_REQUIRED");
  });

  it("rejects invalid schema with 422 INVALID_REQUEST", async () => {
    const invalidSchemaPayload = {
      ...validPayload,
      requestId: "not-a-uuid",
    };
    const req = createCorrectionPostRequest(invalidSchemaPayload);
    const res = await POST(req);
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.error.code).toBe("INVALID_REQUEST");
  });

  it("returns 200 with valid CorrectionResponse when consent is true", async () => {
    const req = createCorrectionPostRequest(validPayload);
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.requestId).toBe(validPayload.requestId);
    expect(json.itemId).toBe(validPayload.itemId);
    expect(json.field).toEqual(validPayload.field);
    expect(json.targetLanguage).toBe("ta");
    expect(typeof json.status).toBe("string");
    expect(typeof json.suggestedText).toBe("string");
    expect(typeof json.reason).toBe("string");
    expect(json.requiresHumanReview).toBe(true);
  });
});

