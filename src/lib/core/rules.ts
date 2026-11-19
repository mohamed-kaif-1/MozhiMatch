import { QuestionItem, StructuralFinding } from "../contracts/types";

// Convert Tamil numerals (௦-௯) to standard digits
export function normalizeTamilDigits(text: string): string {
  const tamilDigits = ["௦", "௧", "௨", "௩", "௪", "௫", "௬", "௭", "௮", "௯"];
  let result = text;
  for (let i = 0; i < tamilDigits.length; i++) {
    result = result.replaceAll(tamilDigits[i], String(i));
  }
  return result;
}

// Extract numeric tokens (integers, decimals, percentages, e.g. "12", "3.14", "2020")
export function extractNumericTokens(text: string): string[] {
  const normalized = normalizeTamilDigits(text);
  const regex = /(?:^|[^\p{L}\p{N}])(\d+(?:\.\d+)?)(?:[^\p{L}\p{N}]|$)/gu;
  const matches: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(normalized)) !== null) {
    if (match[1]) matches.push(match[1]);
  }
  return matches;
}

// Known unit mappings (English -> Tamil aliases)
// Using Unicode boundary `(?:^|[^\p{L}\p{N}])` and `(?:[^\p{L}\p{N}]|$)` to correctly handle non-ASCII Tamil words
const UNIT_MAP: { en: RegExp; ta: RegExp; canonical: string }[] = [
  {
    en: /(?:^|[^\p{L}\p{N}])(?:km|kilometers?)(?:[^\p{L}\p{N}]|$)/iu,
    ta: /(?:^|[^\p{L}\p{N}])(?:கி\.மீ|கிமீ|கிலோமீட்டர்)(?:[^\p{L}\p{N}]|$)/u,
    canonical: "km",
  },
  {
    en: /(?:^|[^\p{L}\p{N}])(?:m|meters?)(?:[^\p{L}\p{N}]|$)/iu,
    ta: /(?:^|[^\p{L}\p{N}])(?:மீ|மீட்டர்)(?:[^\p{L}\p{N}]|$)/u,
    canonical: "m",
  },
  {
    en: /(?:^|[^\p{L}\p{N}])(?:cm|centimeters?)(?:[^\p{L}\p{N}]|$)/iu,
    ta: /(?:^|[^\p{L}\p{N}])(?:செ\.மீ|செமீ|சென்டிமீட்டர்)(?:[^\p{L}\p{N}]|$)/u,
    canonical: "cm",
  },
  {
    en: /(?:^|[^\p{L}\p{N}])(?:mm|millimeters?)(?:[^\p{L}\p{N}]|$)/iu,
    ta: /(?:^|[^\p{L}\p{N}])(?:மி\.மீ|மிமீ|மில்லிமீட்டர்)(?:[^\p{L}\p{N}]|$)/u,
    canonical: "mm",
  },
  {
    en: /(?:^|[^\p{L}\p{N}])(?:kg|kilograms?)(?:[^\p{L}\p{N}]|$)/iu,
    ta: /(?:^|[^\p{L}\p{N}])(?:கிலோ|கிலோகிராம்)(?:[^\p{L}\p{N}]|$)/u,
    canonical: "kg",
  },
  {
    en: /(?:^|[^\p{L}\p{N}])(?:g|grams?)(?:[^\p{L}\p{N}]|$)/iu,
    ta: /(?:^|[^\p{L}\p{N}])(?:கிராம்)(?:[^\p{L}\p{N}]|$)/u,
    canonical: "g",
  },
  {
    en: /(?:^|[^\p{L}\p{N}])(?:s|sec|seconds?)(?:[^\p{L}\p{N}]|$)/iu,
    ta: /(?:^|[^\p{L}\p{N}])(?:வினாடி|விநாடி)(?:[^\p{L}\p{N}]|$)/u,
    canonical: "s",
  },
  {
    en: /(?:^|[^\p{L}\p{N}])(?:hr|hrs|hours?)(?:[^\p{L}\p{N}]|$)/iu,
    ta: /(?:^|[^\p{L}\p{N}])(?:மணி|மணிநேரம்)(?:[^\p{L}\p{N}]|$)/u,
    canonical: "hr",
  },
  {
    en: /(?:%|percent)/iu,
    ta: /(?:%|சதவீதம்|விழுக்காடு)/u,
    canonical: "%",
  },
  {
    en: /(?:₹|\$|rs\.?|inr)/iu,
    ta: /(?:₹|\$|ரூபாய்|ரூ\.?)/u,
    canonical: "currency",
  },
  {
    en: /(?:°c|celsius)/iu,
    ta: /(?:°c|செல்சியஸ்)/iu,
    canonical: "celsius",
  },
];

export function extractUnitTokens(text: string, lang: "en" | "ta"): string[] {
  const units: string[] = [];
  for (const mapping of UNIT_MAP) {
    const pattern = lang === "en" ? mapping.en : mapping.ta;
    if (pattern.test(text)) {
      units.push(mapping.canonical);
    }
  }
  return units;
}

