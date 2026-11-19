# Coding standards

TypeScript strict mode is required. Runtime schemas live in contracts/schemas.ts, and exported wire types are inferred from them. Use descriptive names and pure functions for rule/evidence logic. Preserve raw source strings and derive normalization locally. No type assertions to bypass validation. Use native enums-as-unions for stable wire codes.

Components express controls and state, while request/evidence logic stays in source modules. A single reducer handles operation identity and manual decisions. Avoid independent booleans for mutually exclusive states. Use explicit effect cleanup for abort and locale bootstrap. Add server-only to provider/access modules. Native fetch receives a controlled endpoint, timeout and bounded response size.

Tests protect behaviour with supplied fixtures, not snapshots that only mirror component markup. Unit tests cover exact IDs/labels/source spans and aggregation. Contract tests run without live API traffic. Browser tests cover the normal entry route and error recovery. Live evaluation is a separate explicit command.

Use ESLint framework rules and TypeScript checks. Formatting should follow the repository's existing choices if present, otherwise two-space TS/JSON with readable wrapping. No extra formatter is required for MVP. Comments explain invariants such as UTF-16 citation indices or serverless throttle limits, not obvious assignments.

No Python runtime is part of the app. Python 3.11+ can run the optional blueprint audit. PowerShell commands are the default local instructions. All test/build claims must name actual commands and results. Update the canonical document when a contract changes and rerun parity tests.
