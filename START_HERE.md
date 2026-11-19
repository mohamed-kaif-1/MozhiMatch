# Start here

Build a reviewer workbench that checks English and Tamil versions of the same practice question. The editor sees exactly which stem or option differs, reviews source snippets and decides whether to fix it. Public exam failures motivate the problem. Product advantage and pilot demand need measurement.

## Architecture and choices

One Next.js App Router application uses React/TypeScript, Tailwind, next-intl and Zod. A server route uses native fetch for one structured Gemini call. There is no database. Source text and reviewer decisions live in browser memory. Only the locale preference is stored on the device. Cloud text submission is explicit and restricted to public/owned practice material.

## Start the coding session

1. Extract the archive into a new project directory. Keep AGENTS.md at the project root. Preserve the numbered documentation folders.
2. Open this directory in Antigravity. Do not assume its automatic instruction discovery works. Paste [PROMPT_00](09_ANTIGRAVITY/prompts/PROMPT_00.md), which explicitly reads AGENTS.md and the baseline.
3. Execute [PROMPT_01](09_ANTIGRAVITY/prompts/PROMPT_01.md) to inspect the environment and initialise the app around these docs without overwriting them. Use Node 24 LTS. Copy the package candidate from 12_DEVELOPMENT_STANDARDS/starter/package.json only after checking versions and peer resolution.
4. Execute [PROMPT_02](09_ANTIGRAVITY/prompts/PROMPT_02.md). It builds the provider/evidence proof with minimal source modules. Run the development fixtures, freeze labels and prompts, then open holdout. Record actual results. Model credentials and project free-tier eligibility must be supplied through the local environment.
5. If the gate fails, inspect the failure, narrow the same workflow and rerun the affected comparison. Do not proceed to a polished demo on invented scores. A concept change needs Kaif's approval.

## Dependency-aware checklist

- [ ] S01 event brief and individual registration checked. Pair collaboration permission recorded if using Aasim's lane.
- [ ] Node 24 LTS, npm and Git versions recorded in HANDOFF.md.
- [ ] Dependencies resolve, baseline schemas load and development fixtures validate.
- [ ] Real Gemini request succeeds or provider unavailable is recorded with rules-only UI.
- [ ] Feasibility metrics pass, including comparison against the strong generic prompt.
- [ ] Contracts, source-quote checks and item coverage frozen before frontend integration.
- [ ] Core screen, locale, state transitions and manual review implemented.
- [ ] Production build, deterministic tests and deployment smoke pass.
- [ ] Final timed demo and submission links verified.

## Ownership and phase tracking

Kaif owns contracts, deterministic comparisons, evidence validation, provider route and final integration. Aasim's conditional team lane owns the screen, locale and browser tests. [TEAM_ALLOCATION](08_TEAM/TEAM_ALLOCATION.md) provides file boundaries. The solo schedule absorbs these tasks and cuts optional polish.

For the current remaining window, read [the deadline-focused plan](07_IMPLEMENTATION/DEADLINE_FOCUSED_PLAN.md) before scheduling. Use [the prompt index](09_ANTIGRAVITY/PROMPT_SEQUENCE_INDEX.md) and [the roadmap](07_IMPLEMENTATION/MASTER_IMPLEMENTATION_PLAN.md). Each completed phase updates HANDOFF.md with its commands, actual results and remaining work. Recover from a phase failure by keeping the last working commit, inspecting the specific failure and changing only its owner modules. Routine local edits and dependency installation in this plan are authorised by the implementation prompts. Deployment uses the user's chosen account and follows the final external-impact checkpoint.

## Ready for submission

A signed-out visitor can load an original example, run structural review and switch languages. The operator can enable permitted live AI using a private demo code and show a model response or an honest provider error. Both source quotes and human decisions remain inspectable. README identifies the synthetic dataset and small evaluation limitations. Public GitHub and live deployment satisfy the observed required fields. The exact kickoff brief remains a blocking applicability check before entry submission.
