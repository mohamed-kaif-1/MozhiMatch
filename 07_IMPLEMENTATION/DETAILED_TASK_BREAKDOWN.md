# Task-level execution details

Canonical schedule is tasks.json. All tasks start PLANNED, application checks NOT RUN. Shared files use the owner boundary in TEAM_ALLOCATION.md. Runtime source filenames in task outputs will be created during implementation.

## K01 — Verify entry, brief and local repository

Phase 00. Owner Kaif. Elapsed 00:00–00:15, 15 minutes. Dependencies baseline and authorized environment.

Files `PROJECT_BASELINE.md, HANDOFF.md`. Steps — Inspect source event context, local directory and Git status; record solo/team constraint. Acceptance — Event eligibility and exact challenge fit recorded; existing files preserved.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `PROJECT_BASELINE.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_00.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K02 — Check Node and resolve package candidate

Phase 00. Owner Kaif. Elapsed 00:15–00:30, 15 minutes. Dependencies K01.

Files `package.json, package-lock.json`. Steps — Use Node 24 LTS; inspect pinned package candidate; resolve peer constraints without paid services. Acceptance — Dependency install succeeds or exact engine/peer blocker recorded.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `package.json`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_01.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K03 — Mirror request schema in Zod

Phase 02. Owner Kaif. Elapsed 00:30–00:45, 15 minutes. Dependencies K02.

Files `src/lib/contracts/schemas.ts, src/lib/contracts/types.ts`. Steps — Add strict objects, enums and bounds; export inferred types; keep schema parity. Acceptance — Development request parses and bad ID/blank text rejects.

Check `npm run test` after the corresponding scripts/source exist. Artifact `src/lib/contracts/schemas.ts`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_03.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K04 — Implement structural label checks

Phase 01. Owner Kaif. Elapsed 00:45–01:00, 15 minutes. Dependencies K03.

Files `src/lib/core/rules.ts, tests/unit/rules.test.ts`. Steps — Compare counts and label sets before AI; return review candidates with field refs. Acceptance — Different counts/labels and duplicates produce exact codes.

Check `npm run test` after the corresponding scripts/source exist. Artifact `src/lib/core/rules.ts`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_02.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K05 — Build exact-source evidence validator

Phase 01. Owner Kaif. Elapsed 01:00–01:15, 15 minutes. Dependencies K04.

Files `src/lib/core/evidence.ts, tests/unit/evidence.test.ts`. Steps — Map fixed item/field; enforce quote uniqueness; compute safe spans and coverage. Acceptance — Invented/cross-item quotes reject; exact UTF-16 slices match.

Check `npm run test` after the corresponding scripts/source exist. Artifact `src/lib/core/evidence.ts`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_02.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K06 — Build native-fetch proof adapter

Phase 01. Owner Kaif. Elapsed 01:15–01:30, 15 minutes. Dependencies K05.

Files `src/lib/ai/gemini.ts, src/lib/ai/prompt.ts`. Steps — Load server-only config; use fixed endpoint and structured schema; abort at 25 seconds. Acceptance — One authorised original item returns parsable shape or explicit failure.

Check `npm run test` after the corresponding scripts/source exist. Artifact `src/lib/ai/gemini.ts`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_02.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K07 — Run development model comparisons

Phase 01. Owner Kaif. Elapsed 01:30–01:45, 15 minutes. Dependencies K06.

Files `scripts/evaluate.ts, evaluation/development.json`. Steps — Use original fixtures plus separately reviewed known-source examples; record settings and prompts. Acceptance — Development outcomes and generic baseline recorded honestly.

Check `npm run test` after the corresponding scripts/source exist. Artifact `scripts/evaluate.ts`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_02.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K08 — Break and checkpoint notes

Phase 01. Owner Kaif. Elapsed 01:45–02:00, 15 minutes. Dependencies K07.

Files `HANDOFF.md`. Steps — Take 15-minute break; preserve last coherent result. Acceptance — Current state saved without secret values.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `HANDOFF.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_02.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K09 — Freeze prompt and label protocol

Phase 01. Owner Kaif. Elapsed 02:00–02:15, 15 minutes. Dependencies K08.

Files `evaluation/freeze.json, HANDOFF.md`. Steps — Confirm bilingual labels before use; if already seen, replace heldout before testing. Acceptance — Prompt hash/settings and heldout access status recorded.

Check `npm run test` after the corresponding scripts/source exist. Artifact `evaluation/freeze.json`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_02.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K10 — Run heldout and generic comparison

Phase 01. Owner Kaif. Elapsed 02:15–02:30, 15 minutes. Dependencies K09.

Files `evaluation/holdout.json`. Steps — Run same inputs on app and strong generic; capture source validity and time boundaries. Acceptance — Frozen metrics measured with sample denominators.

Check `npm run test` after the corresponding scripts/source exist. Artifact `evaluation/holdout.json`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_02.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K11 — Resolve feasibility gate

Phase 01. Owner Kaif. Elapsed 02:30–02:45, 15 minutes. Dependencies K10.

Files `HANDOFF.md, 13_AUDIT/UNRESOLVED_DECISIONS.md`. Steps — Evaluate exact criteria; stop concept expansion on failure and report decision. Acceptance — G1/G2 pass, fail or blocked with evidence.

