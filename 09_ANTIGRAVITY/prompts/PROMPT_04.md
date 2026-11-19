# Prompt 04 — Implement neobrutalist shell and tokens

Read root AGENTS.md and HANDOFF.md first. You are implementing Bilingual MCQ Preflight. Inspect the actual repository before edits. The application is not assumed to exist merely because a blueprint file names it.

## Context files

- `02_FRONTEND/DESIGN_SYSTEM.md`
- `02_FRONTEND/design-tokens.json`
- `02_FRONTEND/design-tokens.css`
- `02_FRONTEND/TYPOGRAPHY.md`
- `02_FRONTEND/SCREEN_BY_SCREEN_SPEC.md`

## Objective

Build the single workbench shell with consistent local fonts and square-grid styling.

## Preconditions

Prior required contracts and current HANDOFF state verified; follow dependency graph. Existing work and source revisions must be preserved. Confirm Node24 for selected tooling. Use the solo schedule until event collaboration permission is explicitly recorded.

## Scope and files

Planned source/output paths are `src/app/layout.tsx, src/app/page.tsx, src/app/globals.css, src/components/workbench/Workbench.tsx, src/components/LocaleControl.tsx`. Create or modify only what the milestone requires. Canonical package contracts are inputs, while runtime source paths are implementation outputs. Do not replace a source-of-truth doc with a guessed shape.

## Implementation requirements

Use paper/ink/blue with yellow support, 2px borders, hard shadows and opaque source panels. Import local fonts and 44px controls. Keep the source task prominent and omit irrelevant navigation. Use canonical translation keys from the first rendered controls.

## Restrictions

Keep the selected narrow product, free dependencies and single app boundary. Never expose/commit/log keys or private source. No paid plan, destructive Git or broad deletion. No fabricated model/test metrics, hidden test removal or mock-as-live result. Routine local edits/install/checks in this phase are authorised.

## Acceptance criteria

Shell works at 360 and1440px, keyboard focus visible, fonts local. No claim that mocked analysis is live.

## Validation

npm run typecheck, npm run lint and npm run build. Manual shell inspection with both scripts. Record actual commands, exit status, fixture IDs and limitations. Passing mocked tests cannot establish live model performance.

## Expected report

Update HANDOFF.md with changed files, real verification, blockers, contract changes and the next dependency. Follow PHASE_COMPLETION_TEMPLATE.md. Keep credentials and arbitrary source text out of reports.

## Stop and recovery conditions

Do not add marketing/admin/auth screens or new styling dependencies. Complete independent authorised local work before asking for missing input. Repair recoverable failures within this milestone and rerun affected checks. Do not request routine confirmation at every successful substep.

## Next phase

Read PROMPT_05.md when this milestone and its dependencies pass. Parallel owner work must follow the master task registry.
