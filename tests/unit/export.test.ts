import { describe, it, expect } from "vitest";
import { formatReviewSummary } from "../../src/lib/core/export";
import devFixtures from "../../10_TESTING/fixtures/development.json";
import { QuestionItem, AnalyzeResponse } from "../../src/lib/contracts/types";

describe("Review Summary Formatter", () => {
  it("formats items, findings, citations and human decisions into readable plain text", () => {
    const item = devFixtures[0] as QuestionItem;
    const mockResponse: AnalyzeResponse = {
      requestId: "123e4567-e89b-42d3-a456-426614174000",
      revision: 0,
      mode: "live_ai",
      model: "gemini-2.5-flash",
      providerStatus: "ok",
      warnings: [],
      items: [
        {
          id: item.id,
          status: "meaning_changed",
          structuralFindings: [],
          comparisons: [
            {
              field: { kind: "stem", label: null },
              relation: "different",
              en: { start: 0, end: 48, text: item.en.stem },
              ta: { start: 0, end: 44, text: item.ta.stem },
              reasonCode: "negation",
              explanation: "Negation dropped in Tamil.",
              evidenceValid: true,
            },
          ],
        },
      ],
    };

    const decisions = {
      [item.id]: {
        stem: "fix" as const,
      },
    };

    const output = formatReviewSummary([item], mockResponse, decisions);
    expect(output).toContain("MOZHIMATCH MCQ PREFLIGHT REVIEW");
    expect(output).toContain("DEV_NEGATION");
    expect(output).toContain("STATUS: MEANING_CHANGED");
    expect(output).toContain("Reviewer Decision: FIX");
    expect(output).toContain("Negation dropped in Tamil");
  });
});