Check `npm run test` after the corresponding scripts/source exist. Artifact `HANDOFF.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_02.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K12 — Freeze integration contract

Phase 02. Owner Kaif. Elapsed 02:45–03:00, 15 minutes. Dependencies K11.

Files `src/lib/contracts/schemas.ts, 03_BACKEND/API_CONTRACTS.md`. Steps — Share schema-valid examples and source-revision semantics with UI owner. Acceptance — IC1 schema/action contract committed.

Check `npm run test` after the corresponding scripts/source exist. Artifact `src/lib/contracts/schemas.ts`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_03.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K13 — Implement bounded request/access boundary

Phase 04. Owner Kaif. Elapsed 03:00–03:15, 15 minutes. Dependencies K12.

Files `src/lib/server/access.ts, src/app/api/analyze/route.ts`. Steps — Read bounded stream, validate source consent, hash code and check exact sample content. Acceptance — Origin/body/code/allowlist restrictions tested.

Check `npm run test` after the corresponding scripts/source exist. Artifact `src/lib/server/access.ts`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_05.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K14 — Implement aggregation and timeout response

Phase 05. Owner Kaif. Elapsed 03:15–03:30, 15 minutes. Dependencies K13.

Files `src/lib/core/evidence.ts, src/app/api/analyze/route.ts`. Steps — Aggregate rules and valid comparisons; return stable warning codes on 429/timeout. Acceptance — No false clear from missing fields or provider failure.

Check `npm run test` after the corresponding scripts/source exist. Artifact `src/lib/core/evidence.ts`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_06.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K15 — Add safe health route and config checks

Phase 04. Owner Kaif. Elapsed 03:30–03:45, 15 minutes. Dependencies K14.

Files `src/app/api/health/route.ts, src/lib/contracts/config.ts`. Steps — Expose safe configuration, reject malformed model ID, align fixed limits. Acceptance — Health reveals mode/presence only and makes no model call.

Check `npm run test` after the corresponding scripts/source exist. Artifact `src/app/api/health/route.ts`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_05.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K16 — Break and API handoff

Phase 04. Owner Kaif. Elapsed 03:45–04:00, 15 minutes. Dependencies K15.

Files `HANDOFF.md`. Steps — Take 15-minute break; UI owner can work from examples. Acceptance — API working state and blockers recorded.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `HANDOFF.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_05.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K17 — Run route contract regressions

Phase 09. Owner Kaif. Elapsed 04:00–04:15, 15 minutes. Dependencies K16.

Files `tests/api/analyze.test.ts`. Steps — Mock provider and clock; assert restricted requests never call upstream. Acceptance — Invalid/body/access/provider cases give expected envelopes.

Check `npm run test` after the corresponding scripts/source exist. Artifact `tests/api/analyze.test.ts`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_10.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K18 — Integrate first end-to-end item

Phase 08. Owner Kaif. Elapsed 04:15–04:30, 15 minutes. Dependencies K17, A14.

Files `src/app/api/analyze/route.ts, HANDOFF.md`. Steps — Use actual UI with owned example; inspect evidence and late-response guard. Acceptance — IC2 normal source→findings→decision passes.

Check `npm run test` after the corresponding scripts/source exist. Artifact `src/app/api/analyze/route.ts`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_09.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K19 — Deploy early shell

Phase 11. Owner Kaif. Elapsed 04:30–04:45, 15 minutes. Dependencies K18.

Files `.env.local, HANDOFF.md`. Steps — Use chosen account/project after authorisation; set exact APP_ORIGIN; no paid upgrade. Acceptance — Signed-out shell URL and safe health work or host blocker known.

Check `npm run build` after the corresponding scripts/source exist. Artifact `.env.local`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_12.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K20 — First-five-hour checkpoint and buffer

Phase 08. Owner Kaif. Elapsed 04:45–05:00, 15 minutes. Dependencies K19.

Files `HANDOFF.md`. Steps — Resolve one blocking integration issue; freeze remaining scope. Acceptance — Gate, deployed shell, contract and next critical path recorded.

Check `npm run test` after the corresponding scripts/source exist. Artifact `HANDOFF.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_09.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K21 — Extend number and unit candidate checks

Phase 04. Owner Kaif. Elapsed 05:00–05:30, 30 minutes. Dependencies K20.

Files `src/lib/core/rules.ts`. Steps — Add controlled aliases, preserve raw strings and mark differences as candidates. Acceptance — Tamil digits and approved unit aliases tested.

Check `npm run test` after the corresponding scripts/source exist. Artifact `src/lib/core/rules.ts`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_05.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K22 — Tighten field coverage and grapheme boundaries

Phase 05. Owner Kaif. Elapsed 05:30–06:00, 30 minutes. Dependencies K21.

Files `src/lib/core/evidence.ts`. Steps — Test duplicate slots and Intl.Segmenter boundaries. Acceptance — Every item has exact fixed slots and safe raw spans.

Check `npm run test` after the corresponding scripts/source exist. Artifact `src/lib/core/evidence.ts`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_06.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K23 — Review UI/API integration contract

Phase 08. Owner Kaif. Elapsed 06:00–06:30, 30 minutes. Dependencies K22.

Files `HANDOFF.md`. Steps — Check expected item states in actual UI and resolve one boundary issue. Acceptance — IC3 real and fallback results align.

Check `npm run test` after the corresponding scripts/source exist. Artifact `HANDOFF.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_09.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K24 — Record gate evidence cleanly

Phase 05. Owner Kaif. Elapsed 06:30–07:00, 30 minutes. Dependencies K23.

Files `evaluation/summary.md`. Steps — Separate synthetic/authentic development references and unrun competitor tests. Acceptance — Model/prompt/sample counts and comparison limits recorded.

Check `npm run test` after the corresponding scripts/source exist. Artifact `evaluation/summary.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_06.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K25 — Meal and rest break

Phase 08. Owner Kaif. Elapsed 07:00–07:30, 30 minutes. Dependencies K24.

Files `HANDOFF.md`. Steps — Take a full break; no parallel assigned task. Acceptance — Working state saved.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `HANDOFF.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_09.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K26 — Harden bounded body and content errors

