# Integration contract

Version 0.1 freezes POST /api/analyze, GET /api/health, canonical JSON shapes, status enums, error codes and source revision behaviour. Kaif owns wire changes. Aasim implements from examples, never guesses missing response fields. Change request names the exact field, old/new schema, UI effect and tests. Both update affected docs before merging.

API rule failure and provider failure have different semantics. Structural/manual mode always leaves unevaluated items needs_review. The UI never maps an empty comparisons array to no_issue_found. RequestId and revision must match the active operation. Both source locales remain explicit and raw evidence cannot be translated for display.

Shared files requiring coordinated edit are contracts/schemas.ts, contracts/types.ts, package.json, package-lock.json and the root environment/readiness docs. Kaif is the single writer. Aasim owns the source screen/styles/messages/browser tests. Kaif owns backend/core/provider and API tests. The UI reducer belongs to Aasim after the IC1 action contract.

The mock fixture is a proposed schema-valid response, not a recorded provider result. Browser suites may mock the network and must state that fact. Only the separate evaluation runner makes authorised live calls. Do not merge a branch that silently changes the shape or turns a provider failure into a success sample.