export function checkStructuralRules(item: QuestionItem): StructuralFinding[] {
  const findings: StructuralFinding[] = [];

  const enOptions = item.en.options;
  const taOptions = item.ta.options;

  // 1. Option count mismatch
  if (enOptions.length !== taOptions.length) {
    findings.push({
      code: "OPTION_COUNT_MISMATCH",
      field: { kind: "stem", label: null },
      enTokens: [String(enOptions.length)],
      taTokens: [String(taOptions.length)],
    });
  }

  // 2. Duplicate option labels
  const enLabelCounts = new Map<string, number>();
  for (const opt of enOptions) {
    enLabelCounts.set(opt.label, (enLabelCounts.get(opt.label) || 0) + 1);
  }
  for (const [label, count] of enLabelCounts.entries()) {
    if (count > 1) {
      findings.push({
        code: "DUPLICATE_OPTION_LABEL",
        field: { kind: "option", label: label as "A" | "B" | "C" | "D" | "E" },
        enTokens: [`Duplicate ${label} (${count})`],
        taTokens: [],
      });
    }
  }

  const taLabelCounts = new Map<string, number>();
  for (const opt of taOptions) {
    taLabelCounts.set(opt.label, (taLabelCounts.get(opt.label) || 0) + 1);
  }
  for (const [label, count] of taLabelCounts.entries()) {
    if (count > 1) {
      findings.push({
        code: "DUPLICATE_OPTION_LABEL",
        field: { kind: "option", label: label as "A" | "B" | "C" | "D" | "E" },
        enTokens: [],
        taTokens: [`Duplicate ${label} (${count})`],
      });
    }
  }

  // 3. Option label mismatch (sets do not match)
  const enLabels = enOptions.map((o) => o.label).sort();
  const taLabels = taOptions.map((o) => o.label).sort();
  const enLabelsSet = new Set(enLabels);
  const taLabelsSet = new Set(taLabels);

  const missingInTa = enLabels.filter((l) => !taLabelsSet.has(l));
  const missingInEn = taLabels.filter((l) => !enLabelsSet.has(l));

  if (missingInTa.length > 0 || missingInEn.length > 0) {
    findings.push({
      code: "OPTION_LABEL_MISMATCH",
      field: { kind: "stem", label: null },
      enTokens: missingInTa.length > 0 ? missingInTa : enLabels,
      taTokens: missingInEn.length > 0 ? missingInEn : taLabels,
    });
  }

  // 4. Numeric token difference in stem
  const enStemNums = extractNumericTokens(item.en.stem);
  const taStemNums = extractNumericTokens(item.ta.stem);
  if (enStemNums.join(",") !== taStemNums.join(",")) {
    if (enStemNums.length > 0 || taStemNums.length > 0) {
      findings.push({
        code: "NUMERIC_TOKEN_DIFFERENCE",
        field: { kind: "stem", label: null },
        enTokens: enStemNums,
        taTokens: taStemNums,
      });
    }
  }

  // Unit token difference in stem
  const enStemUnits = extractUnitTokens(item.en.stem, "en");
  const taStemUnits = extractUnitTokens(item.ta.stem, "ta");
  if (enStemUnits.sort().join(",") !== taStemUnits.sort().join(",")) {
    if (enStemUnits.length > 0 || taStemUnits.length > 0) {
      findings.push({
        code: "UNIT_TOKEN_DIFFERENCE",
        field: { kind: "stem", label: null },
        enTokens: enStemUnits,
        taTokens: taStemUnits,
      });
    }
  }

  // Check matching options for numbers and units
  for (const enOpt of enOptions) {
    const taOpt = taOptions.find((o) => o.label === enOpt.label);
    if (!taOpt) continue;

    const enOptNums = extractNumericTokens(enOpt.text);
    const taOptNums = extractNumericTokens(taOpt.text);
    if (enOptNums.join(",") !== taOptNums.join(",")) {
      if (enOptNums.length > 0 || taOptNums.length > 0) {
        findings.push({
          code: "NUMERIC_TOKEN_DIFFERENCE",
          field: { kind: "option", label: enOpt.label },
          enTokens: enOptNums,
          taTokens: taOptNums,
        });
      }
    }

    const enOptUnits = extractUnitTokens(enOpt.text, "en");
    const taOptUnits = extractUnitTokens(taOpt.text, "ta");
    if (enOptUnits.sort().join(",") !== taOptUnits.sort().join(",")) {
      if (enOptUnits.length > 0 || taOptUnits.length > 0) {
        findings.push({
          code: "UNIT_TOKEN_DIFFERENCE",
          field: { kind: "option", label: enOpt.label },
          enTokens: enOptUnits,
          taTokens: taOptUnits,
        });
      }
    }
  }

  return findings;
}

export function isStructurallyBlocked(findings: StructuralFinding[]): boolean {
  return findings.some(
    (f) =>
      f.code === "OPTION_COUNT_MISMATCH" ||
      f.code === "OPTION_LABEL_MISMATCH" ||
      f.code === "DUPLICATE_OPTION_LABEL"
  );
}