Phase 09. Owner Kaif. Elapsed 07:30–08:00, 30 minutes. Dependencies K25.

Files `tests/api/analyze.test.ts`. Steps — Exercise exact byte cap and stable error envelopes. Acceptance — Chunked overflow/non-JSON safely reject.

Check `npm run test` after the corresponding scripts/source exist. Artifact `tests/api/analyze.test.ts`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_10.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K27 — Harden hosted operator/sample controls

Phase 09. Owner Kaif. Elapsed 08:00–08:30, 30 minutes. Dependencies K26.

Files `src/lib/server/access.ts, tests/api/access.test.ts`. Steps — Test ID-only bypass, missing Origin and exact raw allowlist equality. Acceptance — Wrong code or modified sample never reaches provider.

Check `npm run test` after the corresponding scripts/source exist. Artifact `src/lib/server/access.ts`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_10.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K28 — Implement safe operational metadata

Phase 04. Owner Kaif. Elapsed 08:30–09:00, 30 minutes. Dependencies K27.

Files `src/app/api/analyze/route.ts`. Steps — Capture request ID/status/time only and test redaction. Acceptance — Logs exclude all source and credentials.

Check `npm run test` after the corresponding scripts/source exist. Artifact `src/app/api/analyze/route.ts`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_05.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K29 — Integration buffer

Phase 08. Owner Kaif. Elapsed 09:00–09:30, 30 minutes. Dependencies K28.

Files `HANDOFF.md`. Steps — Reserve time for actual failure; no speculative feature. Acceptance — Highest blocking integration defect addressed.

Check `npm run test` after the corresponding scripts/source exist. Artifact `HANDOFF.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_09.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K30 — Production build and engine check

Phase 11. Owner Kaif. Elapsed 09:30–10:00, 30 minutes. Dependencies K29.

Files `package-lock.json`. Steps — Inspect install/build warnings and resolve only required compatibility. Acceptance — Build/typecheck pass on selected runtime.

Check `npm run build` after the corresponding scripts/source exist. Artifact `package-lock.json`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_12.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K31 — Break

Phase 08. Owner Kaif. Elapsed 10:00–10:30, 30 minutes. Dependencies K30.

Files `HANDOFF.md`. Steps — Take 30-minute break. Acceptance — Checkpoint retained.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `HANDOFF.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_09.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K32 — Provider response failure hardening

Phase 09. Owner Kaif. Elapsed 10:30–11:00, 30 minutes. Dependencies K31.

Files `src/lib/ai/gemini.ts, tests/api/analyze.test.ts`. Steps — Mock finish states, empty response and parse failure. Acceptance — Refusal/truncation/429/5xx remain honest fallback.

Check `npm run test` after the corresponding scripts/source exist. Artifact `src/lib/ai/gemini.ts`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_10.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K33 — Manual review-state audit

Phase 09. Owner Kaif. Elapsed 11:00–11:30, 30 minutes. Dependencies K32.

Files `tests/unit/review-state.test.ts`. Steps — Coordinate UI-owned reducer fixes through handoff. Acceptance — Edits/decisions/locale/retry preserve invariants.

Check `npm run test` after the corresponding scripts/source exist. Artifact `tests/unit/review-state.test.ts`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_10.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K34 — Freeze final evaluation protocol

Phase 05. Owner Kaif. Elapsed 11:30–12:00, 30 minutes. Dependencies K33.

Files `evaluation/freeze.json`. Steps — Replace leaked holdout if necessary; freeze configuration. Acceptance — Holdout use and label review explicitly recorded.

Check `npm run test` after the corresponding scripts/source exist. Artifact `evaluation/freeze.json`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_06.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K35 — Run authorised final model evaluation

Phase 05. Owner Kaif. Elapsed 12:00–12:30, 30 minutes. Dependencies K34.

Files `evaluation/final-results.json`. Steps — Use original authorised content and comparator parity. Acceptance — Actual result set recorded, no predicted scores.

Check `npm run test` after the corresponding scripts/source exist. Artifact `evaluation/final-results.json`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_06.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K36 — Re-test deployed API modes

Phase 11. Owner Kaif. Elapsed 12:30–13:00, 30 minutes. Dependencies K35.

Files `HANDOFF.md`. Steps — Check origin/code/access configuration on deployed URL. Acceptance — Public rules and operator live mode verified.

Check `npm run build` after the corresponding scripts/source exist. Artifact `HANDOFF.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_12.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K37 — Meal and rest break

Phase 08. Owner Kaif. Elapsed 13:00–13:30, 30 minutes. Dependencies K36.

Files `HANDOFF.md`. Steps — Take a full break. Acceptance — Current state committed or safely saved.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `HANDOFF.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_09.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K38 — Resolve highest-risk defects

Phase 09. Owner Kaif. Elapsed 13:30–14:00, 30 minutes. Dependencies K37.

Files `tests/api/analyze.test.ts, HANDOFF.md`. Steps — Fix actual failures and rerun only affected checks. Acceptance — No critical source/evidence/access defect open.

Check `npm run test` after the corresponding scripts/source exist. Artifact `tests/api/analyze.test.ts`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_10.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K39 — Verify no paid dependency or secret

Phase 09. Owner Kaif. Elapsed 14:00–14:30, 30 minutes. Dependencies K38.

Files `package.json, .gitignore`. Steps — Inspect all staged/build outputs with safe canary checks. Acceptance — Dependency/asset/staged checks clean.

Check `npm run test` after the corresponding scripts/source exist. Artifact `package.json`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_14.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K40 — Integration and contract freeze

Phase 08. Owner Kaif. Elapsed 14:30–15:00, 30 minutes. Dependencies K39.

Files `HANDOFF.md`. Steps — Agree no new features; preserve response compatibility. Acceptance — IC4 frozen release candidate shape.

