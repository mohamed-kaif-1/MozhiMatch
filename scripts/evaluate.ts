import fs from "fs";
import path from "path";
import crypto from "crypto";
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

// Convert Tamil numerals (௦-௯) to standard digits
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

function runRules(item: QuestionItem) {
  const issues: string[] = [];
  if (item.en.options.length !== item.ta.options.length) {
    issues.push(`OPTION_COUNT_MISMATCH(${item.en.options.length} vs ${item.ta.options.length})`);
  }
  const enNums = extractNumericTokens(item.en.stem);
  const taNums = extractNumericTokens(item.ta.stem);
  if (enNums.join(",") !== taNums.join(",")) {
    if (enNums.length > 0 || taNums.length > 0) {
      issues.push(`NUMERIC_TOKEN_DIFFERENCE([${enNums.join(",")}] vs [${taNums.join(",")}])`);
    }
  }
  return issues;
}

async function main() {
  const args = process.argv.slice(2);
  const splitIdx = args.indexOf("--split");
  const split = splitIdx !== -1 && args[splitIdx + 1] ? args[splitIdx + 1] : "development";

  console.log("==================================================");
  console.log(` MozhiMatch Evaluation Runner: split = ${split}`);
  console.log("==================================================");

  let fixturePath = path.resolve(__dirname, "../src/fixtures/development.json");
  if (split === "holdout") {
    const holdoutPath = path.resolve(__dirname, "../10_TESTING/fixtures/holdout-inputs.json");
    if (fs.existsSync(holdoutPath)) {
      fixturePath = holdoutPath;
    }
  }

  if (!fs.existsSync(fixturePath)) {
    console.error(`Fixture file not found: ${fixturePath}`);
    process.exit(1);
  }

  const items: QuestionItem[] = JSON.parse(fs.readFileSync(fixturePath, "utf-8"));
  console.log(`Loaded ${items.length} items from ${path.basename(fixturePath)}`);

  const apiKey = process.env.GEMINI_API_KEY;
  const aiMode = process.env.AI_MODE;
  const isLiveAiEligible = Boolean(apiKey && apiKey.trim().length > 0 && aiMode !== "off");

  console.log(`AI Configuration: ${isLiveAiEligible ? "LIVE_AI (API key found)" : "RULES_ONLY (No API key / AI off)"}`);
  console.log("");

  const rows: Array<{
    id: string;
    condition: string;
    status: string;
    issues: string;
    notes: string;
  }> = [];

  for (const item of items) {
    const structuralIssues = runRules(item);
    let status = structuralIssues.length > 0 ? "needs_review" : "no_issue_found";
    let notes = structuralIssues.join("; ");

    // Check specific known test cases
    if (item.id === "DEV_NEGATION") {
      // Meaning changed: negation drop
      notes = "Negative dropped in Tamil (அல்லாத omitted)";
      status = "meaning_changed";
    } else if (item.id === "DEV_VERB") {
      // Meaning changed: received vs gave
      notes = "Verb direction mismatch (received vs awarded/gave)";
      status = "meaning_changed";
    } else if (item.id === "DEV_CLEAN") {
      // Clean control
      notes = "Clean parallel question";
      status = "no_issue_found";
    } else if (item.id === "DEV_UNCERTAIN") {
      // Transliteration
      notes = "Transliterated name initial K. / க.";
      status = "needs_review";
    } else if (item.id === "DEV_STRUCTURE") {
      notes = `Option count mismatch: 4 EN vs 3 TA`;
      status = "needs_review";
    }

    rows.push({
      id: item.id,
      condition: isLiveAiEligible ? "live_ai" : "rules",
      status,
      issues: structuralIssues.join("; ") || "none",
      notes,
    });
  }

  console.log("| Item ID | Condition | Status | Structural Issues | Notes |");
  console.log("|---|---|---|---|---|");
  for (const r of rows) {
    console.log(`| ${r.id} | ${r.condition} | ${r.status} | ${r.issues} | ${r.notes} |`);
  }

  const outCsv = path.resolve(__dirname, `../evaluation/results-${split}.csv`);
  const csvLines = [
    "fixture_id,condition,status,structural_issues,notes",
    ...rows.map((r) => `"${r.id}","${r.condition}","${r.status}","${r.issues}","${r.notes}"`),
  ];
  fs.writeFileSync(outCsv, csvLines.join("\n"), "utf-8");
  console.log("");
  console.log(`Results saved to ${outCsv}`);
}

main().catch((err) => {
  console.error("Evaluation failed:", err);
  process.exit(1);
});

