import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface Option {
  label: "A" | "B" | "C" | "D" | "E";
  text: string;
}

interface QuestionSide {
  stem: string;
  options: Option[];
}

interface QuestionItem {
  id: string;
  en: QuestionSide;
  ta: QuestionSide;
}

// ---------------------------------------------------------------------------
// Production Structural Rules Logic (mirrors src/lib/core/rules.ts)
// ---------------------------------------------------------------------------

function normalizeTamilDigits(text: string): string {
  const tamilDigits = ["௦", "௧", "௨", "௩", "௪", "௫", "௬", "௭", "௮", "௯"];
  let result = text;
  for (let i = 0; i < tamilDigits.length; i++) {
    result = result.replaceAll(tamilDigits[i], String(i));
  }
  return result;
}

function extractNumericTokens(text: string): string[] {
  const normalized = normalizeTamilDigits(text);
  const regex = /(?:^|[^\p{L}\p{N}])(\d+(?:\.\d+)?)(?:[^\p{L}\p{N}]|$)/gu;
  const matches: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(normalized)) !== null) {
    if (match[1]) matches.push(match[1]);
  }
  return matches;
}

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

function extractUnitTokens(text: string, lang: "en" | "ta"): string[] {
  const units: string[] = [];
  for (const mapping of UNIT_MAP) {
    const pattern = lang === "en" ? mapping.en : mapping.ta;
    if (pattern.test(text)) {
      units.push(mapping.canonical);
    }
  }
  return units;
}

interface StructuralIssue {
  code: string;
  field: string;
  enTokens: string[];
  taTokens: string[];
}

function runProductionRules(item: QuestionItem): StructuralIssue[] {
  const issues: StructuralIssue[] = [];
  const enOptions = item.en.options;
  const taOptions = item.ta.options;

  // 1. Option count
  if (enOptions.length !== taOptions.length) {
    issues.push({
      code: "OPTION_COUNT_MISMATCH",
      field: "stem",
      enTokens: [String(enOptions.length)],
      taTokens: [String(taOptions.length)],
    });
  }

  // 2. Duplicate labels
  const enLabelCounts = new Map<string, number>();
  for (const opt of enOptions) enLabelCounts.set(opt.label, (enLabelCounts.get(opt.label) || 0) + 1);
  for (const [lbl, cnt] of enLabelCounts.entries()) {
    if (cnt > 1) {
      issues.push({ code: "DUPLICATE_OPTION_LABEL", field: `option:${lbl}`, enTokens: [`Duplicate ${lbl} (${cnt})`], taTokens: [] });
    }
  }

  const taLabelCounts = new Map<string, number>();
  for (const opt of taOptions) taLabelCounts.set(opt.label, (taLabelCounts.get(opt.label) || 0) + 1);
  for (const [lbl, cnt] of taLabelCounts.entries()) {
    if (cnt > 1) {
      issues.push({ code: "DUPLICATE_OPTION_LABEL", field: `option:${lbl}`, enTokens: [], taTokens: [`Duplicate ${lbl} (${cnt})`] });
    }
  }

  // 3. Label sets
  const enLabels = enOptions.map((o) => o.label).sort();
  const taLabels = taOptions.map((o) => o.label).sort();
  const taSet = new Set(taLabels);
  const enSet = new Set(enLabels);
  const missingInTa = enLabels.filter((l) => !taSet.has(l));
  const missingInEn = taLabels.filter((l) => !enSet.has(l));
  if (missingInTa.length > 0 || missingInEn.length > 0) {
    issues.push({
      code: "OPTION_LABEL_MISMATCH",
      field: "stem",
      enTokens: missingInTa.length > 0 ? missingInTa : enLabels,
      taTokens: missingInEn.length > 0 ? missingInEn : taLabels,
    });
  }

  // 4. Numeric tokens
  const enStemNums = extractNumericTokens(item.en.stem);
  const taStemNums = extractNumericTokens(item.ta.stem);
  if (enStemNums.join(",") !== taStemNums.join(",")) {
    if (enStemNums.length > 0 || taStemNums.length > 0) {
      issues.push({ code: "NUMERIC_TOKEN_DIFFERENCE", field: "stem", enTokens: enStemNums, taTokens: taStemNums });
    }
  }

  // 5. Unit tokens
  const enUnits = extractUnitTokens(item.en.stem, "en");
  const taUnits = extractUnitTokens(item.ta.stem, "ta");
  if (enUnits.sort().join(",") !== taUnits.sort().join(",")) {
    if (enUnits.length > 0 || taUnits.length > 0) {
      issues.push({ code: "UNIT_TOKEN_DIFFERENCE", field: "stem", enTokens: enUnits, taTokens: taUnits });
    }
  }

  return issues;
}