Check `npm run test` after the corresponding scripts/source exist. Artifact `HANDOFF.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_09.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K41 — Documentation catch-up

Phase 12. Owner Kaif. Elapsed 15:00–15:30, 30 minutes. Dependencies K40.

Files `README.md, HANDOFF.md`. Steps — Replace blueprint future tense only where implemented and tested. Acceptance — Setup, limits and results match implementation.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `README.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_13.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K42 — Break and contingency

Phase 08. Owner Kaif. Elapsed 15:30–16:00, 30 minutes. Dependencies K41.

Files `HANDOFF.md`. Steps — Use 30 minutes for rest unless blocked release dependency. Acceptance — Rest or documented recovery action.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `HANDOFF.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_09.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K43 — Rehearse backend failure path

Phase 12. Owner Kaif. Elapsed 16:00–16:30, 30 minutes. Dependencies K42.

Files `11_DEPLOYMENT/DEMO_RUNBOOK.md`. Steps — Run rules-only alternative and labelled replay separately. Acceptance — Timeout/offline sequence clear and truthful.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `11_DEPLOYMENT/DEMO_RUNBOOK.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_13.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K44 — Prepare judge evidence table

Phase 12. Owner Kaif. Elapsed 16:30–17:00, 30 minutes. Dependencies K43.

Files `evaluation/summary.md`. Steps — Show only executed results; explain remaining uncertainty. Acceptance — Counts, denominator and baseline visible.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `evaluation/summary.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_13.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K45 — Smoke tests after final merge

Phase 09. Owner Kaif. Elapsed 17:00–17:30, 30 minutes. Dependencies K44.

Files `HANDOFF.md`. Steps — Run release commands and inspect exact failures. Acceptance — Unit/API/type/lint/build results recorded.

Check `npm run test` after the corresponding scripts/source exist. Artifact `HANDOFF.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_10.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K46 — Deployment repair buffer

Phase 11. Owner Kaif. Elapsed 17:30–18:00, 30 minutes. Dependencies K45.

Files `HANDOFF.md`. Steps — Inspect build/log metadata; redeploy last good release. Acceptance — URL/API/config recover if needed.

Check `npm run build` after the corresponding scripts/source exist. Artifact `HANDOFF.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_12.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K47 — Meal and rest break

Phase 08. Owner Kaif. Elapsed 18:00–18:30, 30 minutes. Dependencies K46.

Files `HANDOFF.md`. Steps — Take a full break. Acceptance — Known working release preserved.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `HANDOFF.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_09.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K48 — Final adversarial audit

Phase 12. Owner Kaif. Elapsed 18:30–19:00, 30 minutes. Dependencies K47.

Files `13_AUDIT/UNRESOLVED_DECISIONS.md`. Steps — Challenge source traceability, baseline advantage and failure labels. Acceptance — Critical risks addressed or explicit no-go.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `13_AUDIT/UNRESOLVED_DECISIONS.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_14.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K49 — Rehearse two-minute pitch

Phase 12. Owner Kaif. Elapsed 19:00–19:30, 30 minutes. Dependencies K48.

Files `11_DEPLOYMENT/DEMO_SCRIPT.md`. Steps — Time narrative and reduce unsupported claims. Acceptance — Pitch within two minutes with live unknown case.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `11_DEPLOYMENT/DEMO_SCRIPT.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_13.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K50 — Freeze code and verify repo

Phase 12. Owner Kaif. Elapsed 19:30–20:00, 30 minutes. Dependencies K49.

Files `README.md, HANDOFF.md`. Steps — Inspect last commit and all required links. Acceptance — IC5 public repo content matches deployed release.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `README.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_14.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K51 — Independent signed-out smoke

Phase 11. Owner Kaif. Elapsed 20:00–20:30, 30 minutes. Dependencies K50.

Files `HANDOFF.md`. Steps — Use Aasim results if permitted, otherwise run a separate fresh session. Acceptance — Fresh browser route and operator flow verified.

Check `npm run build` after the corresponding scripts/source exist. Artifact `HANDOFF.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_12.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K52 — Rest and submission buffer

Phase 12. Owner Kaif. Elapsed 20:30–21:00, 30 minutes. Dependencies K51.

Files `HANDOFF.md`. Steps — Take break or recover a confirmed blocker. Acceptance — Release unchanged.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `HANDOFF.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_13.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K53 — Prepare submission fields

Phase 12. Owner Kaif. Elapsed 21:00–21:30, 30 minutes. Dependencies K52.

Files `README.md`. Steps — Check exact dashboard requirements against available evidence. Acceptance — Problem/features/tech/live/repo fields ready.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `README.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_13.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K54 — Submit within authorised event scope

Phase 12. Owner Kaif. Elapsed 21:30–22:00, 30 minutes. Dependencies K53.

Files `HANDOFF.md`. Steps — Use entrant account and exact event fields; never assume success from click. Acceptance — Success confirmation observed before deadline.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `HANDOFF.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_13.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K55 — Verify submitted links

Phase 12. Owner Kaif. Elapsed 22:00–22:30, 30 minutes. Dependencies K54.

Files `HANDOFF.md`. Steps — Reopen submitted repo/URL and verify without host login. Acceptance — IC6 success state and link accessibility recorded.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `HANDOFF.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_14.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K56 — Final recovery buffer

Phase 12. Owner Kaif. Elapsed 22:30–23:00, 30 minutes. Dependencies K55.

Files `HANDOFF.md`. Steps — Repair only verified broken link/config while window remains. Acceptance — Any allowed correction completed.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `HANDOFF.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_14.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K57 — Rest and recovery reserve

Phase 12. Owner Kaif. Elapsed 23:00–23:30, 30 minutes. Dependencies K56.

Files `HANDOFF.md`. Steps — Keep operator ready for final issue. Acceptance — No unnecessary changes.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `HANDOFF.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_14.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## K58 — Close handoff and archive result

