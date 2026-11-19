# User journeys

| Journey | Sequence | Recovery |
|---|---|---|
| Original demo | Load example → select item → choose AI → consent → operator code → Analyze → inspect exact spans → Fix → Copy issues | If unavailable, retain rules and clearly explain semantic review did not complete |
| Local practice edit | Enter both versions → validate → consent → analyze → inspect → decide | Edit invalidates previous results and offers rerun |
| Structural review | Load different option counts → run rules → inspect affected labels → correct original draft | Semantic call skips incompatible item |
| Ambiguous name | Load ambiguous pair → analyze → needs_review → Escalate | No guessed correction or false clear |
| Language switch | Work in English → choose தமிழ் → continue reviewing same item | Missing key falls back to English in dev and fails locale QA |
| Cancel/edit race | Analyze → change source/cancel → old response arrives | Operation ID/revision mismatch discards it |
| Hosted visitor | Open public link → load sample → run rules → view manual review | Live AI unavailable without operator code, no login/account created |

Measure complete journeys when comparing review time. Do not time only the provider call. Inputs and reviewer actions remain in memory, so refresh intentionally loses current work except locale. State this near Reset/help to prevent surprise.