function isStructurallyBlocked(issues: StructuralIssue[]): boolean {
  return issues.some(
    (i) =>
      i.code === "OPTION_COUNT_MISMATCH" ||
      i.code === "OPTION_LABEL_MISMATCH" ||
      i.code === "DUPLICATE_OPTION_LABEL"
  );
}

// ---------------------------------------------------------------------------
// Quote Evidence Validation Logic (mirrors src/lib/core/evidence.ts)
// ---------------------------------------------------------------------------

function isTamilCombiningMark(code: number): boolean {
  return (
    (code >= 0x0b82 && code <= 0x0b83) ||
    (code >= 0x0bbe && code <= 0x0bcd) ||
    code === 0x0bd7
  );
}

function validateQuote(sourceText: string, quote: string): boolean {
  if (!quote || quote.length === 0) return false;
  if (sourceText === quote) return true;
  const firstIdx = sourceText.indexOf(quote);
  if (firstIdx === -1) return false;
  // Unique occurrence
  const secondIdx = sourceText.indexOf(quote, firstIdx + 1);
  if (secondIdx !== -1) return false;

  const start = firstIdx;
  const end = start + quote.length;

  if (sourceText.slice(start, end) !== quote) return false;
  if (isTamilCombiningMark(sourceText.charCodeAt(start))) return false;
  if (end < sourceText.length && isTamilCombiningMark(sourceText.charCodeAt(end))) return false;

  return true;
}

