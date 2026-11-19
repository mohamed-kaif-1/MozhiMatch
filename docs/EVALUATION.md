# Evaluation & Verification Plan

This document outlines the evaluation framework for MozhiMatch, detailing test fixtures, the role of offline scripts, and the protocol for live AI verification.

---

## Fixture Datasets

The repository maintains two synthetic test sets in `src/fixtures/`:

1. **Development Set (`src/fixtures/development.json`)**:
   5 paired English–Tamil multiple choice items designed for local development and allowlisted practice in demo environments:
   - `DEV_NEGATION`: Negation drop in Tamil stem (`NOT a fruit` vs `இவற்றில் பழம் எது?`).
   - `DEV_VERB`: Direction of action flipped in stem (`received` vs `வழங்கப்பட்டது`).
   - `DEV_CLEAN`: Parallel, semantically equivalent item serving as a clean control.
   - `DEV_UNCERTAIN`: Ambiguous proper name transliteration (`K. Arumugam` vs `க. ஆறுமுகம்`).
   - `DEV_STRUCTURE`: Structural option count mismatch (4 English options vs 3 Tamil options).

2. **Holdout Set (`src/fixtures/holdout-inputs.json` & `src/fixtures/holdout-expected.json`)**:
   10 synthetic items covering material discrepancies, clean controls, and ambiguity cases for human and automated review.

---

## Clarification on `scripts/evaluate.ts` & Evaluation CSVs

> [!IMPORTANT]
> **Important Note on `scripts/evaluate.ts`:**
> The evaluation script (`scripts/evaluate.ts`), executed via `npm run eval:development` and `npm run eval:holdout`, is an **offline development utility** that:
> 1. Parses fixture JSON files;
> 2. Runs pure deterministic structural checks (`runRules()`);
> 3. Maps known fixture IDs (such as `DEV_NEGATION` or `DEV_VERB`) to expected statuses for test coverage reporting;
> 4. Emits summary CSVs (`evaluation/results-development.csv`, `evaluation/results-holdout.csv`).
>
> **It does not perform live AI model inference.** Even if environment variables indicate an API key is present, the script generates rule and fixture summaries rather than live LLM evaluations.
>
> **Do not treat these CSV outputs as measured AI accuracy, semantic benchmarks, or model precision percentages.** Actual live model evaluation must be verified through end-to-end browser and API network interaction with the Google Generative Language API.

---

## Verification Layers

To ensure honest reporting, MozhiMatch evaluates quality across five distinct layers:

1. **Automated Unit & Contract Tests (`npm run test`)**:
   - 44 tests across 9 test suites (Vitest).
   - Validates structural rules, Zod schemas, exact quote matching, timing-safe authorization, export summaries, and UI state reducer transitions.
2. **Static Quality Gates (`npm run typecheck`, `npm run lint`, `npm run build`)**:
   - TypeScript compiler (`tsc --noEmit`), ESLint 9, and Next.js 16.4.6 production compiler.
3. **Local Browser Smoke Tests**:
   - Tested through Chrome DevTools Protocol at `http://localhost:3000`.
   - Validates text entry, option addition/removal, Rules mode analysis, live AI analysis with reviewer consent, Keep/Fix/Escalate triage buttons, clipboard copy, and zero-overflow mobile viewports (375px & 390px) with 44px minimum touch targets.
4. **Live Provider API Calls**:
   - Verified via network inspections of requests to `POST https://generativelanguage.googleapis.com/v1beta/models/...:generateContent`.
   - Confirms valid JSON payloads conforming to `PROVIDER_RESPONSE_SCHEMA` and exact verbatim quote matches in Tamil and English source text.
5. **Public Cloud Deployment Verification**:
   - Currently pending deployment on Vercel. Local production builds and browser testing are 100% verified.
