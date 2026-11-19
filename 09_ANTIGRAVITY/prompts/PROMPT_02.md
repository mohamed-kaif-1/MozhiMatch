# Prompt 02 — Prove meaning comparison and grounded evidence

Read root AGENTS.md and HANDOFF.md first. You are implementing Bilingual MCQ Preflight. Inspect the actual repository before edits. The application is not assumed to exist merely because a blueprint file names it.

## Context files

- `03_BACKEND/request.schema.json`
- `04_AI/provider-output.schema.json`
- `04_AI/AI_INPUT_OUTPUT_SCHEMA.md`
- `04_AI/AI_EVALUATION_PLAN.md`
- `04_AI/prompts/system-v1.txt`
- `04_AI/prompts/generic-baseline-v1.txt`

## Objective

Implement the smallest real provider/evidence experiment and decide whether further build effort is justified.

## Preconditions

Environment/scaffold and development fixtures available. Existing work and source revisions must be preserved. Confirm Node24 for selected tooling. Use the solo schedule until event collaboration permission is explicitly recorded.

## Scope and files

Planned source/output paths are `src/lib/contracts/schemas.ts, src/lib/contracts/types.ts, src/lib/core/rules.ts, src/lib/core/evidence.ts, src/lib/ai/gemini.ts, src/lib/ai/prompt.ts, scripts/evaluate.ts, tests/unit/evidence.test.ts, evaluation/freeze.json`. Create or modify only what the milestone requires. Canonical package contracts are inputs, while runtime source paths are implementation outputs. Do not replace a source-of-truth doc with a guessed shape.

## Implementation requirements

Use original development fixtures. Keep heldout files and expected labels unread until prompt freeze. Implement exact raw quotes, full field coverage, UTF-16 spans and structured output. Make only explicitly authorised live calls on public/owned practice text. Run strong generic comparison on identical data and record actual effort/errors.

## Restrictions

Keep the selected narrow product, free dependencies and single app boundary. Never expose/commit/log keys or private source. No paid plan, destructive Git or broad deletion. No fabricated model/test metrics, hidden test removal or mock-as-live result. Routine local edits/install/checks in this phase are authorised.

## Acceptance criteria

One live response validates and the baseline gate is measured. Four material holdout hits, two uncertainties escalated, no material false clear, at most one clean false alert, all evidence valid. Comparison advantage measured or marked unproven.

## Validation

npm run test and npm run typecheck. Then npm run eval:development. Holdout only after the freeze record. No live calls inside automated tests. Record actual commands, exit status, fixture IDs and limitations. Passing mocked tests cannot establish live model performance.

## Expected report

Update HANDOFF.md with changed files, real verification, blockers, contract changes and the next dependency. Follow PHASE_COMPLETION_TEMPLATE.md. Keep credentials and arbitrary source text out of reports.

## Stop and recovery conditions

If key/quota unavailable, complete pure validators and record BLOCKED. If semantic/advantage gate fails, stop product expansion and report precise evidence without inventing metrics. Complete independent authorised local work before asking for missing input. Repair recoverable failures within this milestone and rerun affected checks. Do not request routine confirmation at every successful substep.

## Next phase

Read PROMPT_03.md when this milestone and its dependencies pass. Parallel owner work must follow the master task registry.