Phase 12. Owner Kaif. Elapsed 23:30–24:00, 30 minutes. Dependencies K57.

Files `HANDOFF.md`. Steps — Record actual completion and unresolved items without secrets. Acceptance — Final commit/deploy/submission state complete.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `HANDOFF.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_14.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A01 — Read baseline and conditional team boundary

Phase 00. Owner Aasim. Elapsed 00:00–00:15, 15 minutes. Dependencies baseline and authorized environment.

Files `HANDOFF.md`. Steps — Read baseline, source ownership and current interface examples; do not assume event permission. Acceptance — Team contribution permission and selected concept understood.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `HANDOFF.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_00.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A02 — Review Tamil fixture labels

Phase 01. Owner Aasim. Elapsed 00:15–00:30, 15 minutes. Dependencies A01.

Files `evaluation/label-review.md`. Steps — Check original development wording and arrange blind holdout review if permitted. Acceptance — Proposed labels reviewed or language-review gap recorded.

Check `npm run test` after the corresponding scripts/source exist. Artifact `evaluation/label-review.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_02.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A03 — Draw source-first workbench layout

Phase 03. Owner Aasim. Elapsed 00:30–00:45, 15 minutes. Dependencies A02.

Files `src/components/workbench/Workbench.tsx`. Steps — Build semantic main/header/sections without AI assumptions. Acceptance — One-page region order follows screen spec.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `src/components/workbench/Workbench.tsx`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_04.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A04 — Implement token CSS and fonts

Phase 03. Owner Aasim. Elapsed 00:45–01:00, 15 minutes. Dependencies A03.

Files `src/app/globals.css, src/app/layout.tsx`. Steps — Copy canonical tokens, import font weights, apply visible focus and opaque source panels. Acceptance — Paper/blue/grid tokens and both local fonts load.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `src/app/globals.css`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_04.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A05 — Implement labelled paired editor

Phase 06. Owner Aasim. Elapsed 01:00–01:15, 15 minutes. Dependencies A04.

Files `src/components/workbench/PairEditor.tsx`. Steps — Use accessible controls, raw strings and limit messages. Acceptance — Stem/options/id edit with visible language labels.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `src/components/workbench/PairEditor.tsx`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_07.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A06 — Implement item/option controls

Phase 06. Owner Aasim. Elapsed 01:15–01:30, 15 minutes. Dependencies A05.

Files `src/components/workbench/PairEditor.tsx`. Steps — Preserve stable item identity; avoid unlabelled icon-only actions. Acceptance — 1–10 items and 2–5 option controls behave.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `src/components/workbench/PairEditor.tsx`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_07.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A07 — Implement revision-aware reducer

Phase 06. Owner Aasim. Elapsed 01:30–01:45, 15 minutes. Dependencies A06.

Files `src/lib/core/review-state.ts, tests/unit/review-state.test.ts`. Steps — Use explicit action states and captured revision; coordinate frozen action types. Acceptance — Edit/reset invalidates result and late IDs ignored.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `src/lib/core/review-state.ts`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_07.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A08 — Break and review notes

Phase 03. Owner Aasim. Elapsed 01:45–02:00, 15 minutes. Dependencies A07.

Files `HANDOFF.md`. Steps — Take 15-minute break; list contract questions without editing shared schema. Acceptance — UI checkpoint saved.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `HANDOFF.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_04.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A09 — Add next-intl provider

Phase 07. Owner Aasim. Elapsed 02:00–02:15, 15 minutes. Dependencies A08.

Files `src/i18n/provider.tsx, src/messages/en.json, src/messages/ta.json`. Steps — Bootstrap en, load safe stored locale after mount, update document lang. Acceptance — Locale switch preserves reducer state.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `src/i18n/provider.tsx`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_08.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A10 — Add privacy and operator controls

Phase 06. Owner Aasim. Elapsed 02:15–02:30, 15 minutes. Dependencies A09.

Files `src/components/workbench/Workbench.tsx`. Steps — Show mode, consent, source kind and password input; rules need no AI consent. Acceptance — Cloud scope/code labels visible and secret in memory only.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `src/components/workbench/Workbench.tsx`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_07.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A11 — Build mock review queue

Phase 06. Owner Aasim. Elapsed 02:30–02:45, 15 minutes. Dependencies A10.

Files `src/components/workbench/ReviewQueue.tsx`. Steps — Use delivered examples explicitly as mock fixtures during development. Acceptance — Mock statuses map to localized labels.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `src/components/workbench/ReviewQueue.tsx`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_07.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A12 — Consume frozen contract at IC1

Phase 02. Owner Aasim. Elapsed 02:45–03:00, 15 minutes. Dependencies A11.

Files `src/lib/core/review-state.ts`. Steps — Read Kaif contract commit, align status/action types without modifying shared source. Acceptance — No guessed fields or conflict with schema owner.

Check `npm run test` after the corresponding scripts/source exist. Artifact `src/lib/core/review-state.ts`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_03.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A13 — Build evidence and manual decision panel

Phase 06. Owner Aasim. Elapsed 03:00–03:15, 15 minutes. Dependencies A12, K12.

Files `src/components/workbench/EvidencePanel.tsx`. Steps — Render plain text and mark spans; buttons Keep/Fix/Escalate update revision-scoped state. Acceptance — Exact paired excerpts and separate decisions visible.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `src/components/workbench/EvidencePanel.tsx`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_07.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A14 — Connect analyze fetch and cancellation

Phase 08. Owner Aasim. Elapsed 03:15–03:30, 15 minutes. Dependencies A13, K12.

