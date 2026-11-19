import { describe, it, expect } from "vitest";
import {
  checkStructuralRules,
  isStructurallyBlocked,
  normalizeTamilDigits,
  extractNumericTokens,
} from "../../src/lib/core/rules";
import devFixtures from "../../10_TESTING/fixtures/development.json";
import { QuestionItem } from "../../src/lib/contracts/types";

describe("Structural Comparison Rules", () => {
  it("detects option count mismatch in DEV_STRUCTURE fixture", () => {
    const devStructure = devFixtures.find((i) => i.id === "DEV_STRUCTURE") as QuestionItem;
    expect(devStructure).toBeDefined();

    const findings = checkStructuralRules(devStructure);
    expect(findings.some((f) => f.code === "OPTION_COUNT_MISMATCH")).toBe(true);
    expect(isStructurallyBlocked(findings)).toBe(true);
  });

  it("reports no structural findings for DEV_CLEAN fixture", () => {
    const devClean = devFixtures.find((i) => i.id === "DEV_CLEAN") as QuestionItem;
    expect(devClean).toBeDefined();

    const findings = checkStructuralRules(devClean);
    expect(findings.length).toBe(0);
    expect(isStructurallyBlocked(findings)).toBe(false);
  });

  it("normalizes Tamil numerals to standard digits", () => {
    expect(normalizeTamilDigits("வருடம் ௨௦௨௩")).toBe("வருடம் 2023");
    expect(extractNumericTokens("௧௦௦ மாணவர்கள்")).toEqual(["100"]);
  });

  it("detects numeric token differences", () => {
    const item: QuestionItem = {
      id: "NUM_TEST",
      en: {
        stem: "The treaty was signed in 1947.",
        options: [
          { label: "A", text: "True" },
          { label: "B", text: "False" },
        ],
      },
      ta: {
        stem: "ஒப்பந்தம் 1950-இல் கையெழுத்தானது.",
        options: [
          { label: "A", text: "சரி" },
          { label: "B", text: "தவறு" },
        ],
      },
    };

    const findings = checkStructuralRules(item);
    const numDiff = findings.find((f) => f.code === "NUMERIC_TOKEN_DIFFERENCE");
    expect(numDiff).toBeDefined();
    expect(numDiff?.enTokens).toEqual(["1947"]);
    expect(numDiff?.taTokens).toEqual(["1950"]);
  });

  it("detects duplicate option labels", () => {
    const item: QuestionItem = {
      id: "DUP_TEST",
      en: {
        stem: "Choose one",
        options: [
          { label: "A", text: "First" },
          { label: "A", text: "Second" },
        ],
      },
      ta: {
        stem: "ஒன்றைத் தேர்ந்தெடுக்கவும்",
        options: [
          { label: "A", text: "முதல்" },
          { label: "B", text: "இரண்டாம்" },
        ],
      },
    };

    const findings = checkStructuralRules(item);
    expect(findings.some((f) => f.code === "DUPLICATE_OPTION_LABEL")).toBe(true);
    expect(isStructurallyBlocked(findings)).toBe(true);
  });

  it("detects unit token differences", () => {
    const item: QuestionItem = {
      id: "UNIT_TEST",
      en: {
        stem: "The distance is 15 km.",
        options: [
          { label: "A", text: "Short" },
          { label: "B", text: "Long" },
        ],
      },
      ta: {
        stem: "தொலைவு 15 மீ ஆகும்.",
        options: [
          { label: "A", text: "குறைவு" },
          { label: "B", text: "அதிகம்" },
        ],
      },
    };

    const findings = checkStructuralRules(item);
    const unitFinding = findings.find((f) => f.code === "UNIT_TOKEN_DIFFERENCE");
    expect(unitFinding).toBeDefined();
    expect(unitFinding?.enTokens).toContain("km");
    expect(unitFinding?.taTokens).toContain("m");
  });
});

