# Repository structure

Use this archive as the root documentation tree. Antigravity adds source beside the numbered folders. Initialise existing directories by inspection so a scaffold cannot overwrite documentation.

| Planned source path | Responsibility | Owner |
|---|---|---|
| src/app/layout.tsx | Root HTML language bootstrap, global fonts/styles | Aasim |
| src/app/page.tsx | Workbench entry, no marketing page | Aasim |
| src/app/api/analyze/route.ts | Same-origin HTTP validation and orchestration | Kaif |
| src/app/api/health/route.ts | Safe mode/availability configuration response | Kaif |
| src/app/globals.css | Canonical token import and grid | Aasim |
| src/components/workbench/Workbench.tsx | Reducer binding and screen sections | Aasim |
| src/components/workbench/PairEditor.tsx | Both language fields, item IDs and options | Aasim |
| src/components/workbench/ReviewQueue.tsx | Item states and keyboard selection | Aasim |
| src/components/workbench/EvidencePanel.tsx | Exact source highlights and decision actions | Aasim |
| src/components/LocaleControl.tsx | Locale switch and local preference | Aasim |
| src/lib/contracts/schemas.ts | Zod implementation mirroring delivered JSON schemas | Kaif |
| src/lib/contracts/types.ts | Inferred exported types, no duplicate handwritten schema | Kaif |
| src/lib/core/rules.ts | Structural findings and token candidates | Kaif |
| src/lib/core/evidence.ts | Quote/source checks, UTF-16 spans, coverage aggregation | Kaif |
| src/lib/core/review-state.ts | Source revision, request and decision reducer | Aasim, contract frozen jointly |
| src/lib/ai/gemini.ts | server-only native-fetch provider adapter | Kaif |
| src/lib/ai/prompt.ts | Prompt v1 and structured schema adapter | Kaif |
| src/lib/server/access.ts | Origin, bounded body, operator code, allowlist | Kaif |
| src/i18n/provider.tsx | next-intl context, language preference bootstrap | Aasim |
| src/messages/en.json and ta.json | Runtime copies of delivered dictionaries | Aasim |
| src/fixtures/development.json | Publicly owned demo items only | Kaif |
| tests/unit and tests/api | Pure core/evidence/access contract tests | Kaif |
| tests/e2e | Workflow, errors, locale and viewport tests | Aasim |
| scripts/evaluate.ts | Development/holdout runner and timed outputs | Kaif |
| HANDOFF.md | Current implemented state and actual validation | Integrator |

Keep source modules small and specific. Do not add a service/repository abstraction for a single provider call. Runtime paths above are planned source outputs. They are not missing files in the blueprint archive. Full package contents appear in FILE_MANIFEST.json.