Files `src/components/workbench/Workbench.tsx`. Steps — Send same-origin JSON and code header; capture active operation; handle warnings. Acceptance — Request ID/revision guard and cancel work.

Check `npm run test` after the corresponding scripts/source exist. Artifact `src/components/workbench/Workbench.tsx`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_09.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A15 — Add empty/error/loading states

Phase 06. Owner Aasim. Elapsed 03:30–03:45, 15 minutes. Dependencies A14, K12.

Files `src/components/workbench/Workbench.tsx`. Steps — Preserve source on failure and announce busy/result once. Acceptance — Each documented state has localized next action.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `src/components/workbench/Workbench.tsx`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_07.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A16 — Break and browser-test handoff

Phase 08. Owner Aasim. Elapsed 03:45–04:00, 15 minutes. Dependencies A15, K12.

Files `HANDOFF.md`. Steps — Take 15-minute break; hand Kaif one reproducible integration case. Acceptance — UI normal and failure paths documented.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `HANDOFF.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_09.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A17 — Add plain issue-list copy preview

Phase 06. Owner Aasim. Elapsed 04:00–04:15, 15 minutes. Dependencies A16, K12.

Files `src/components/workbench/EvidencePanel.tsx`. Steps — Generate plain-text issue list from selected reviewed findings, never raw HTML. Acceptance — Clipboard rejection has selectable preview.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `src/components/workbench/EvidencePanel.tsx`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_07.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A18 — Run first integration and keyboard pass

Phase 08. Owner Aasim. Elapsed 04:15–04:30, 15 minutes. Dependencies A17, K12.

Files `tests/e2e/workbench.spec.ts`. Steps — Traverse real route with one owned sample, then provider failure. Acceptance — IC2 normal controls and focus order work.

Check `npm run test` after the corresponding scripts/source exist. Artifact `tests/e2e/workbench.spec.ts`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_09.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A19 — Check early deployed shell

Phase 11. Owner Aasim. Elapsed 04:30–04:45, 15 minutes. Dependencies A18, K12.

Files `HANDOFF.md`. Steps — Verify URL without logged-in host session; report exact screen/route issue. Acceptance — Public mode and locale load signed out.

Check `npm run build` after the corresponding scripts/source exist. Artifact `HANDOFF.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_12.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A20 — First-five-hour viewport and buffer

Phase 10. Owner Aasim. Elapsed 04:45–05:00, 15 minutes. Dependencies A19, K12.

Files `HANDOFF.md`. Steps — Check longest labels, min-width and logical source order. Acceptance — 360px Tamil source panel readable or defects listed.

Check `npm run test:e2e` after the corresponding scripts/source exist. Artifact `HANDOFF.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_11.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A21 — Improve item navigation and editing

Phase 06. Owner Aasim. Elapsed 05:00–05:30, 30 minutes. Dependencies A20, K12.

Files `src/components/workbench/PairEditor.tsx`. Steps — Test add/remove on edge limits and IDs. Acceptance — Stable selection and raw fields survive item changes.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `src/components/workbench/PairEditor.tsx`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_07.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A22 — Finish locale key coverage

Phase 07. Owner Aasim. Elapsed 05:30–06:00, 30 minutes. Dependencies A21, K12.

Files `src/messages/en.json, src/messages/ta.json`. Steps — Compare placeholders and replace hardcoded UI strings. Acceptance — All controls/errors use matching keys.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `src/messages/en.json`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_08.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A23 — Integrate current API at IC3

Phase 08. Owner Aasim. Elapsed 06:00–06:30, 30 minutes. Dependencies A22, K12.

Files `src/components/workbench/Workbench.tsx`. Steps — Use live route with public samples and mock invalid responses. Acceptance — Normal/fallback item states render correctly.

Check `npm run test` after the corresponding scripts/source exist. Artifact `src/components/workbench/Workbench.tsx`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_09.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A24 — Review Tamil explanation display

Phase 07. Owner Aasim. Elapsed 06:30–07:00, 30 minutes. Dependencies A23, K12.

Files `src/components/workbench/EvidencePanel.tsx`. Steps — Check long explanation and mixed-script source captions. Acceptance — Source never translated and model text inert.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `src/components/workbench/EvidencePanel.tsx`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_08.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A25 — Meal and rest break

Phase 08. Owner Aasim. Elapsed 07:00–07:30, 30 minutes. Dependencies A24, K12.

Files `HANDOFF.md`. Steps — Take full break. Acceptance — Current UI state saved.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `HANDOFF.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_09.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A26 — Write normal browser workflow test

Phase 09. Owner Aasim. Elapsed 07:30–08:00, 30 minutes. Dependencies A25, K12.

Files `tests/e2e/workbench.spec.ts`. Steps — Use roles and contract fixture through route boundary. Acceptance — Load→compare→inspect→decide→copy test passes.

Check `npm run test` after the corresponding scripts/source exist. Artifact `tests/e2e/workbench.spec.ts`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_10.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A27 — Write provider-failure browser test

Phase 09. Owner Aasim. Elapsed 08:00–08:30, 30 minutes. Dependencies A26, K12.

Files `tests/e2e/errors.spec.ts`. Steps — Mock timeout/invalid response without fake success. Acceptance — Unavailable path retains source and manual review.

Check `npm run test` after the corresponding scripts/source exist. Artifact `tests/e2e/errors.spec.ts`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_10.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A28 — Write stale-response browser test

Phase 09. Owner Aasim. Elapsed 08:30–09:00, 30 minutes. Dependencies A27, K12.

Files `tests/e2e/races.spec.ts`. Steps — Control network delay and inspect latest revision. Acceptance — Edit/reset prevents late result commit.

