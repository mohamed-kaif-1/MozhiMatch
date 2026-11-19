import { describe, it, expect } from "vitest";
import {
  validateQuoteInField,
  validateItemComparisons,
} from "../../src/lib/core/evidence";
import { QuestionItem, ProviderResultItem } from "../../src/lib/contracts/types";
import devFixtures from "../../10_TESTING/fixtures/development.json";

describe("Evidence and Citation Validator", () => {
  it("validates exact unique quote and derives UTF-16 start and end indices", () => {
    const text = "Which of these is NOT a renewable energy source?";
    const quote = "NOT";
    const res = validateQuoteInField(text, quote);
    expect(res.valid).toBe(true);
    expect(res.start).toBe(text.indexOf("NOT"));
    expect(res.end).toBe(text.indexOf("NOT") + 3);
    expect(text.slice(res.start!, res.end!)).toBe("NOT");
  });

  it("validates full field quote match", () => {
    const text = "Solar";
    const quote = "Solar";
    const res = validateQuoteInField(text, quote);
    expect(res.valid).toBe(true);
    expect(res.start).toBe(0);
    expect(res.end).toBe(5);
  });

  it("rejects non-existent quote in field", () => {
    const text = "Solar power";
    const quote = "Lunar";
    const res = validateQuoteInField(text, quote);
    expect(res.valid).toBe(false);
  });

  it("rejects ambiguous multiple occurrences of quote", () => {
    const text = "The test is a test";
    const quote = "test";
    const res = validateQuoteInField(text, quote);
    expect(res.valid).toBe(false);
    expect(res.reason).toContain("multiple times");
  });

  it("rejects quote starting with a Tamil combining vowel sign", () => {
    // "பா" is 'ப' (0x0BAA) + 'ா' (0x0BBE).
    const text = "பால்";
    const isolatedVowelSign = "\u0BBE";
    const res = validateQuoteInField(text, isolatedVowelSign);
    expect(res.valid).toBe(false);
  });

  it("correctly derives meaning_changed status when difference is found", () => {
    const devNegation = devFixtures.find((i) => i.id === "DEV_NEGATION") as QuestionItem;
    expect(devNegation).toBeDefined();

    const providerItem: ProviderResultItem = {
      itemId: "DEV_NEGATION",
      comparisons: [
        {
          field: { kind: "stem", label: null },
          relation: "different",
          enQuote: "Which of these is NOT a renewable energy source?",
          taQuote: "இவற்றில் புதுப்பிக்கத்தக்க ஆற்றல் மூலம் எது?",
          reasonCode: "negation",
          explanation: "English asks for NOT renewable, Tamil asks for renewable.",
        },
        {
          field: { kind: "option", label: "A" },
          relation: "equivalent",
          enQuote: "Solar",
          taQuote: "சூரிய ஆற்றல்",
          reasonCode: "equivalent",
          explanation: "Preserved.",
        },
        {
          field: { kind: "option", label: "B" },
          relation: "equivalent",
          enQuote: "Wind",
          taQuote: "காற்று ஆற்றல்",
          reasonCode: "equivalent",
          explanation: "Preserved.",
        },
        {
          field: { kind: "option", label: "C" },
          relation: "equivalent",
          enQuote: "Coal",
          taQuote: "நிலக்கரி",
          reasonCode: "equivalent",
          explanation: "Preserved.",
        },
        {
          field: { kind: "option", label: "D" },
          relation: "equivalent",
          enQuote: "Hydropower",
          taQuote: "நீர்மின் ஆற்றல்",
          reasonCode: "equivalent",
          explanation: "Preserved.",
        },
      ],
    };

    const result = validateItemComparisons(devNegation, providerItem, []);
    expect(result.valid).toBe(true);
    expect(result.status).toBe("meaning_changed");
    expect(result.comparisons.length).toBe(5);
    expect(result.comparisons[0].evidenceValid).toBe(true);
  });

  it("correctly derives no_issue_found for clean question", () => {
    const devClean = devFixtures.find((i) => i.id === "DEV_CLEAN") as QuestionItem;
    expect(devClean).toBeDefined();

    const providerItem: ProviderResultItem = {
      itemId: "DEV_CLEAN",
      comparisons: [
        {
          field: { kind: "stem", label: null },
          relation: "equivalent",
          enQuote: "Which is a prime number?",
          taQuote: "பகா எண் எது?",
          reasonCode: "equivalent",
          explanation: "Preserved.",
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

    const result = validateItemComparisons(devClean, providerItem, []);
    expect(result.valid).toBe(true);
    expect(result.status).toBe("no_issue_found");
  });

  it("rejects incomplete coverage (missing option D) and sets status needs_review", () => {
    const devClean = devFixtures.find((i) => i.id === "DEV_CLEAN") as QuestionItem;
    const incompleteProviderItem: ProviderResultItem = {
      itemId: "DEV_CLEAN",
      comparisons: [
        {
          field: { kind: "stem", label: null },
          relation: "equivalent",
          enQuote: "Which is a prime number?",
          taQuote: "பகா எண் எது?",
          reasonCode: "equivalent",
          explanation: "Preserved.",
        },
        {
          field: { kind: "option", label: "A" },
          relation: "equivalent",
          enQuote: "2",
          taQuote: "2",
          reasonCode: "equivalent",
          explanation: "Preserved.",
        },
      ],
    };

    const result = validateItemComparisons(devClean, incompleteProviderItem, []);
    expect(result.valid).toBe(false);
    expect(result.status).toBe("needs_review");
    expect(result.comparisons).toEqual([]);
  });
});

