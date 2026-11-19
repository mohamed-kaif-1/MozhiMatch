import { describe, it, expect } from "vitest";
import {
  AnalyzeRequestSchema,
  AnalyzeResponseSchema,
  ErrorResponseSchema,
  QuestionItemSchema,
} from "../../src/lib/contracts/schemas";
import requestExample from "../../03_BACKEND/examples/request.json";
import responseExample from "../../03_BACKEND/examples/response.json";
import fallbackExample from "../../03_BACKEND/examples/fallback.json";
import errorExample from "../../03_BACKEND/examples/error.json";
import devFixtures from "../../10_TESTING/fixtures/development.json";

describe("Contracts and Schemas", () => {
  it("validates request.json example", () => {
    const result = AnalyzeRequestSchema.safeParse(requestExample);
    expect(result.success).toBe(true);
  });

  it("validates response.json example", () => {
    const result = AnalyzeResponseSchema.safeParse(responseExample);
    expect(result.success).toBe(true);
  });

  it("validates fallback.json example", () => {
    const result = AnalyzeResponseSchema.safeParse(fallbackExample);
    expect(result.success).toBe(true);
  });

  it("validates error.json example", () => {
    const result = ErrorResponseSchema.safeParse(errorExample);
    expect(result.success).toBe(true);
  });

  it("validates development fixtures", () => {
    for (const item of devFixtures) {
      const result = QuestionItemSchema.safeParse(item);
      expect(result.success).toBe(true);
    }
  });

  it("rejects unknown properties in request (strict)", () => {
    const mutated = { ...requestExample, unexpectedProperty: "bad" };
    const result = AnalyzeRequestSchema.safeParse(mutated);
    expect(result.success).toBe(false);
  });

  it("rejects duplicate item IDs", () => {
    const item1 = devFixtures[0];
    const duplicated = {
      ...requestExample,
      items: [item1, item1],
    };
    const result = AnalyzeRequestSchema.safeParse(duplicated);
    expect(result.success).toBe(false);
  });

  it("rejects whitespace-only stem text", () => {
    const invalidItem = {
      ...devFixtures[0],
      en: {
        ...devFixtures[0].en,
        stem: "    \n   ",
      },
    };
    const result = QuestionItemSchema.safeParse(invalidItem);
    expect(result.success).toBe(false);
  });
});

