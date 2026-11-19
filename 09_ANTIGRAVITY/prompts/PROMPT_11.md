# Prompt 11 — Perform accessibility and responsive QA

Read root AGENTS.md and HANDOFF.md first. You are implementing Bilingual MCQ Preflight. Inspect the actual repository before edits. The application is not assumed to exist merely because a blueprint file names it.

## Context files

- `02_FRONTEND/RESPONSIVE_DESIGN.md`
- `02_FRONTEND/DESIGN_QA_CHECKLIST.md`
- `05_MULTILINGUAL/MULTILINGUAL_TEST_PLAN.md`
- `10_TESTING/E2E_TEST_PLAN.md`

## Objective

Verify usability in both scripts at every required width and keyboard state.

## Preconditions

Prior required contracts and current HANDOFF state verified; follow dependency graph. Existing work and source revisions must be preserved. Confirm Node24 for selected tooling. Use the solo schedule until event collaboration permission is explicitly recorded.

## Scope and files

Planned source/output paths are `src/app/globals.css, src/components/workbench, tests/e2e/responsive.spec.ts, HANDOFF.md`. Create or modify only what the milestone requires. Canonical package contracts are inputs, while runtime source paths are implementation outputs. Do not replace a source-of-truth doc with a guessed shape.

## Implementation requirements

Check360/390/768/1024/1440, 200% zoom, focus, skip link, reset dialog, source lang and status announcements. Use reduced-motion preference. Fix overflow with wrapping/min-width instead of hiding text. Native speaker/reader observations must state actual availability.

## Restrictions

Keep the selected narrow product, free dependencies and single app boundary. Never expose/commit/log keys or private source. No paid plan, destructive Git or broad deletion. No fabricated model/test metrics, hidden test removal or mock-as-live result. Routine local edits/install/checks in this phase are authorised.

## Acceptance criteria

No page overflow or clipped Tamil controls, keyboard complete flow works, no misleading status colour-only cues.

## Validation

npm run test:e2e and manual keyboard/screen-reader pass. Record exact platforms and skips. Record actual commands, exit status, fixture IDs and limitations. Passing mocked tests cannot establish live model performance.

## Expected report

Update HANDOFF.md with changed files, real verification, blockers, contract changes and the next dependency. Follow PHASE_COMPLETION_TEMPLATE.md. Keep credentials and arbitrary source text out of reports.

## Stop and recovery conditions

Do not claim WCAG certification from an automated score or dictionary test. Complete independent authorised local work before asking for missing input. Repair recoverable failures within this milestone and rerun affected checks. Do not request routine confirmation at every successful substep.

## Next phase

Read PROMPT_12.md when this milestone and its dependencies pass. Parallel owner work must follow the master task registry.
