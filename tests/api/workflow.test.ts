import { describe, it, expect } from "vitest";
import { checkStructuralRules, isStructurallyBlocked } from "../../src/lib/core/rules";
import { validateItemComparisons } from "../../src/lib/core/evidence";
import devFixtures from "../../10_TESTING/fixtures/development.json";
import { QuestionItem, ProviderResultItem } from "../../src/lib/contracts/types";

describe("Feasibility Checkpoint: Core End-to-End Workflow", () => {
  it("proves changed-meaning detection with exact highlights on DEV_NEGATION", () => {
    const devNegation = devFixtures.find((i) => i.id === "DEV_NEGATION") as QuestionItem;
    expect(devNegation).toBeDefined();

    // 1. Structural check
    const structuralFindings = checkStructuralRules(devNegation);
    expect(isStructurallyBlocked(structuralFindings)).toBe(false);

    // 2. Simulated provider response proposing changed meaning on negation
    const providerItem: ProviderResultItem = {
      itemId: "DEV_NEGATION",
      comparisons: [
        {
          field: { kind: "stem", label: null },
          relation: "different",
          enQuote: "NOT",
          taQuote: "இவற்றில்",
          reasonCode: "negation",
          explanation: "The English stem asks for NOT renewable, while Tamil asks for renewable.",
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

    // 3. Evidence and coverage validation
    const result = validateItemComparisons(devNegation, providerItem, structuralFindings);
    expect(result.valid).toBe(true);
    expect(result.status).toBe("meaning_changed");
    expect(result.comparisons.length).toBe(5);

    // Exact citation check on stem
    const stemComp = result.comparisons[0];
    expect(stemComp.relation).toBe("different");
    expect(stemComp.reasonCode).toBe("negation");
    expect(stemComp.en.text).toBe("NOT");
    expect(devNegation.en.stem.slice(stemComp.en.start, stemComp.en.end)).toBe("NOT");
    expect(stemComp.evidenceValid).toBe(true);
  });

  it("proves clean question validation with no false alerts on DEV_CLEAN", () => {
    const devClean = devFixtures.find((i) => i.id === "DEV_CLEAN") as QuestionItem;
    expect(devClean).toBeDefined();

    const structuralFindings = checkStructuralRules(devClean);
    expect(structuralFindings.length).toBe(0);

    const providerItem: ProviderResultItem = {
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

    const result = validateItemComparisons(devClean, providerItem, structuralFindings);
    expect(result.valid).toBe(true);
    expect(result.status).toBe("no_issue_found");
  });

  it("proves ambiguous wording escalation on DEV_UNCERTAIN", () => {
    const devUncertain = devFixtures.find((i) => i.id === "DEV_UNCERTAIN") as QuestionItem;
    expect(devUncertain).toBeDefined();

    const providerItem: ProviderResultItem = {
      itemId: "DEV_UNCERTAIN",
      comparisons: [
        {
          field: { kind: "stem", label: null },
          relation: "uncertain",
          enQuote: "K. Ravi",
          taQuote: "க. ரவி",
          reasonCode: "uncertain",
          explanation: "Initial transliteration requires verification.",
        },
        {
          field: { kind: "option", label: "A" },
          relation: "equivalent",
          enQuote: "He joined in 2020",
          taQuote: "அவர் 2020-இல் சேர்ந்தார்",
          reasonCode: "equivalent",
          explanation: "Preserved.",
        },
        {
          field: { kind: "option", label: "B" },
          relation: "equivalent",
          enQuote: "He joined in 2021",
          taQuote: "அவர் 2021-இல் சேர்ந்தார்",
          reasonCode: "equivalent",
          explanation: "Preserved.",
        },
        {
          field: { kind: "option", label: "C" },
          relation: "equivalent",
          enQuote: "He joined in 2022",
          taQuote: "அவர் 2022-இல் சேர்ந்தார்",
          reasonCode: "equivalent",
          explanation: "Preserved.",
        },
        {
          field: { kind: "option", label: "D" },
          relation: "equivalent",
          enQuote: "He joined in 2023",
          taQuote: "அவர் 2023-இல் சேர்ந்தார்",
          reasonCode: "equivalent",
          explanation: "Preserved.",
        },
      ],
    };

    const result = validateItemComparisons(devUncertain, providerItem, []);
    expect(result.valid).toBe(true);
    expect(result.status).toBe("needs_review");
  });

  it("never silently marks clean when provider output or evidence is corrupted", () => {
    const devNegation = devFixtures.find((i) => i.id === "DEV_NEGATION") as QuestionItem;

    // Bad quote not in source text
    const corruptedProviderItem: ProviderResultItem = {
      itemId: "DEV_NEGATION",
      comparisons: [
        {
          field: { kind: "stem", label: null },
          relation: "equivalent", // Model claimed equivalent erroneously
          enQuote: "Hallucinated quote not in text",
          taQuote: "இவற்றில்",
          reasonCode: "equivalent",
          explanation: "All clear.",
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

    const result = validateItemComparisons(devNegation, corruptedProviderItem, []);
    expect(result.valid).toBe(false);
    expect(result.status).toBe("needs_review");
    expect(result.comparisons).toEqual([]);
  });
});

