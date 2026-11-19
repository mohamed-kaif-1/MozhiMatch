# Prompt 10 — Implement central-claim automated tests

Read root AGENTS.md and HANDOFF.md first. You are implementing Bilingual MCQ Preflight. Inspect the actual repository before edits. The application is not assumed to exist merely because a blueprint file names it.

## Context files

- `10_TESTING/TEST_STRATEGY.md`
- `10_TESTING/TEST_CASES.md`
- `06_SECURITY/SECURITY_TEST_PLAN.md`
- `10_TESTING/E2E_TEST_PLAN.md`

## Objective

Write and execute focused tests that catch false-clear, evidence, race and access regressions.

## Preconditions

Prior required contracts and current HANDOFF state verified; follow dependency graph. Existing work and source revisions must be preserved. Confirm Node24 for selected tooling. Use the solo schedule until event collaboration permission is explicitly recorded.

## Scope and files

Planned source/output paths are `tests/unit, tests/api, tests/e2e, vitest.config.ts, playwright.config.ts`. Create or modify only what the milestone requires. Canonical package contracts are inputs, while runtime source paths are implementation outputs. Do not replace a source-of-truth doc with a guessed shape.

## Implementation requirements

Use Vitest pure/schema/route tests with provider mock and fake clocks. Playwright uses real entry controls and a mocked analyze fixture. Include all critical IDs, Unicode and invalid quote cases. No live API use inside suites. Keep live benchmark separate.

## Restrictions

Keep the selected narrow product, free dependencies and single app boundary. Never expose/commit/log keys or private source. No paid plan, destructive Git or broad deletion. No fabricated model/test metrics, hidden test removal or mock-as-live result. Routine local edits/install/checks in this phase are authorised.

## Acceptance criteria

Relevant suites execute with actual exit status, skipped cases listed and no disabled regression hidden.

## Validation

npm run test, npm run test:e2e, npm run typecheck, npm run lint, npm run build sequentially. Record actual commands, exit status, fixture IDs and limitations. Passing mocked tests cannot establish live model performance.

## Expected report

Update HANDOFF.md with changed files, real verification, blockers, contract changes and the next dependency. Follow PHASE_COMPLETION_TEMPLATE.md. Keep credentials and arbitrary source text out of reports.

## Stop and recovery conditions

Browser installation failure is a blocker for automated E2E, with manual observations recorded separately. Complete independent authorised local work before asking for missing input. Repair recoverable failures within this milestone and rerun affected checks. Do not request routine confirmation at every successful substep.

## Next phase

Read PROMPT_11.md when this milestone and its dependencies pass. Parallel owner work must follow the master task registry.
