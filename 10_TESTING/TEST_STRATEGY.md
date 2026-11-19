# Test strategy

Use Vitest for pure TypeScript core/state and route dependency mocks. Use Playwright Chromium for the normal / entry point, status/evidence interaction, locale and viewport regression. No live model call occurs in unit, route or browser suites. Live evaluation is a separate explicit script with original authorised content.

Prioritise exact source and coverage validation, stale-response state, structural label checks and access restrictions. Broad coverage percentage is secondary to these product claims. Test equivalence with original strings and Unicode composition, not just English strings. Write meaningful invalid-output cases whose failure would falsely clear an item.

Test stages are unit/contracts, API integration, workflow E2E, manual accessibility and controlled live benchmark. Package scripts define test, test:e2e, typecheck, lint and build. The implementation agent creates actual configs and tests in PROMPT_10. Runtime test status is NOT RUN until execution. Blueprint validation checks delivered schemas and fixtures independently.

Expected labels live outside model input. A fluent reviewer must approve them before reporting a gold-standard benchmark. The supplied original holdout is readable by implementers and therefore needs strict freeze discipline. If seen during tuning, replace it. Keep error counts and denominators by fixture type.