Check `npm run test` after the corresponding scripts/source exist. Artifact `tests/e2e/races.spec.ts`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_10.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A29 — Integration buffer

Phase 08. Owner Aasim. Elapsed 09:00–09:30, 30 minutes. Dependencies A28, K12.

Files `HANDOFF.md`. Steps — Coordinate changes without shared schema edits. Acceptance — Highest UI/API blocker resolved.

Check `npm run test` after the corresponding scripts/source exist. Artifact `HANDOFF.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_09.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A30 — Viewport test at 360/390px

Phase 10. Owner Aasim. Elapsed 09:30–10:00, 30 minutes. Dependencies A29, K12.

Files `tests/e2e/responsive.spec.ts`. Steps — Check source labels, options, focus and primary action. Acceptance — Both locales wrap without page overflow.

Check `npm run test:e2e` after the corresponding scripts/source exist. Artifact `tests/e2e/responsive.spec.ts`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_11.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A31 — Break

Phase 08. Owner Aasim. Elapsed 10:00–10:30, 30 minutes. Dependencies A30, K12.

Files `HANDOFF.md`. Steps — Take 30-minute break. Acceptance — Checkpoint retained.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `HANDOFF.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_09.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A32 — Viewport test at 768/1024/1440px

Phase 10. Owner Aasim. Elapsed 10:30–11:00, 30 minutes. Dependencies A31, K12.

Files `tests/e2e/responsive.spec.ts`. Steps — Assert widths and inspect dense Tamil text. Acceptance — Panels use readable width and order.

Check `npm run test:e2e` after the corresponding scripts/source exist. Artifact `tests/e2e/responsive.spec.ts`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_11.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A33 — Keyboard and dialog QA

Phase 10. Owner Aasim. Elapsed 11:00–11:30, 30 minutes. Dependencies A32, K12.

Files `src/components/workbench/Workbench.tsx`. Steps — Manual keyboard plus browser assertions. Acceptance — Focus order, reset cancel/restore and skip link work.

Check `npm run test:e2e` after the corresponding scripts/source exist. Artifact `src/components/workbench/Workbench.tsx`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_11.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A34 — Screen-reader check where available

Phase 10. Owner Aasim. Elapsed 11:30–12:00, 30 minutes. Dependencies A33, K12.

Files `HANDOFF.md`. Steps — Use NVDA on Windows if available; mark unavailable otherwise. Acceptance — Actual reader/lang/status observations recorded.

Check `npm run test:e2e` after the corresponding scripts/source exist. Artifact `HANDOFF.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_11.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A35 — Support blinded final review timing

Phase 05. Owner Aasim. Elapsed 12:00–12:30, 30 minutes. Dependencies A34, K12.

Files `evaluation/review-times.csv`. Steps — Counterbalance workflows and record familiarity limits. Acceptance — Recorded human actions and timing without label leakage.

Check `npm run test` after the corresponding scripts/source exist. Artifact `evaluation/review-times.csv`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_06.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A36 — Check production assets and fonts

Phase 11. Owner Aasim. Elapsed 12:30–13:00, 30 minutes. Dependencies A35, K12.

Files `src/app/globals.css`. Steps — Network inspect and disabled-motion pass. Acceptance — Local font loading and reduced motion work.

Check `npm run build` after the corresponding scripts/source exist. Artifact `src/app/globals.css`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_12.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A37 — Meal and rest break

Phase 08. Owner Aasim. Elapsed 13:00–13:30, 30 minutes. Dependencies A36, K12.

Files `HANDOFF.md`. Steps — Take full break. Acceptance — Known-good UI saved.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `HANDOFF.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_09.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A38 — Resolve actual layout defects

Phase 10. Owner Aasim. Elapsed 13:30–14:00, 30 minutes. Dependencies A37, K12.

Files `src/app/globals.css, src/components/workbench/EvidencePanel.tsx`. Steps — Fix min-width/wrap/line-height without changing source. Acceptance — Long Tamil text and highlights legible.

Check `npm run test:e2e` after the corresponding scripts/source exist. Artifact `src/app/globals.css`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_11.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A39 — Verify privacy and code memory

Phase 09. Owner Aasim. Elapsed 14:00–14:30, 30 minutes. Dependencies A38, K12.

Files `tests/e2e/security.spec.ts`. Steps — Inspect localStorage and source rendering. Acceptance — Refresh/reset leave locale only in storage.

Check `npm run test` after the corresponding scripts/source exist. Artifact `tests/e2e/security.spec.ts`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_10.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A40 — Freeze interaction and copy at IC4

Phase 08. Owner Aasim. Elapsed 14:30–15:00, 30 minutes. Dependencies A39, K12.

Files `HANDOFF.md`. Steps — Agree no new screen/feature after this point. Acceptance — Release interface stable.

Check `npm run test` after the corresponding scripts/source exist. Artifact `HANDOFF.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_09.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A41 — Update operator instructions

Phase 12. Owner Aasim. Elapsed 15:00–15:30, 30 minutes. Dependencies A40, K12.

Files `11_DEPLOYMENT/DEMO_RUNBOOK.md`. Steps — Write exact input, code and mode sequence. Acceptance — Operator can set up privately without key exposure.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `11_DEPLOYMENT/DEMO_RUNBOOK.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_13.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A42 — Break and contingency

Phase 08. Owner Aasim. Elapsed 15:30–16:00, 30 minutes. Dependencies A41, K12.

Files `HANDOFF.md`. Steps — Keep release scope fixed. Acceptance — Rest or confirmed issue recovery.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `HANDOFF.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_09.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A43 — Rehearse unknown and offline UI

Phase 12. Owner Aasim. Elapsed 16:00–16:30, 30 minutes. Dependencies A42, K12.

Files `11_DEPLOYMENT/DEMO_RUNBOOK.md`. Steps — Test both in same workbench without misleading replay. Acceptance — Needs_review and outage labels visible.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `11_DEPLOYMENT/DEMO_RUNBOOK.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_13.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A44 — Build honest evaluation view or static table

