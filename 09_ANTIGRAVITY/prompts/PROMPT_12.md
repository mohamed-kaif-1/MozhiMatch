# Prompt 12 — Deploy and verify selected release

Read root AGENTS.md and HANDOFF.md first. You are implementing Bilingual MCQ Preflight. Inspect the actual repository before edits. The application is not assumed to exist merely because a blueprint file names it.

## Context files

- `11_DEPLOYMENT/DEPLOYMENT_GUIDE.md`
- `01_ARCHITECTURE/FREE_TIER_AUDIT.md`
- `03_BACKEND/ENVIRONMENT_CONFIGURATION.md`
- `11_DEPLOYMENT/DISASTER_RECOVERY.md`

## Objective

Prepare a production candidate and publish only within the identified authorised account/project.

## Preconditions

Prior required contracts and current HANDOFF state verified; follow dependency graph. Existing work and source revisions must be preserved. Confirm Node24 for selected tooling. Use the solo schedule until event collaboration permission is explicitly recorded.

## Scope and files

Planned source/output paths are `package-lock.json, src/app/api/analyze/route.ts, HANDOFF.md`. Create or modify only what the milestone requires. Canonical package contracts are inputs, while runtime source paths are implementation outputs. Do not replace a source-of-truth doc with a guessed shape.

## Implementation requirements

Run release checks first. Confirm user-selected host/repo and public original content. Deploy rules default on eligible free plan, set exact origin and verify signed out. Add key/code through secrets if authorised. Test unauthorized and valid live sample paths without showing credentials.

## Restrictions

Keep the selected narrow product, free dependencies and single app boundary. Never expose/commit/log keys or private source. No paid plan, destructive Git or broad deletion. No fabricated model/test metrics, hidden test removal or mock-as-live result. Routine local edits/install/checks in this phase are authorised.

## Acceptance criteria

Live URL, source commit and health/smoke recorded. No paid upgrade and no false success when URL fails.

## Validation

npm ci, npm run typecheck, npm run lint, npm run test, npm run build, then signed-out production smoke. Record actual commands, exit status, fixture IDs and limitations. Passing mocked tests cannot establish live model performance.

## Expected report

Update HANDOFF.md with changed files, real verification, blockers, contract changes and the next dependency. Follow PHASE_COMPLETION_TEMPLATE.md. Keep credentials and arbitrary source text out of reports.

## Stop and recovery conditions

If account or publish permission is missing, complete all local preparation and ask for only that concrete final input. Complete independent authorised local work before asking for missing input. Repair recoverable failures within this milestone and rerun affected checks. Do not request routine confirmation at every successful substep.

## Next phase

Read PROMPT_13.md when this milestone and its dependencies pass. Parallel owner work must follow the master task registry.
