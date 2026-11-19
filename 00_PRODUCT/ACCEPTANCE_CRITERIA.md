# Product acceptance criteria

| Gate | Pass condition | Failure action |
|---|---|---|
| G0 applicability | Entrant registration and released challenge fit recorded. Solo or explicit collaborative permission reflected in schedule | Resolve before treating this as an eligible submission |
| G1 technical | One real model response conforms to shape and complete item/field coverage. Every quote is mapped to original source text | Fix adapter/evidence and repeat development cases |
| G2 semantic | Frozen holdout metrics meet baseline thresholds and comparison advantage is measured | Narrow or no-go. No score inflation |
| G3 integration | Edit, run, inspect, decide, switch locale and reset operate on source revisions correctly | Keep last working version and fix state boundary |
| G4 deploy | Public signed-out URL and repo accessible. Rules-only and operator live mode show correct labels | Fix networking/config or fail submission readiness |
| G5 evidence | Benchmark table identifies model, prompts, sample count, authentic/synthetic origin and actual timings | Remove unsupported quantitative claims |

All application gates initially are NOT RUN or UNVERIFIED. Documentation validation is reported independently in 13_AUDIT/DOCUMENTATION_AUDIT.md. A schema-valid model result alone is insufficient to pass G2. Human labels must be fixed before opening heldout outputs, and repeated tuning invalidates a heldout claim.
