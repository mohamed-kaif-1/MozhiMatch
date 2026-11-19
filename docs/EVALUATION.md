# Evaluation & Verification Plan

This document outlines the evaluation framework for MozhiMatch, detailing synthetic benchmark fixtures, the production evaluation runner (`scripts/evaluate.ts`), and honest metric reporting.

---

## Fixture Datasets

The repository maintains two original synthetic test sets in `src/fixtures/`:

1. **Development Set (`src/fixtures/development.json`)**:
   5 paired English–Tamil multiple choice items designed for local development and allowlisted practice in demo environments:
   - `DEV_NEGATION`: Negation drop in Tamil stem (`NOT a fruit` vs `இவற்றில் பழம் எது?`). Expected: `meaning_changed`.
   - `DEV_VERB`: Direction of action flipped in stem (`received` vs `வழங்கப்பட்டது`). Expected: `meaning_changed`.
   - `DEV_CLEAN`: Parallel, semantically equivalent item serving as a clean control. Expected: `no_issue_found`.
   - `DEV_UNCERTAIN`: Ambiguous proper name transliteration (`K. Arumugam` vs `க. ஆறுமுகம்`). Expected: `needs_review`.
   - `DEV_STRUCTURE`: Structural option count mismatch (4 English options vs 3 Tamil options). Expected: `needs_review`.

2. **Holdout Set (`src/fixtures/holdout-inputs.json` & `src/fixtures/holdout-expected.json`)**:
   10 synthetic items covering material discrepancies, clean controls, and ambiguity cases for automated evaluation and human auditing.

---

## Production Evaluation Runner (`scripts/evaluate.ts`)

The evaluation runner supports two explicitly chosen modes:

```bash
# 1. Production Structural Rules Evaluation (default, zero-cost)
npm run eval:development
npm run eval:holdout

# 2. Opt-in Live AI Semantic Evaluation (requires GEMINI_API_KEY)
npx tsx scripts/evaluate.ts --split development --mode live_ai
npx tsx scripts/evaluate.ts --split holdout --mode live_ai
```

### Evaluation Mode Contracts

1. **Rules Mode (`--mode rules`)**:
   - Executes the shared production structural rules engine (`checkStructuralRules()`).
   - Identifies option count mismatches, duplicate labels, label set parity, Tamil numerals (`௦–௯`), numeric tokens, and unit differences.
   - Per the production safety contract, rules-only items are assigned status `needs_review` because deterministic checks cannot certify semantic equivalence.
2. **Live AI Mode (`--mode live_ai`)**:
   - Opt-in only. Requires `GEMINI_API_KEY` and `AI_MODE !== "off"`.
   - If credentials are not present, the runner explicitly marks results `not_run` and exits safely without faking predictions or assigning synthetic outcomes.
   - Uses shared production modules directly (`checkStructuralRules`, `isStructurallyBlocked`, `validateItemComparisons`, and production prompts from `src/lib/`).
   - Structurally blocked items are detected and excluded upfront before any provider call.
   - Enforces the production timeout (`APP_LIMITS.PROVIDER_TIMEOUT_MS`).
   - Validates complete stem-and-option coverage using the shared production evidence engine: empty or partial comparisons are rejected and never produce `no_issue_found`.
   - Explicitly distinguishes successful material detections (`meaning_changed`) from model abstentions / ambiguities (`needs_review` due to `uncertain`), structural blocks (`rules_blocked`), clean passes (`no_issue_found`), and unrun executions (`not_run`).

### Metrics & CSV Artifacts

The runner scores predictions against expected ground-truth labels and outputs:
- **Exact Match Ratio**: Predictions matching expected status.
- **Material Meaning Change Detections**: Material discrepancies correctly identified as `meaning_changed`.
- **Ambiguities / Model Abstentions**: Items where the model abstained or flagged uncertainty (`needs_review`).
- **Clean Passes**: Clean controls verified equivalent (`no_issue_found`).
- **Structurally Blocked**: Items excluded from provider calls due to structural incompatibilities.
- **Grounded Evidence Ratio**: Percentage of items with verbatim source quotations.

Results are written to `evaluation/results-development.csv` and `evaluation/results-holdout.csv` with columns:
```csv
fixture_id,condition,status,expected_status,structural_issues,evidence_grounded,notes
```

---

## Verification Layers

1. **Automated Unit & Contract Tests (`npm run test`)**:
   - **57 tests across 11 test suites** (Vitest).
   - Validates CSV import (encoding, BOM, multiline, option pairing, atomicity), CSV export (formula injection sanitization, summary rows, BOM), structural rules, Zod schemas, exact quote matching, timing-safe authorization, and review state reducer transitions.
2. **Static Quality Gates (`npm run typecheck`, `npm run lint`, `npm run build`)**:
   - TypeScript 5.9 strict type checking, ESLint 9, and Next.js 16.4.6 production compilation.
3. **Local Browser Smoke Tests**:
   - Verified via Chrome DevTools Protocol at `http://localhost:3000`.
   - Validates CSV template download, sample batch import preview, atomic replacement confirmation, structural analysis, Keep/Fix/Escalate triage decisions, status filtering, CSV report download, and mobile viewports (375px & 390px with zero horizontal scroll and 44px minimum touch targets).
4. **Live Provider API Calls**:
   - Verified network interactions with Google Generative Language REST API (`/v1beta/models/...:generateContent`).
   - Validates JSON payload compliance, verbatim evidence extraction, and `mode: "live_ai"` responses.
5. **Public Cloud Deployment Verification**:
   - Production builds succeed locally; public cloud deployment is pending.
