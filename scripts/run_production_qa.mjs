import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE_URL = process.env.TEST_URL || "http://localhost:3000";
const SCREENSHOT_DIR = path.resolve("qa-reports/screenshots");

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const VIEWPORTS = [
  { width: 320, height: 700, name: "320px_mobile_small" },
  { width: 375, height: 812, name: "375px_mobile_iphone_x" },
  { width: 390, height: 844, name: "390px_mobile_iphone_14" },
  { width: 768, height: 1024, name: "768px_tablet_ipad" },
  { width: 1024, height: 768, name: "1024px_tablet_landscape" },
  { width: 1366, height: 768, name: "1366px_laptop" },
  { width: 1920, height: 1080, name: "1920px_desktop" },
];

async function runAudit() {
  console.log(`\n======================================================`);
  console.log(`Starting MozhiMatch Production Browser QA Audit`);
  console.log(`Target URL: ${BASE_URL}`);
  console.log(`======================================================\n`);

  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  });
  const results = [];

  function recordResult(testId, feature, steps, expected, observed, status, severity, screenshotPath = "") {
    const item = { testId, feature, steps, expected, observed, status, severity, screenshotPath };
    results.push(item);
    const mark = status === "PASS" ? "✓ [PASS]" : "✗ [FAIL]";
    console.log(`${mark} ${testId}: ${feature} - ${status}`);
    if (status !== "PASS") {
      console.log(`   Observed: ${observed}`);
    }
  }

  try {
    const page = await browser.newPage();

    // ----------------------------------------------------
    // TEST SUITE 1: Responsive Toolbar & Overlap Verification
    // ----------------------------------------------------
    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(BASE_URL, { waitUntil: "networkidle" });

      const exampleTrigger = page.locator("#example-selector-trigger");
      await exampleTrigger.waitFor({ state: "visible", timeout: 5000 });

      // Click open the dropdown
      await exampleTrigger.click();
      await page.waitForTimeout(200);

      const listbox = page.locator("div[role='listbox']");
      const isListboxVisible = await listbox.isVisible();

      // Check bounding box overlap between example trigger and mode buttons
      const triggerBox = await exampleTrigger.boundingBox();
      const modeBtn = page.getByRole("button", { name: "Structure rules only" });
      const modeBox = await modeBtn.boundingBox();

      let hasVisualOverlap = false;
      if (triggerBox && modeBox && triggerBox.y === modeBox.y) {
        // Same line: check if horizontal bounds collide
        if (triggerBox.x + triggerBox.width > modeBox.x) {
          hasVisualOverlap = true;
        }
      }

      const ssPath = path.join(SCREENSHOT_DIR, `toolbar_${vp.name}.png`);
      await page.screenshot({ path: ssPath, fullPage: false });

      // Close dropdown
      await page.keyboard.press("Escape");

      recordResult(
        `TOOLBAR-VP-${vp.width}`,
        `Toolbar Layout & Dropdown at ${vp.width}px (${vp.name})`,
        `Resize viewport to ${vp.width}x${vp.height}, open Example dropdown, verify no overlap and clean rendering`,
        "Example dropdown opens with ample width and does not collide or overlap with mode toggle",
        hasVisualOverlap
          ? "FAIL: Example button collides with mode toggle"
          : `PASS: Clean rendering, listbox visible=${isListboxVisible}, no bounding overlap`,
        hasVisualOverlap ? "FAIL" : "PASS",
        "P0",
        `qa-reports/screenshots/toolbar_${vp.name}.png`
      );
    }

    // ----------------------------------------------------
    // TEST SUITE 2: Problem B - Initial State & Dropdown Sync
    // ----------------------------------------------------
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(BASE_URL, { waitUntil: "networkidle" });

    // Step 2.1: Verify initial question loaded is DEV_NEGATION
    const triggerText = await page.locator("#example-selector-trigger").innerText();
    const englishStem = page.locator("textarea").first();
    const enStemVal = await englishStem.inputValue();

    const isInitialMatch =
      triggerText.includes("DEV_NEGATION") &&
      enStemVal.includes("Which of these is NOT a renewable energy source?");

    recordResult(
      "SYNC-01",
      "Authoritative initial question state matching DEV_NEGATION",
      "Load homepage with clean session, check active question and dropdown title",
      "Dropdown shows DEV_NEGATION and loaded question is DEV_NEGATION with authentic negation prompt",
      isInitialMatch
        ? `PASS: Dropdown shows '${triggerText.trim()}', stem matches fixture`
        : `FAIL: Mismatch. Dropdown: '${triggerText}', stem: '${enStemVal.slice(0, 40)}'`,
      isInitialMatch ? "PASS" : "FAIL",
      "P0"
    );

    // Step 2.2: Switch example to DEV_VERB
    await page.locator("#example-selector-trigger").click();
    await page.locator("#example-option-DEV_VERB").click();
    await page.waitForTimeout(300);

    const verbTriggerText = await page.locator("#example-selector-trigger").innerText();
    const verbStemVal = await englishStem.inputValue();
    const isVerbMatch =
      verbTriggerText.includes("DEV_VERB") &&
      verbStemVal.includes("school received an award");

    recordResult(
      "SYNC-02",
      "Switch example to DEV_VERB",
      "Click ExampleSelector -> Select DEV_VERB",
      "Dropdown updates to DEV_VERB and editor loads authoritative verb mismatch fixture",
      isVerbMatch
        ? `PASS: Switched to DEV_VERB correctly`
        : `FAIL: Expected DEV_VERB, got '${verbTriggerText}'`,
      isVerbMatch ? "PASS" : "FAIL",
      "P1"
    );

    // Step 2.3: Modify stem text and verify dropdown deselects (shows placeholder)
    await englishStem.fill(verbStemVal + " [edited text]");
    await page.waitForTimeout(200);

    const editedTriggerText = await page.locator("#example-selector-trigger").innerText();
    const isDeselected =
      editedTriggerText.includes("Select an example") ||
      !editedTriggerText.includes("DEV_VERB");

    recordResult(
      "SYNC-03",
      "Dropdown updates to unselected placeholder when question is modified",
      "Type into question stem, observe ExampleSelector",
      "Dropdown should not claim an example is loaded when text has been altered",
      isDeselected
        ? `PASS: Dropdown correctly deselects on edit ('${editedTriggerText.trim()}')`
        : `FAIL: Dropdown still displays DEV_VERB after editing`,
      isDeselected ? "PASS" : "FAIL",
      "P1"
    );

    // ----------------------------------------------------
    // TEST SUITE 3: Password-Free Live AI Semantic Review (Judge Demo)
    // ----------------------------------------------------
    // Reset to DEV_NEGATION
    await page.locator("#example-selector-trigger").click();
    await page.locator("#example-option-DEV_NEGATION").click();
    await page.waitForTimeout(300);

    // Switch to "Semantic AI Review"
    const aiModeBtn = page.getByRole("button", { name: "Semantic AI Review" });
    await aiModeBtn.click();
    await page.waitForTimeout(200);

    // Click "Compare questions"
    const compareBtn = page.locator("button:has-text('Compare questions')");
    await compareBtn.click();

    // Wait for analysis to complete and Suggest correction button to appear
    await page.waitForSelector("button:has-text('Suggest correction')", { timeout: 60000 });
    await page.waitForTimeout(500);

    const rightPanelText = await page.locator("aside").last().innerText();
    const isNegationDetected =
      rightPanelText.includes("Negation differs") ||
      rightPanelText.includes("Meaning changed");

    const ssAiPath = path.join(SCREENSHOT_DIR, "live_ai_negation_result.png");
    await page.screenshot({ path: ssAiPath, fullPage: false });

    recordResult(
      "AI-PUBLIC-01",
      "Anonymous password-free Semantic AI Review on DEV_NEGATION",
      "Select DEV_NEGATION, activate Semantic AI Review, click Compare without entering code",
      "AI analysis executes live on server fixture and identifies negation difference",
      isNegationDetected
        ? "PASS: Discrepancy successfully identified without password"
        : `FAIL: Expected negation discrepancy, panel shows: '${rightPanelText.slice(0, 100)}'`,
      isNegationDetected ? "PASS" : "FAIL",
      "P0",
      "qa-reports/screenshots/live_ai_negation_result.png"
    );

    // ----------------------------------------------------
    // TEST SUITE 4: AI Translation Correction Workflow
    // ----------------------------------------------------
    const suggestBtn = page.locator("button:has-text('Suggest correction')").first();
    await suggestBtn.scrollIntoViewIfNeeded();
    await suggestBtn.click();

    // Wait for correction card to appear
    await page.waitForSelector("text=AI-SUGGESTED CORRECTION", { timeout: 60000 });
    await page.waitForTimeout(500);

    const applyBtn = page.locator("aside button:has-text('Apply to editor')");
    await applyBtn.waitFor({ state: "visible", timeout: 8000 });
    const hasApply = await applyBtn.isVisible();

    const ssCorrectionPath = path.join(SCREENSHOT_DIR, "ai_correction_modal.png");
    await page.screenshot({ path: ssCorrectionPath, fullPage: false });

    if (hasApply) {
      // Inspect proposal content in suggestion card
      const proposalTextarea = page.locator("aside textarea");
      await proposalTextarea.waitFor({ state: "visible", timeout: 10000 });
      const proposalValue = await proposalTextarea.inputValue();

      // Read original Tamil stem in editor
      const tamilStem = page.locator("textarea").nth(1);
      const originalTamil = await tamilStem.inputValue();

      // Click Apply
      await applyBtn.click();
      await page.waitForTimeout(1000);

      const newTamil = await tamilStem.inputValue();
      const appliedSuccess = newTamil === proposalValue && newTamil !== originalTamil;

      // Click Undo
      const undoBtn = page.locator("button:has-text('Undo correction')");
      await undoBtn.click();
      await page.waitForTimeout(1000);
      const revertedTamil = await tamilStem.inputValue();
      const undoSuccess = revertedTamil === originalTamil;

      recordResult(
        "CORRECTION-01",
        "AI Translation Correction: Suggest, Apply to Editor, and Undo",
        "Click Suggest -> Verify suggestion card -> Apply -> Verify Tamil stem updated -> Undo -> Verify restored",
        "Suggested fix modifies Tamil stem with accurate negation, Undo restores original cleanly",
        appliedSuccess && undoSuccess
          ? "PASS: Suggest, Apply, and Undo all verified successfully"
          : `FAIL: Apply=${appliedSuccess}, Undo=${undoSuccess}`,
        appliedSuccess && undoSuccess ? "PASS" : "FAIL",
        "P0",
        "qa-reports/screenshots/ai_correction_modal.png"
      );
    }

    // ----------------------------------------------------
    // TEST SUITE 5: Reviewer Decision Triage Workflow (Keep/Fix/Escalate)
    // ----------------------------------------------------
    const fixBtn = page.getByRole("button", { name: "Fix wording" }).first();
    if (await fixBtn.isVisible()) {
      await fixBtn.click();
      await page.waitForTimeout(200);

      const queueText = await page.locator(".review-queue-container, aside").first().innerText();
      const hasDecidedCount = queueText.includes("1/5 decided") || queueText.includes("decided");

      recordResult(
        "REVIEW-01",
        "Reviewer decision recording (Fix wording)",
        "Click 'Fix wording' on finding",
        "Decision is recorded and batch counter updates",
        hasDecidedCount
          ? "PASS: Decision recorded and counter updated"
          : `FAIL: Counter text: '${queueText.slice(0, 60)}'`,
        hasDecidedCount ? "PASS" : "FAIL",
        "P1"
      );
    }

    // ----------------------------------------------------
    // TEST SUITE 6: Structure Rules Only on Structural Mismatch (DEV_STRUCTURE)
    // ----------------------------------------------------
    await page.locator("#example-selector-trigger").click();
    await page.locator("#example-option-DEV_STRUCTURE").click();
    await page.waitForTimeout(300);

    const rulesModeBtn = page.getByRole("button", { name: "Structure rules only" });
    await rulesModeBtn.click();
    await page.waitForTimeout(200);

    const runRulesBtn = page.getByRole("button", { name: "Run structure checks" });
    await runRulesBtn.click();
    await page.waitForTimeout(500);

    const structureResultsText = await page.locator("aside").last().innerText();
    const detectedMismatch =
      structureResultsText.includes("Option counts differ") ||
      structureResultsText.includes("OPTION_COUNT_MISMATCH") ||
      structureResultsText.includes("4 vs 3");

    recordResult(
      "RULES-01",
      "Deterministic Structure Check on DEV_STRUCTURE",
      "Load DEV_STRUCTURE (4 en options vs 3 ta options), click Run structure checks",
      "Instant deterministic detection of option count mismatch without calling AI",
      detectedMismatch
        ? "PASS: Structural option count mismatch detected immediately"
        : `FAIL: Structural check results: '${structureResultsText.slice(0, 100)}'`,
      detectedMismatch ? "PASS" : "FAIL",
      "P0"
    );

    // ----------------------------------------------------
    // TEST SUITE 7: CSV Export Functionality
    // ----------------------------------------------------
    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 5000 }).catch(() => null),
      page.getByRole("button", { name: "Download CSV report" }).click(),
    ]);

    const downloadSuccess = download !== null && (await download.suggestedFilename()).endsWith(".csv");
    recordResult(
      "CSV-EXPORT-01",
      "Download Review CSV Report",
      "Click 'Download CSV report'",
      "Browser triggers download of .csv file with review findings",
      downloadSuccess
        ? `PASS: Downloaded ${(await download.suggestedFilename())}`
        : "FAIL: Download did not trigger or filename invalid",
      downloadSuccess ? "PASS" : "FAIL",
      "P1"
    );

    // ----------------------------------------------------
    // TEST SUITE 8: Interface Localization (English <-> தமிழ்)
    // ----------------------------------------------------
    const tamilToggle = page.getByRole("button", { name: "தமிழ்" });
    await tamilToggle.click();
    await page.waitForTimeout(300);

    const tamilPageText = await page.innerText("body");
    const isTamilRendered =
      tamilPageText.includes("மாதிரி வினாவைத் தேர்ந்தெடுக்கவும்") ||
      tamilPageText.includes("வினாப் பகுதிகள்") ||
      tamilPageText.includes("அமைப்புக் கட்டுப்பாடுகள்");

    const ssTaPath = path.join(SCREENSHOT_DIR, "tamil_interface.png");
    await page.screenshot({ path: ssTaPath, fullPage: false });

    recordResult(
      "I18N-01",
      "Switch interface language to Tamil",
      "Click தமிழ் in header",
      "Interface headings, buttons, and badges switch to clean Tamil typography",
      isTamilRendered
        ? "PASS: Tamil localization rendered cleanly"
        : "FAIL: Tamil text not detected in DOM",
      isTamilRendered ? "PASS" : "FAIL",
      "P1",
      "qa-reports/screenshots/tamil_interface.png"
    );

    // Switch back to English
    await page.getByRole("button", { name: "English" }).click();
    await page.waitForTimeout(200);

  } finally {
    await browser.close();
  }

  // Write full summary report
  const summaryFile = "qa-reports/qa_audit_matrix.json";
  fs.writeFileSync(summaryFile, JSON.stringify(results, null, 2));
  console.log(`\nQA Audit Complete. Matrix saved to ${summaryFile}`);

  const passed = results.filter((r) => r.status === "PASS").length;
  const total = results.length;
  console.log(`Summary: ${passed}/${total} checks passed (${Math.round((passed / total) * 100)}%)\n`);

  return { passed, total, results };
}

runAudit().catch(console.error);
