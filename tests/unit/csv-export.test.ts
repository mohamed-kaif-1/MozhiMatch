import { describe, it, expect } from "vitest";
import {
  generateReviewCsv,
  sanitizeCellForSpreadsheet,
} from "../../src/lib/core/csv-export";
import { QuestionItem, AnalyzeResponse } from "../../src/lib/contracts/types";

describe("CSV Export Module", () => {
  const sampleItems: QuestionItem[] = [
    {
      id: "Q1",
      en: {
        stem: "=SUM(1,3) question stem", // Formula candidate in stem
        options: [
          { label: "A", text: "3" },
          { label: "B", text: "4" },
        ],
      },
      ta: {
        stem: "2+2 என்ன?",
        options: [
          { label: "A", text: "3" },
          { label: "B", text: "4" },
        ],
      },
    },
    {
      id: "Q2",
      en: {
        stem: "Clean question stem",
        options: [
          { label: "A", text: "Apple" },
          { label: "B", text: "Banana" },
        ],
      },
      ta: {
        stem: "சரியான கேள்வி",
        options: [
          { label: "A", text: "ஆப்பிள்" },
          { label: "B", text: "வாழைப்பழம்" },
        ],
      },
    },
  ];

  it("sanitizes formula injection prefixes without mutating non-formula text", () => {
    expect(sanitizeCellForSpreadsheet("=SUM(A1:B1)")).toBe("'=SUM(A1:B1)");
    expect(sanitizeCellForSpreadsheet("+12345")).toBe("'+12345");
    expect(sanitizeCellForSpreadsheet("-12345")).toBe("'-12345");
    expect(sanitizeCellForSpreadsheet("@lookup")).toBe("'@lookup");
    expect(sanitizeCellForSpreadsheet("\tleading tab")).toBe("'\tleading tab");
    expect(sanitizeCellForSpreadsheet("\rleading cr")).toBe("'\rleading cr");
    expect(sanitizeCellForSpreadsheet("Regular safe text")).toBe("Regular safe text");
    expect(sanitizeCellForSpreadsheet("2+2=4")).toBe("2+2=4"); // Not at the beginning
  });

  it("exports unanalyzed items with not_analyzed status and summary rows", () => {
    const csv = generateReviewCsv(sampleItems, null, {}, null);
    expect(csv.charCodeAt(0)).toBe(0xfeff); // UTF-8 BOM
    expect(csv).toContain('"item_id"');
    expect(csv).toContain('"Q1"');
    expect(csv).toContain('"Q2"');
    expect(csv).toContain('"not_analyzed"');
    expect(csv).toContain("'=SUM(1,3)"); // Formula sanitized in option text if emitted
  });

  it("exports analyzed findings with exact source text, quotes, and reviewer decisions", () => {
    const mockResponse: AnalyzeResponse = {
      requestId: "11111111-2222-3333-4444-555555555555",
      revision: 1,
      mode: "live_ai",
      model: "gemini-2.5-flash",
      providerStatus: "ok",
      warnings: [],
      items: [
        {
          id: "Q1",
          status: "meaning_changed",
          structuralFindings: [
            {
              code: "NUMERIC_TOKEN_DIFFERENCE",
              field: { kind: "stem", label: null },
              enTokens: ["2"],
              taTokens: ["3"],
            },
          ],
          comparisons: [
            {
              field: { kind: "stem", label: null },
              relation: "different",
              en: { start: 0, end: 12, text: "What is 2+2?" },
              ta: { start: 0, end: 10, text: "2+2 என்ன?" },
              reasonCode: "other_material_change",
              explanation: "Difference in numbers",
              evidenceValid: true,
            },
          ],
        },
        {
          id: "Q2",
          status: "no_issue_found",
          structuralFindings: [],
          comparisons: [],
        },
      ],
    };

    const decisions = {
      Q1: { stem: "fix" as const },
      Q2: { stem: "keep" as const },
    };

    const timestamp = "2026-11-19T10:00:00.000Z";
    const csv = generateReviewCsv(sampleItems, mockResponse, decisions, timestamp);

    // Q1 should have 2 rows: 1 structural, 1 semantic
    expect(csv).toContain('"structural"');
    expect(csv).toContain('"NUMERIC_TOKEN_DIFFERENCE"');
    expect(csv).toContain('"semantic"');
    expect(csv).toContain('"other_material_change"');
    expect(csv).toContain('"fix"');
    expect(csv).toContain('"gemini-2.5-flash"');
    expect(csv).toContain('"2026-11-19T10:00:00.000Z"');

    // Q2 has no findings, but must still have a summary row
    expect(csv).toContain('"Q2"');
    expect(csv).toContain('"no_issue_found"');
    expect(csv).toContain('"No structural or semantic discrepancies flagged."');
    expect(csv).toContain('"keep"');
  });

  it("never infers a keep decision and defaults undecided fields to pending", () => {
    const mockCleanResponse: AnalyzeResponse = {
      requestId: "22222222-3333-4444-5555-666666666666",
      revision: 1,
      mode: "live_ai",
      model: "gemini-2.5-flash",
      providerStatus: "ok",
      warnings: [],
      items: [
        {
          id: "Q2",
          status: "no_issue_found",
          structuralFindings: [],
          comparisons: [],
        },
      ],
    };

    // No decisions recorded by human reviewer
    const csv = generateReviewCsv([sampleItems[1]], mockCleanResponse, {}, "2026-11-19T10:00:00.000Z");
    expect(csv).toContain('"Q2"');
    expect(csv).toContain('"pending"');
    expect(csv).not.toContain('"keep"');
  });

  it("explicitly states semantic review was not completed in rules_only mode", () => {
    const mockRulesResponse: AnalyzeResponse = {
      requestId: "33333333-4444-5555-6666-777777777777",
      revision: 1,
      mode: "rules_only",
      model: null,
      providerStatus: "not_requested",
      warnings: [],
      items: [
        {
          id: "Q2",
          status: "needs_review",
          structuralFindings: [],
          comparisons: [],
        },
      ],
    };

    const csv = generateReviewCsv([sampleItems[1]], mockRulesResponse, {}, "2026-11-19T10:00:00.000Z");
    expect(csv).toContain('"Q2"');
    expect(csv).toContain("Semantic review was not completed");
    expect(csv).not.toContain("No structural or semantic discrepancies flagged");
    expect(csv).toContain('"pending"');
  });

  it("exports all recorded field decisions including manual option decisions in rules-only mode", () => {
    const mockRulesResponse: AnalyzeResponse = {
      requestId: "44444444-5555-6666-7777-888888888888",
      revision: 1,
      mode: "rules_only",
      model: null,
      providerStatus: "not_requested",
      warnings: [],
      items: [
        {
          id: "Q2",
          status: "needs_review",
          structuralFindings: [],
          comparisons: [],
        },
      ],
    };

    const decisions = {
      Q2: {
        stem: "fix" as const,
        "option:A": "keep" as const,
        "option:B": "escalate" as const,
      },
    };

    const csv = generateReviewCsv([sampleItems[1]], mockRulesResponse, decisions, "2026-11-19T10:00:00.000Z");
    expect(csv).toContain('"Q2"');
    expect(csv).toContain('"stem"');
    expect(csv).toContain('"fix"');
    expect(csv).toContain('"option"');
    expect(csv).toContain('"A"');
    expect(csv).toContain('"keep"');
    expect(csv).toContain('"B"');
    expect(csv).toContain('"escalate"');
  });
});
