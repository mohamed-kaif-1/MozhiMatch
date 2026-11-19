# Prompt 08 — Complete Tamil and English localisation

Read root AGENTS.md and HANDOFF.md first. You are implementing Bilingual MCQ Preflight. Inspect the actual repository before edits. The application is not assumed to exist merely because a blueprint file names it.

## Context files

- `05_MULTILINGUAL/I18N_ARCHITECTURE.md`
- `05_MULTILINGUAL/TAMIL_ENGLISH_IMPLEMENTATION.md`
- `05_MULTILINGUAL/TRANSLATION_KEYS_SPEC.md`
- `05_MULTILINGUAL/en.json`
- `05_MULTILINGUAL/ta.json`

## Objective

Complete locale integration, Unicode preservation and accessible bilingual layout.

## Preconditions

Prior required contracts and current HANDOFF state verified; follow dependency graph. Existing work and source revisions must be preserved. Confirm Node24 for selected tooling. Use the solo schedule until event collaboration permission is explicitly recorded.

## Scope and files

Planned source/output paths are `src/i18n/provider.tsx, src/messages/en.json, src/messages/ta.json, src/components/LocaleControl.tsx, src/app/layout.tsx, tests/unit/i18n.test.ts`. Create or modify only what the milestone requires. Canonical package contracts are inputs, while runtime source paths are implementation outputs. Do not replace a source-of-truth doc with a guessed shape.

## Implementation requirements

Use next-intl client provider on one route. Start en server-side then read safe locale preference after mount. Update html lang. Match keys/placeholders, use source-field language attributes and Noto Sans Tamil. Do not remount reducer on locale changes. Flag teacher-domain wording for fluent review.

## Restrictions

Keep the selected narrow product, free dependencies and single app boundary. Never expose/commit/log keys or private source. No paid plan, destructive Git or broad deletion. No fabricated model/test metrics, hidden test removal or mock-as-live result. Routine local edits/install/checks in this phase are authorised.

## Acceptance criteria

All UI states translated, raw strings preserved, data/decisions survive switch, no clipped Tamil labels.

## Validation

npm run test and npm run typecheck. Manual English/Tamil view at360/390/768/1024/1440. Record actual commands, exit status, fixture IDs and limitations. Passing mocked tests cannot establish live model performance.

## Expected report

Update HANDOFF.md with changed files, real verification, blockers, contract changes and the next dependency. Follow PHASE_COMPLETION_TEMPLATE.md. Keep credentials and arbitrary source text out of reports.

## Stop and recovery conditions

Missing native review remains a stated gap. No destructive Unicode vowel replacement. Complete independent authorised local work before asking for missing input. Repair recoverable failures within this milestone and rerun affected checks. Do not request routine confirmation at every successful substep.

## Next phase

Read PROMPT_09.md when this milestone and its dependencies pass. Parallel owner work must follow the master task registry.