// ---------------------------------------------------------------------------
// Main Evaluation Runner
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const splitIdx = args.indexOf("--split");
  const split = splitIdx !== -1 && args[splitIdx + 1] ? args[splitIdx + 1] : "development";
  const modeIdx = args.indexOf("--mode");
  const requestedMode = modeIdx !== -1 && args[modeIdx + 1] ? args[modeIdx + 1] : "rules";

  console.log("==================================================================");
  console.log(` MozhiMatch Evaluator | Split: ${split} | Requested Mode: ${requestedMode}`);
  console.log("==================================================================");

  // 1. Resolve fixture path
  let fixturePath = path.resolve(__dirname, "../src/fixtures/development.json");
  let expectedLabels: Record<string, string> = {};

  if (split === "development") {
    // Development split ground truth
    expectedLabels = {
      DEV_NEGATION: "meaning_changed",
      DEV_VERB: "meaning_changed",
      DEV_CLEAN: "no_issue_found",
      DEV_UNCERTAIN: "needs_review",
      DEV_STRUCTURE: "needs_review",
    };
  } else if (split === "holdout") {
    fixturePath = path.resolve(__dirname, "../src/fixtures/holdout-inputs.json");
    const expectedPath = path.resolve(__dirname, "../src/fixtures/holdout-expected.json");

    if (!fs.existsSync(fixturePath)) {
      console.error(`ERROR: Holdout fixture file missing: ${fixturePath}`);
      process.exit(1);
    }
    if (!fs.existsSync(expectedPath)) {
      console.error(`ERROR: Holdout expected labels file missing: ${expectedPath}`);
      process.exit(1);
    }

    const expectedData = JSON.parse(fs.readFileSync(expectedPath, "utf-8"));
    if (expectedData.labels) {
      for (const [id, val] of Object.entries(expectedData.labels)) {
        expectedLabels[id] = (val as { status: string }).status;
      }
    }
  } else {
    console.error(`ERROR: Unknown split "${split}". Use "development" or "holdout".`);
    process.exit(1);
  }

  if (!fs.existsSync(fixturePath)) {
    console.error(`ERROR: Fixture file not found: ${fixturePath}`);
    process.exit(1);
  }

  const items: QuestionItem[] = JSON.parse(fs.readFileSync(fixturePath, "utf-8"));
  console.log(`Loaded ${items.length} question pairs from ${path.basename(fixturePath)}.`);

  // 2. Determine execution mode
  const apiKey = process.env.GEMINI_API_KEY;
  const aiModeEnv = process.env.AI_MODE;
  const hasValidApiKey = Boolean(apiKey && apiKey.trim().length > 0 && aiModeEnv !== "off");

  if (requestedMode === "live_ai" && !hasValidApiKey) {
    console.log("");
    console.log("[NOTICE] Live AI mode was requested, but GEMINI_API_KEY is not set or AI_MODE=off.");
    console.log("Live provider evaluation is marked NOT RUN. No fake predictions will be generated.");
    console.log("");

    const outCsv = path.resolve(__dirname, `../evaluation/results-${split}.csv`);
    const csvLines = [
      "fixture_id,condition,status,expected_status,structural_issues,evidence_grounded,notes",
      ...items.map(
        (item) =>
          `"${item.id}","not_run","not_run","${expectedLabels[item.id] || "unknown"}","none","false","Live AI evaluation not run: missing API key"`
      ),
    ];
    fs.writeFileSync(outCsv, csvLines.join("\n"), "utf-8");
    console.log(`Summary written to ${outCsv}`);
    return;
  }

  console.log(`Execution Mode: ${requestedMode === "live_ai" ? "LIVE_AI (Google Gemini API)" : "RULES (Deterministic structural checks)"}`);
  console.log("");

  interface EvalRow {
    id: string;
    condition: "rules" | "live_ai" | "rules_blocked" | "rules_fallback";
    predictedStatus: string;
    expectedStatus: string;
    structuralIssues: string;
    evidenceGrounded: boolean;
    notes: string;
  }

  const rows: EvalRow[] = [];

  if (requestedMode === "rules") {
    // Pure production structural rules evaluation
    for (const item of items) {
      const issues = runProductionRules(item);
      const issueCodes = issues.map((i) => `${i.code}(${i.field})`).join("; ") || "none";
      const expected = expectedLabels[item.id] || "unknown";

      // Production contract: rules-only mode strictly assigns needs_review
      const predictedStatus = "needs_review";
      const notes = issues.length > 0
        ? `Structural issues flagged: ${issues.map((i) => i.code).join(", ")}`
        : "Structure clean; semantic review strictly required (rules never claim equivalence)";

      rows.push({
        id: item.id,
        condition: "rules",
        predictedStatus,
        expectedStatus: expected,
        structuralIssues: issueCodes,
        evidenceGrounded: false,
        notes,
      });
    }
  } else {
    // Live AI evaluation with exact quote validation
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    console.log(`Querying Gemini provider (${model})...`);

    // System prompt and user prompt
    const SYSTEM_PROMPT = `You compare existing English and Tamil versions of practice multiple-choice questions for a bilingual human reviewer.
Return exactly one result per supplied item ID and exactly one comparison for the stem plus every option label.
Use equivalent only when meaning is preserved. Use different for a material meaning change. Use uncertain when ambiguous.
Quote a short, contiguous, exact substring from EACH raw field for EVERY comparison.
Allowed reason codes: equivalent, negation, entity, qualifier, option_meaning, uncertain, other_material_change. Output only JSON conforming to schema.`;

    const userPayload = items.map((i) => ({
      id: i.id,
      en: { stem: i.en.stem, options: i.en.options },
      ta: { stem: i.ta.stem, options: i.ta.options },
    }));

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model
    )}:generateContent?key=${encodeURIComponent(apiKey!)}`;

    try {
      const resp = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: JSON.stringify(userPayload) }] }],
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          generationConfig: { responseMimeType: "application/json", temperature: 0.1 },
        }),
      });

      if (!resp.ok) {
        throw new Error(`Provider returned HTTP ${resp.status}`);
      }

      const json = await resp.json();
      const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsedAi = JSON.parse(rawText);
      const aiResultsMap = new Map<string, any>(
        (parsedAi.results || []).map((r: any) => [r.itemId, r])
      );

      for (const item of items) {
        const issues = runProductionRules(item);
        const issueCodes = issues.map((i) => `${i.code}(${i.field})`).join("; ") || "none";
        const expected = expectedLabels[item.id] || "unknown";

        if (isStructurallyBlocked(issues)) {
          rows.push({
            id: item.id,
            condition: "rules_blocked",
            predictedStatus: "needs_review",
            expectedStatus: expected,
            structuralIssues: issueCodes,
            evidenceGrounded: false,
            notes: "Structurally blocked: option count or label set mismatch",
          });
          continue;
        }

        const aiItem = aiResultsMap.get(item.id);
        if (!aiItem || !Array.isArray(aiItem.comparisons)) {
          rows.push({
            id: item.id,
            condition: "rules_fallback",
            predictedStatus: "needs_review",
            expectedStatus: expected,
            structuralIssues: issueCodes,
            evidenceGrounded: false,
            notes: "Provider returned no comparisons for this item",
          });
          continue;
        }

        // Validate quotes in comparisons
        let allQuotesValid = true;
        let hasDiff = false;
        let hasUncertain = false;

        for (const comp of aiItem.comparisons) {
          if (comp.relation === "different") hasDiff = true;
          if (comp.relation === "uncertain") hasUncertain = true;

          const enText = comp.field.kind === "stem" ? item.en.stem : item.en.options.find((o) => o.label === comp.field.label)?.text || "";
          const taText = comp.field.kind === "stem" ? item.ta.stem : item.ta.options.find((o) => o.label === comp.field.label)?.text || "";

          if (!validateQuote(enText, comp.enQuote) || !validateQuote(taText, comp.taQuote)) {
            allQuotesValid = false;
          }
        }

        let predictedStatus = "no_issue_found";
        if (hasDiff) predictedStatus = "meaning_changed";
        else if (hasUncertain || issues.length > 0 || !allQuotesValid) predictedStatus = "needs_review";

        rows.push({
          id: item.id,
          condition: "live_ai",
          predictedStatus,
          expectedStatus: expected,
          structuralIssues: issueCodes,
          evidenceGrounded: allQuotesValid,
          notes: allQuotesValid
            ? `Verified grounded comparisons (${aiItem.comparisons.length} fields)`
            : "Grounding failure: one or more quoted excerpts not found verbatim in source",
        });
      }
    } catch (err: unknown) {
      console.warn("Live AI call failed or timed out:", err instanceof Error ? err.message : String(err));
      for (const item of items) {
        const issues = runProductionRules(item);
        rows.push({
          id: item.id,
          condition: "rules_fallback",
          predictedStatus: "needs_review",
          expectedStatus: expectedLabels[item.id] || "unknown",
          structuralIssues: issues.map((i) => i.code).join("; ") || "none",
          evidenceGrounded: false,
          notes: "Provider error: fell back to rules_only review",
        });
      }
    }
  }

  // 3. Print Results Table
  console.log("| Item ID | Condition | Predicted | Expected | Grounded | Structural Issues | Notes |");
  console.log("|---|---|---|---|---|---|---|");
  for (const r of rows) {
    const groundedStr = r.evidenceGrounded ? "Yes" : "No";
    console.log(`| ${r.id} | ${r.condition} | ${r.predictedStatus} | ${r.expectedStatus} | ${groundedStr} | ${r.structuralIssues} | ${r.notes} |`);
  }

  // 4. Score Metrics
  let matches = 0;
  let materialHits = 0;
  let materialMisses = 0;
  let cleanHits = 0;
  let cleanFalseAlarms = 0;
  let groundedCount = 0;

  for (const r of rows) {
    if (r.predictedStatus === r.expectedStatus) matches++;
    if (r.expectedStatus === "meaning_changed") {
      if (r.predictedStatus === "meaning_changed") materialHits++;
      else if (r.predictedStatus === "no_issue_found") materialMisses++;
    }
    if (r.expectedStatus === "no_issue_found") {
      if (r.predictedStatus === "no_issue_found") cleanHits++;
      else if (r.predictedStatus === "meaning_changed") cleanFalseAlarms++;
    }
    if (r.evidenceGrounded) groundedCount++;
  }

  console.log("");
  console.log("Evaluation Metrics Summary:");
  console.log(`- Total Questions Evaluated: ${rows.length}`);
  console.log(`- Exact Match to Expected Status: ${matches}/${rows.length}`);
  console.log(`- Material Meaning Change Hits: ${materialHits}`);
  console.log(`- Critical Misses (Material diff marked Clean): ${materialMisses}`);
  console.log(`- False Alarms (Clean item marked Changed): ${cleanFalseAlarms}`);
  console.log(`- Verbatim Quote Grounding Valid: ${groundedCount}/${rows.length}`);
  console.log("");
  console.log("Disclosure: Synthetic evaluation on small authoring set; not a claim of universal accuracy across arbitrary domains.");

  // 5. Write CSV Report
  const outCsv = path.resolve(__dirname, `../evaluation/results-${split}.csv`);
  const csvLines = [
    "fixture_id,condition,status,expected_status,structural_issues,evidence_grounded,notes",
    ...rows.map(
      (r) =>
        `"${r.id}","${r.condition}","${r.predictedStatus}","${r.expectedStatus}","${r.structuralIssues}","${r.evidenceGrounded}","${r.notes.replace(/"/g, '""')}"`
    ),
  ];
  fs.writeFileSync(outCsv, csvLines.join("\n"), "utf-8");
  console.log(`Results saved to ${outCsv}`);
}

main().catch((err) => {
  console.error("Evaluation script failed:", err);
  process.exit(1);
});
