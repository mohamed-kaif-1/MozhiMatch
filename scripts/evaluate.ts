import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { checkStructuralRules, isStructurallyBlocked } from "../src/lib/core/rules";
import { validateItemComparisons } from "../src/lib/core/evidence";
import { SYSTEM_PROMPT_V1, buildUserPrompt, PROVIDER_RESPONSE_SCHEMA } from "../src/lib/ai/prompt";
import { ProviderOutputSchema } from "../src/lib/contracts/schemas";
import { APP_LIMITS } from "../src/lib/contracts/config";
import { QuestionItem, ProviderResultItem } from "../src/lib/contracts/types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface EvalRow {
  id: string;
  condition: "rules" | "live_ai" | "rules_blocked" | "rules_fallback" | "not_run";
  predictedStatus: string;
  expectedStatus: string;
  structuralIssues: string;
  evidenceGrounded: boolean;
  notes: string;
  category?: "detection" | "abstention" | "clean_pass" | "blocked" | "fallback" | "not_run";
}

async function main() {
  const args = process.argv.slice(2);
  const splitIdx = args.indexOf("--split");
  const split = splitIdx !== -1 && args[splitIdx + 1] ? args[splitIdx + 1] : "development";
  const modeIdx = args.indexOf("--mode");
  const requestedMode = modeIdx !== -1 && args[modeIdx + 1] ? args[modeIdx + 1] : "rules";

  console.log("==================================================================");
  console.log(` MozhiMatch Evaluator | Split: ${split} | Requested Mode: ${requestedMode}`);
  console.log("==================================================================");

  // 1. Resolve fixture path and ground truth labels
  let fixturePath = path.resolve(__dirname, "../src/fixtures/development.json");
  let expectedLabels: Record<string, string> = {};

  if (split === "development") {
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

  // 2. Check execution prerequisites
  const apiKey = process.env.GEMINI_API_KEY;
  const aiModeEnv = process.env.AI_MODE;
  const hasValidApiKey = Boolean(apiKey && apiKey.trim().length > 0 && aiModeEnv !== "off");

  if (requestedMode === "live_ai" && !hasValidApiKey) {
    console.log("");
    console.log("[NOTICE] Live AI mode requested, but GEMINI_API_KEY is not set or AI_MODE=off.");
    console.log("Live provider evaluation is marked NOT RUN. No synthetic outcomes will be simulated.");
    console.log("");

    const outCsv = path.resolve(__dirname, `../evaluation/results-${split}.csv`);
    const csvLines = [
      "fixture_id,condition,status,expected_status,structural_issues,evidence_grounded,notes",
      ...items.map(
        (item) =>
          `"${item.id}","not_run","not_run","${expectedLabels[item.id] || "unknown"}","none","false","Live AI evaluation not run: missing API key or AI_MODE=off"`
      ),
    ];
    fs.writeFileSync(outCsv, csvLines.join("\n"), "utf-8");
    console.log(`Summary written to ${outCsv}`);
    return;
  }

  console.log(
    `Execution Mode: ${requestedMode === "live_ai" ? "LIVE_AI (Google Gemini API)" : "RULES (Deterministic structural checks)"}`
  );
  console.log("");

  const rows: EvalRow[] = [];

  if (requestedMode === "rules") {
    // Pure production structural rules evaluation
    for (const item of items) {
      const issues = checkStructuralRules(item);
      const issueCodes =
        issues.map((i) => `${i.code}(${i.field.kind}${i.field.label ? `:${i.field.label}` : ""})`).join("; ") || "none";
      const expected = expectedLabels[item.id] || "unknown";

      // Production contract: rules-only mode strictly assigns needs_review
      const predictedStatus = "needs_review";
      const notes =
        issues.length > 0
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
        category: issues.length > 0 ? "blocked" : "abstention",
      });
    }
  } else {
    // Live AI evaluation: exclude structurally blocked items before provider calls
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    console.log(`Querying Gemini provider (${model}) with ${APP_LIMITS.PROVIDER_TIMEOUT_MS}ms timeout...`);

    const structurallyBlockedMap = new Map<string, ReturnType<typeof checkStructuralRules>>();
    const eligibleItems: QuestionItem[] = [];

    for (const item of items) {
      const findings = checkStructuralRules(item);
      structurallyBlockedMap.set(item.id, findings);
      if (!isStructurallyBlocked(findings)) {
        eligibleItems.push(item);
      }
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model
    )}:generateContent?key=${encodeURIComponent(apiKey!)}`;

    let aiResultsMap = new Map<string, ProviderResultItem>();
    let providerFailed = false;
    let providerErrorMsg = "";

    if (eligibleItems.length > 0) {
      const userPrompt = buildUserPrompt(eligibleItems, "en");
      const requestBody = {
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT_V1 }] },
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: PROVIDER_RESPONSE_SCHEMA,
          temperature: 0.1,
        },
      };

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), APP_LIMITS.PROVIDER_TIMEOUT_MS);

        const resp = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!resp.ok) {
          throw new Error(`Provider returned HTTP ${resp.status}`);
        }

        const json = await resp.json();
        const candidateText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!candidateText || typeof candidateText !== "string") {
          throw new Error("Provider returned empty or invalid text part");
        }

        const parsedJson = JSON.parse(candidateText);
        const schemaValidation = ProviderOutputSchema.safeParse(parsedJson);
        if (!schemaValidation.success) {
          throw new Error(`Provider JSON schema mismatch: ${schemaValidation.error.message}`);
        }

        for (const resItem of schemaValidation.data.results) {
          aiResultsMap.set(resItem.itemId, {
            itemId: resItem.itemId,
            comparisons: resItem.comparisons,
          });
        }
      } catch (err: unknown) {
        providerFailed = true;
        providerErrorMsg = err instanceof Error ? err.message : String(err);
        console.warn("Live AI call failed or timed out:", providerErrorMsg);
      }
    }

    // Process each item using production evidence validation
    for (const item of items) {
      const findings = structurallyBlockedMap.get(item.id) || [];
      const issueCodes =
        findings.map((i) => `${i.code}(${i.field.kind}${i.field.label ? `:${i.field.label}` : ""})`).join("; ") || "none";
      const expected = expectedLabels[item.id] || "unknown";

      if (isStructurallyBlocked(findings)) {
        rows.push({
          id: item.id,
          condition: "rules_blocked",
          predictedStatus: "needs_review",
          expectedStatus: expected,
          structuralIssues: issueCodes,
          evidenceGrounded: false,
          notes: "Structurally blocked: option count or label set mismatch (excluded from provider payload)",
          category: "blocked",
        });
        continue;
      }

      if (providerFailed) {
        rows.push({
          id: item.id,
          condition: "rules_fallback",
          predictedStatus: "needs_review",
          expectedStatus: expected,
          structuralIssues: issueCodes,
          evidenceGrounded: false,
          notes: `Provider error or timeout (${providerErrorMsg}): fell back to rules_only`,
          category: "fallback",
        });
        continue;
      }

      const providerItem = aiResultsMap.get(item.id);
      if (!providerItem) {
        rows.push({
          id: item.id,
          condition: "rules_fallback",
          predictedStatus: "needs_review",
          expectedStatus: expected,
          structuralIssues: issueCodes,
          evidenceGrounded: false,
          notes: "Provider returned no comparisons for this item; empty comparisons never produce no_issue_found",
          category: "fallback",
        });
        continue;
      }

      // Complete stem-and-option coverage & quote validation using shared production logic
      const valRes = validateItemComparisons(item, providerItem, findings);

      if (!valRes.valid) {
        rows.push({
          id: item.id,
          condition: "live_ai",
          predictedStatus: "needs_review",
          expectedStatus: expected,
          structuralIssues: issueCodes,
          evidenceGrounded: false,
          notes: `Coverage/quote validation failure: ${valRes.errorReason || "partial comparison rejected"}`,
          category: "fallback",
        });
        continue;
      }

      const hasDiff = valRes.comparisons.some((c) => c.relation === "different");
      const hasUncertain = valRes.comparisons.some((c) => c.relation === "uncertain");
      const category: EvalRow["category"] = hasDiff
        ? "detection"
        : hasUncertain
          ? "abstention"
          : "clean_pass";

      rows.push({
        id: item.id,
        condition: "live_ai",
        predictedStatus: valRes.status,
        expectedStatus: expected,
        structuralIssues: issueCodes,
        evidenceGrounded: true,
        notes: hasDiff
          ? `Discrepancy detected across ${valRes.comparisons.length} validated fields`
          : hasUncertain
            ? `Model abstained (uncertainty flagged in ${valRes.comparisons.filter((c) => c.relation === "uncertain").length} fields)`
            : `Clean equivalence verified across all ${valRes.comparisons.length} fields`,
        category,
      });
    }
  }

  // 3. Print Results Table
  console.log("| Item ID | Condition | Predicted | Expected | Grounded | Category | Notes |");
  console.log("|---|---|---|---|---|---|---|");
  for (const r of rows) {
    const groundedStr = r.evidenceGrounded ? "Yes" : "No";
    console.log(
      `| ${r.id} | ${r.condition} | ${r.predictedStatus} | ${r.expectedStatus} | ${groundedStr} | ${r.category || "n/a"} | ${r.notes} |`
    );
  }

  // 4. Score Metrics with distinguished categories
  let matches = 0;
  let materialDetections = 0;
  let abstentions = 0;
  let cleanHits = 0;
  let groundedCount = 0;
  let blockedCount = 0;

  for (const r of rows) {
    if (r.predictedStatus === r.expectedStatus) matches++;
    if (r.category === "detection") materialDetections++;
    if (r.category === "abstention") abstentions++;
    if (r.category === "clean_pass") cleanHits++;
    if (r.category === "blocked") blockedCount++;
    if (r.evidenceGrounded) groundedCount++;
  }

  console.log("");
  console.log("Evaluation Metrics Summary:");
  console.log(`- Total Questions Evaluated: ${rows.length}`);
  console.log(`- Exact Match to Expected Status: ${matches}/${rows.length}`);
  console.log(`- Material Meaning Change Detections: ${materialDetections}`);
  console.log(`- Ambiguity / Abstentions (needs_review): ${abstentions}`);
  console.log(`- Clean Equivalence Passes: ${cleanHits}`);
  console.log(`- Structurally Blocked (excluded from AI): ${blockedCount}`);
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
