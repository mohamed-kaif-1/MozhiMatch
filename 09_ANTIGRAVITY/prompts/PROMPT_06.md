# Prompt 06 — Integrate live model and output validation

Read root AGENTS.md and HANDOFF.md first. You are implementing Bilingual MCQ Preflight. Inspect the actual repository before edits. The application is not assumed to exist merely because a blueprint file names it.

## Context files

- `04_AI/AI_ARCHITECTURE.md`
- `04_AI/PROMPT_DESIGN.md`
- `04_AI/MODEL_FALLBACK_STRATEGY.md`
- `04_AI/AI_FAILURE_MODES.md`

## Objective

Connect the proven adapter to the route and preserve evidence/coverage invariants.

## Preconditions

Prior required contracts and current HANDOFF state verified; follow dependency graph. Existing work and source revisions must be preserved. Confirm Node24 for selected tooling. Use the solo schedule until event collaboration permission is explicitly recorded.

## Scope and files

Planned source/output paths are `src/lib/ai/gemini.ts, src/lib/ai/prompt.ts, src/lib/core/evidence.ts, src/app/api/analyze/route.ts, tests/api/analyze.test.ts`. Create or modify only what the milestone requires. Canonical package contracts are inputs, while runtime source paths are implementation outputs. Do not replace a source-of-truth doc with a guessed shape.

## Implementation requirements

Use fixed model/endpoint, 25s abort and zero automatic retries. Skip structurally blocked items. Validate exact IDs and slots and every source excerpt. Aggregate final status conservatively. Refusal/truncation/invalid shape returns warnings and manual review. No fallback replay in the live route.

## Restrictions

Keep the selected narrow product, free dependencies and single app boundary. Never expose/commit/log keys or private source. No paid plan, destructive Git or broad deletion. No fabricated model/test metrics, hidden test removal or mock-as-live result. Routine local edits/install/checks in this phase are authorised.

## Acceptance criteria

Mocked invalid outputs never clear an item. At least one authorised integrated real call succeeds before live-ready claim.

## Validation

npm run test, npm run typecheck, npm run eval:development if authorised key is available. Record actual model and prompt hash. Record actual commands, exit status, fixture IDs and limitations. Passing mocked tests cannot establish live model performance.

## Expected report

Update HANDOFF.md with changed files, real verification, blockers, contract changes and the next dependency. Follow PHASE_COMPLETION_TEMPLATE.md. Keep credentials and arbitrary source text out of reports.

## Stop and recovery conditions

A provider outage preserves rules. A failed gate cannot be relabelled PASS by lowering thresholds. Complete independent authorised local work before asking for missing input. Repair recoverable failures within this milestone and rerun affected checks. Do not request routine confirmation at every successful substep.

## Next phase

Read PROMPT_07.md when this milestone and its dependencies pass. Parallel owner work must follow the master task registry.
