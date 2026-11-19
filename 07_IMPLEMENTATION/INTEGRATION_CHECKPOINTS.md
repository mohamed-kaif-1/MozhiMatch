# Integration checkpoints

| Checkpoint | Required inputs | Observable completion | Failure recovery |
|---|---|---|---|
| IC0 H0:30 | Baseline, Node, Git and entry context | No scaffold overwrite, version checks and event gap recorded | Inspect actual environment and preserve files |
| Gate H2:45–3 | Frozen prompts/labels and actual outputs | Feasibility verdict with metrics and comparison limitations | Narrow same workflow or no-go |
| IC1 H3 | Shared schemas, error codes and reducer actions | Both lanes run same request/response fixture | Single schema owner resolves mismatch |
| IC2 H4:30 | Analyze route and workbench | Owned sample goes input→evidence→manual decision | Minimal reproduction and affected owner test |
| IC3 H6:30 | Current route, locale and fallback | Same source works across locales and provider failure | Fix boundary without inventing API fields |
| IC4 H15 | Evaluated working candidate | Freeze features/contracts | Fix correctness/access only |
| IC5 H20 | Build/tests and deployed candidate | Code freeze, README matches measured results | Restore last working release through reversible Git |
| IC6 H22:30 | Entrant dashboard and final links | Submission success observed, public links work | Use final buffer on confirmed broken field/link |

Time is advisory planning, and actual task outcomes control progression. If starting late, map checkpoints to compressed remaining time and keep the final hour for submission/recovery. Do not delay submission to finish an optional design detail.