Phase 12. Owner Aasim. Elapsed 16:30–17:00, 30 minutes. Dependencies A43, K12.

Files `README.md`. Steps — Use counts/time already recorded by evaluation owner. Acceptance — Measured results visible without invented chart.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `README.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_13.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A45 — Browser smoke after final merge

Phase 09. Owner Aasim. Elapsed 17:00–17:30, 30 minutes. Dependencies A44, K12.

Files `tests/e2e/workbench.spec.ts`. Steps — Run critical browser tests and note mock boundaries. Acceptance — Core flow passes on release candidate.

Check `npm run test` after the corresponding scripts/source exist. Artifact `tests/e2e/workbench.spec.ts`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_10.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A46 — Deployment UI repair buffer

Phase 11. Owner Aasim. Elapsed 17:30–18:00, 30 minutes. Dependencies A45, K12.

Files `HANDOFF.md`. Steps — Verify fresh URL against local release. Acceptance — Broken config/layout issue repaired if any.

Check `npm run build` after the corresponding scripts/source exist. Artifact `HANDOFF.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_12.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A47 — Meal and rest break

Phase 08. Owner Aasim. Elapsed 18:00–18:30, 30 minutes. Dependencies A46, K12.

Files `HANDOFF.md`. Steps — Take full break. Acceptance — Current release preserved.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `HANDOFF.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_09.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A48 — Adversarial reviewer pass

Phase 12. Owner Aasim. Elapsed 18:30–19:00, 30 minutes. Dependencies A47, K12.

Files `13_AUDIT/UNRESOLVED_DECISIONS.md`. Steps — Try clean, changed and ambiguous source with exact evidence. Acceptance — False-clear and misleading copy risks challenged.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `13_AUDIT/UNRESOLVED_DECISIONS.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_14.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A49 — Rehearse operator pitch sequence

Phase 12. Owner Aasim. Elapsed 19:00–19:30, 30 minutes. Dependencies A48, K12.

Files `11_DEPLOYMENT/DEMO_SCRIPT.md`. Steps — Preload sample and privately enter code. Acceptance — Screen actions fit two-minute pitch.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `11_DEPLOYMENT/DEMO_SCRIPT.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_13.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A50 — Freeze UI at IC5

Phase 12. Owner Aasim. Elapsed 19:30–20:00, 30 minutes. Dependencies A49, K12.

Files `HANDOFF.md`. Steps — Record commit and known limitations. Acceptance — No new interactive behaviour after code freeze.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `HANDOFF.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_14.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A51 — Independent signed-out UI smoke

Phase 11. Owner Aasim. Elapsed 20:00–20:30, 30 minutes. Dependencies A50, K12.

Files `HANDOFF.md`. Steps — Avoid relying on active host login session. Acceptance — Fresh visitor can use public route and locale.

Check `npm run build` after the corresponding scripts/source exist. Artifact `HANDOFF.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_12.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A52 — Rest and submission buffer

Phase 12. Owner Aasim. Elapsed 20:30–21:00, 30 minutes. Dependencies A51, K12.

Files `HANDOFF.md`. Steps — Take break or repair confirmed link issue. Acceptance — Operator ready.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `HANDOFF.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_13.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A53 — Review submission wording

Phase 12. Owner Aasim. Elapsed 21:00–21:30, 30 minutes. Dependencies A52, K12.

Files `README.md`. Steps — Remove fake performance/privacy/originality claims. Acceptance — Claims match measured implementation.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `README.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_13.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A54 — Verify submission fields with Kaif

Phase 12. Owner Aasim. Elapsed 21:30–22:00, 30 minutes. Dependencies A53, K12.

Files `HANDOFF.md`. Steps — Read final entered links and wording if collaboration permitted. Acceptance — Live/repo/problem fields correct.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `HANDOFF.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_13.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A55 — Verify link accessibility at IC6

Phase 12. Owner Aasim. Elapsed 22:00–22:30, 30 minutes. Dependencies A54, K12.

Files `HANDOFF.md`. Steps — Test example and both locale labels. Acceptance — Submitted live link opens independently.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `HANDOFF.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_14.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A56 — Final recovery buffer

Phase 12. Owner Aasim. Elapsed 22:30–23:00, 30 minutes. Dependencies A55, K12.

Files `HANDOFF.md`. Steps — Avoid feature additions. Acceptance — Only confirmed issue fixed.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `HANDOFF.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_14.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A57 — Rest and recovery reserve

Phase 12. Owner Aasim. Elapsed 23:00–23:30, 30 minutes. Dependencies A56, K12.

Files `HANDOFF.md`. Steps — Wait ready for operator issue. Acceptance — Known working build preserved.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `HANDOFF.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_14.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.

## A58 — Complete frontend handoff

Phase 12. Owner Aasim. Elapsed 23:30–24:00, 30 minutes. Dependencies A57, K12.

Files `HANDOFF.md`. Steps — Give final module state and reproducible commands. Acceptance — Actual tests/limitations documented.

Check `Manual checkpoint with actual outcome in HANDOFF.md` after the corresponding scripts/source exist. Artifact `HANDOFF.md`. Use [prompt](../09_ANTIGRAVITY/prompts/PROMPT_14.md). Common failure — Input/contract drift, environment mismatch or previous dependency unfinished. Recovery — Preserve source, inspect the exact failed check, fix the owning module and rerun the affected check. Integration — Update HANDOFF.md with actual results; integrate at the nearest IC milestone.
