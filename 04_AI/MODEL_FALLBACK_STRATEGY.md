# Fallback strategy

| Condition | Runtime behaviour | Demo label |
|---|---|---|
| AI_MODE=off or missing key | Rules run and every unevaluated item stays needs_review | Structural/manual review |
| Quota, network or provider 5xx | No automatic retry. Return rules plus unavailable warning | AI unavailable |
| Provider takes >25s | Abort, keep raw editor and deterministic findings | AI timed out |
| Model JSON/evidence invalid | Discard semantic output for affected items | AI response needs review |
| User wants to retry | New request ID, same revision, operator explicitly acts | Running live AI |
| Offline rehearsal replay | Load fixed synthetic replay through a separate visibly labelled control | Recorded fixture replay |

No automatic fallback to another billed provider is configured. Replay is never returned by the live /api/analyze handler to disguise a failed call. A local deterministic/manual demo remains usable during an outage, but cannot support a claim that integrated semantic review ran live.

If the project has no working free quota by the feasibility checkpoint, record the blocker. A generic free UI can compare the workflow experimentally, with the user handling service authentication. Live integration readiness stays failed until an actual authorized request succeeds.
