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
node --experimental-strip-types scripts/evaluate.ts --split development --mode live_ai
node --experimental-strip-types scripts/evaluate.ts --split holdout --mode live_ai
```

### Evaluation Mode Contracts

1. **Rules Mode (`--mode rules`)**:
   - Executes the production structural rules engine (`checkStructuralRules()`).
   - Identifies option count mismatches, duplicate labels, label set parity, Tamil numerals (`௦–௯`), numeric tokens, and unit differences.
   - Per the production safety contract, rules-only items are assigned status `needs_review` because deterministic checks cannot certify semantic equivalence.
2. **Live AI Mode (`--mode live_ai`)**:
   - Opt-in only. Requires `GEMINI_API_KEY` and `AI_MODE !== "off"`.
   - If credentials are not present, the runner explicitly marks results `not_run` and exits safely without faking predictions or assigning `live_ai` labels.
   - When executed, sends bounded requests to the Google Generative Language API (`gemini-2.5-flash`), enforces the JSON response schema, and verifies exact verbatim substring quotes in both English and Tamil text.
   - Any grounding failure or timeout safely falls back to `needs_review`.

### Metrics & CSV Artifacts

The runner scores predictions against expected ground-truth labels and outputs:
- **Exact Match Ratio**: Predictions matching expected status.
- **Material Hits**: Discrepancies correctly identified as `meaning_changed`.
- **Critical Misses**: Material changes falsely marked as `no_issue_found` (0 allowed).
- **False Alarms**: Clean controls falsely flagged as `meaning_changed`.
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
