# Prompt 07 — Build editor, review queue and human decisions

Read root AGENTS.md and HANDOFF.md first. You are implementing Bilingual MCQ Preflight. Inspect the actual repository before edits. The application is not assumed to exist merely because a blueprint file names it.

## Context files

- `02_FRONTEND/UI_UX_SPECIFICATION.md`
- `02_FRONTEND/UI_STATES.md`
- `02_FRONTEND/COMPONENT_LIBRARY.md`
- `03_BACKEND/examples/response.json`

## Objective

Implement normal end-to-end workbench controls using the frozen contract.

## Preconditions

Prior required contracts and current HANDOFF state verified; follow dependency graph. Existing work and source revisions must be preserved. Confirm Node24 for selected tooling. Use the solo schedule until event collaboration permission is explicitly recorded.

## Scope and files

Planned source/output paths are `src/components/workbench/Workbench.tsx, src/components/workbench/PairEditor.tsx, src/components/workbench/ReviewQueue.tsx, src/components/workbench/EvidencePanel.tsx, src/lib/core/review-state.ts`. Create or modify only what the milestone requires. Canonical package contracts are inputs, while runtime source paths are implementation outputs. Do not replace a source-of-truth doc with a guessed shape.

## Implementation requirements

Implement raw paired input, structural validation, explicit consent/mode, Analyze/Cancel and source revision. Render exact source/AI text inertly. Keep human decision separate. Copy a plain issue preview with manual-copy recovery. Edit/reset aborts and clears old results; locale retains state.

## Restrictions

Keep the selected narrow product, free dependencies and single app boundary. Never expose/commit/log keys or private source. No paid plan, destructive Git or broad deletion. No fabricated model/test metrics, hidden test removal or mock-as-live result. Routine local edits/install/checks in this phase are authorised.

## Acceptance criteria

Load→analyze→inspect→Fix→Copy and provider-unavailable path work from /. Late results cannot overwrite source revisions.

## Validation

npm run typecheck and npm run test. Add reducer regression and run normal entry manually. Record actual commands, exit status, fixture IDs and limitations. Passing mocked tests cannot establish live model performance.

## Expected report

Update HANDOFF.md with changed files, real verification, blockers, contract changes and the next dependency. Follow PHASE_COMPLETION_TEMPLATE.md. Keep credentials and arbitrary source text out of reports.

## Stop and recovery conditions

Do not infer a new API shape, translate source quotes or store question content in localStorage. Complete independent authorised local work before asking for missing input. Repair recoverable failures within this milestone and rerun affected checks. Do not request routine confirmation at every successful substep.

## Next phase

Read PROMPT_08.md when this milestone and its dependencies pass. Parallel owner work must follow the master task registry.
