# Prompt 14 — Final adversarial release audit

Read root AGENTS.md and HANDOFF.md first. You are implementing Bilingual MCQ Preflight. Inspect the actual repository before edits. The application is not assumed to exist merely because a blueprint file names it.

## Context files

- `PROJECT_BASELINE.md`
- `10_TESTING/RELEASE_CHECKLIST.md`
- `06_SECURITY/THREAT_MODEL.md`
- `13_AUDIT/REQUIREMENTS_TRACEABILITY.md`

## Objective

Challenge completion, scope, source validity, comparison benefit and release safety.

## Preconditions

Prior required contracts and current HANDOFF state verified; follow dependency graph. Existing work and source revisions must be preserved. Confirm Node24 for selected tooling. Use the solo schedule until event collaboration permission is explicitly recorded.

## Scope and files

Planned source/output paths are `HANDOFF.md, README.md, 13_AUDIT/UNRESOLVED_DECISIONS.md`. Create or modify only what the milestone requires. Canonical package contracts are inputs, while runtime source paths are implementation outputs. Do not replace a source-of-truth doc with a guessed shape.

## Implementation requirements

Inspect actual code/tests/deploy, try false-clear and stale-evidence cases, verify source provenance/quotas/logging. Cross-check README claims and event submission. Repair recoverable within-scope failures and rerun affected checks. Preserve unrelated files.

## Restrictions

Keep the selected narrow product, free dependencies and single app boundary. Never expose/commit/log keys or private source. No paid plan, destructive Git or broad deletion. No fabricated model/test metrics, hidden test removal or mock-as-live result. Routine local edits/install/checks in this phase are authorised.

## Acceptance criteria

Final outcome reports verified behaviours, actual checks, unresolved risks and exact deployment/submission status.

## Validation

Run only relevant regressions plus final build/smoke after fixes. Avoid unsupported “all tests passed”. Record actual commands, exit status, fixture IDs and limitations. Passing mocked tests cannot establish live model performance.

## Expected report

Update HANDOFF.md with changed files, real verification, blockers, contract changes and the next dependency. Follow PHASE_COMPLETION_TEMPLATE.md. Keep credentials and arbitrary source text out of reports.

## Stop and recovery conditions

Critical unresolved evidence/access/gate failure means not ready. Do not lower criteria to declare completion. Complete independent authorised local work before asking for missing input. Repair recoverable failures within this milestone and rerun affected checks. Do not request routine confirmation at every successful substep.

## Next phase

Deliver the final implemented state with actual tests/deployment/submission outcome and remaining limitations. No further scope is implied.
