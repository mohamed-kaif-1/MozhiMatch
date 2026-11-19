# Prompt 05 — Implement bounded core API and access controls

Read root AGENTS.md and HANDOFF.md first. You are implementing Bilingual MCQ Preflight. Inspect the actual repository before edits. The application is not assumed to exist merely because a blueprint file names it.

## Context files

- `03_BACKEND/BACKEND_ARCHITECTURE.md`
- `03_BACKEND/API_CONTRACTS.md`
- `06_SECURITY/SECURITY_ARCHITECTURE.md`
- `03_BACKEND/ENVIRONMENT_CONFIGURATION.md`

## Objective

Build same-origin analyze/health routes and deterministic output with honest disabled mode.

## Preconditions

Prior required contracts and current HANDOFF state verified; follow dependency graph. Existing work and source revisions must be preserved. Confirm Node24 for selected tooling. Use the solo schedule until event collaboration permission is explicitly recorded.

## Scope and files

Planned source/output paths are `src/app/api/analyze/route.ts, src/app/api/health/route.ts, src/lib/server/access.ts, src/lib/core/rules.ts, tests/api/analyze.test.ts, tests/api/access.test.ts`. Create or modify only what the milestone requires. Canonical package contracts are inputs, while runtime source paths are implementation outputs. Do not replace a source-of-truth doc with a guessed shape.

## Implementation requirements

Bound actual body stream to 64000 bytes, require JSON/origin, strict schemas and AI consent. Hosted live uses constant-time hashed code and exact owned samples. Implement rules before model. No secret or source logging. Rules-only items remain needs_review.

## Restrictions

Keep the selected narrow product, free dependencies and single app boundary. Never expose/commit/log keys or private source. No paid plan, destructive Git or broad deletion. No fabricated model/test metrics, hidden test removal or mock-as-live result. Routine local edits/install/checks in this phase are authorised.

## Acceptance criteria

Every access/shape error matches the envelope. Restricted requests never invoke provider. Health reveals no secret and makes no model call.

## Validation

npm run test and npm run typecheck. Include missing/chunked length, changed sample and foreign origin. Record actual commands, exit status, fixture IDs and limitations. Passing mocked tests cannot establish live model performance.

## Expected report

Update HANDOFF.md with changed files, real verification, blockers, contract changes and the next dependency. Follow PHASE_COMPLETION_TEMPLATE.md. Keep credentials and arbitrary source text out of reports.

## Stop and recovery conditions

No wildcard origin, billed service or frontend key to bypass a blocker. Complete independent authorised local work before asking for missing input. Repair recoverable failures within this milestone and rerun affected checks. Do not request routine confirmation at every successful substep.

## Next phase

Read PROMPT_06.md when this milestone and its dependencies pass. Parallel owner work must follow the master task registry.
