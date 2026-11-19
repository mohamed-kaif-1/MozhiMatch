# Prompt 09 — Integrate and freeze behaviour

Read root AGENTS.md and HANDOFF.md first. You are implementing Bilingual MCQ Preflight. Inspect the actual repository before edits. The application is not assumed to exist merely because a blueprint file names it.

## Context files

- `07_IMPLEMENTATION/INTEGRATION_CHECKPOINTS.md`
- `08_TEAM/INTEGRATION_CONTRACT.md`
- `02_FRONTEND/UI_STATES.md`
- `10_TESTING/ACCEPTANCE_TESTS.md`

## Objective

Complete normal, uncertain and failed paths with source-grounded UI and stable contracts.

## Preconditions

Prior required contracts and current HANDOFF state verified; follow dependency graph. Existing work and source revisions must be preserved. Confirm Node24 for selected tooling. Use the solo schedule until event collaboration permission is explicitly recorded.

## Scope and files

Planned source/output paths are `src/components/workbench/Workbench.tsx, src/lib/core/review-state.ts, src/app/api/analyze/route.ts, tests/e2e/workbench.spec.ts, HANDOFF.md`. Create or modify only what the milestone requires. Canonical package contracts are inputs, while runtime source paths are implementation outputs. Do not replace a source-of-truth doc with a guessed shape.

## Implementation requirements

Exercise current revision, exact quotes, structural skip, timeout, code restriction, ambiguous item, locale and reset. Fix actual boundary defects under ownership rules. Record IC2–IC4 evidence and freeze features.

## Restrictions

Keep the selected narrow product, free dependencies and single app boundary. Never expose/commit/log keys or private source. No paid plan, destructive Git or broad deletion. No fabricated model/test metrics, hidden test removal or mock-as-live result. Routine local edits/install/checks in this phase are authorised.

## Acceptance criteria

One batch is reviewable without fake inference, stale results or lost locale decisions. All open blockers have owners.

## Validation

npm run test, npm run typecheck, npm run build. Run critical browser smoke if browser available. Record actual commands, exit status, fixture IDs and limitations. Passing mocked tests cannot establish live model performance.

## Expected report

Update HANDOFF.md with changed files, real verification, blockers, contract changes and the next dependency. Follow PHASE_COMPLETION_TEMPLATE.md. Keep credentials and arbitrary source text out of reports.

## Stop and recovery conditions

Stop new features after IC4. Resolve regressions without changing product scope. Complete independent authorised local work before asking for missing input. Repair recoverable failures within this milestone and rerun affected checks. Do not request routine confirmation at every successful substep.

## Next phase

Read PROMPT_10.md when this milestone and its dependencies pass. Parallel owner work must follow the master task registry.
