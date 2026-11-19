# Prompt 03 — Freeze contracts and source boundaries

Read root AGENTS.md and HANDOFF.md first. You are implementing Bilingual MCQ Preflight. Inspect the actual repository before edits. The application is not assumed to exist merely because a blueprint file names it.

## Context files

- `03_BACKEND/API_CONTRACTS.md`
- `03_BACKEND/DATA_MODELS.md`
- `03_BACKEND/api-schema.yaml`
- `08_TEAM/INTEGRATION_CONTRACT.md`

## Objective

Align TypeScript/Zod, API examples and reducer actions before integration.

## Preconditions

Prior required contracts and current HANDOFF state verified; follow dependency graph. Existing work and source revisions must be preserved. Confirm Node24 for selected tooling. Use the solo schedule until event collaboration permission is explicitly recorded.

## Scope and files

Planned source/output paths are `src/lib/contracts/schemas.ts, src/lib/contracts/types.ts, src/lib/contracts/config.ts, src/lib/core/review-state.ts, tests/unit/contracts.test.ts, HANDOFF.md`. Create or modify only what the milestone requires. Canonical package contracts are inputs, while runtime source paths are implementation outputs. Do not replace a source-of-truth doc with a guessed shape.

## Implementation requirements

Mirror strict schemas and add semantic invariants. Freeze errors/status/field refs and exact aggregation. Frontend reducer consumes types. Generate no independent conflicting interface. Respect single lockfile/schema writer.

## Restrictions

Keep the selected narrow product, free dependencies and single app boundary. Never expose/commit/log keys or private source. No paid plan, destructive Git or broad deletion. No fabricated model/test metrics, hidden test removal or mock-as-live result. Routine local edits/install/checks in this phase are authorised.

## Acceptance criteria

Delivered valid/invalid examples and runtime Zod agree. IC1 action and wire contract documented.

## Validation

npm run typecheck and npm run test. Validate all request/response fixtures and unknown-property rejection. Record actual commands, exit status, fixture IDs and limitations. Passing mocked tests cannot establish live model performance.

## Expected report

Update HANDOFF.md with changed files, real verification, blockers, contract changes and the next dependency. Follow PHASE_COMPLETION_TEMPLATE.md. Keep credentials and arbitrary source text out of reports.

## Stop and recovery conditions

Any requested wire change needs both producer/consumer/test updates before integration. Complete independent authorised local work before asking for missing input. Repair recoverable failures within this milestone and rerun affected checks. Do not request routine confirmation at every successful substep.

## Next phase

Read PROMPT_04.md when this milestone and its dependencies pass. Parallel owner work must follow the master task registry.
