# Team allocation and entry constraint

The requested two-developer schedule is provided for Kaif and Aasim. Its use for this event is conditional because the exact event listing says one participant per entry. Until organizer permission is recorded, Kaif follows the solo roadmap and Aasim's source contributions are not assumed permitted for the submitted build.

| Responsibility | Kaif | Aasim in an allowed team setting |
|---|---|---|
| Baseline and gate | Accountable for product/technical decision | Reviews fixture wording and timed workflow |
| Contracts and lockfile | Sole editor and integrator | Consumer, proposes changes through handoff |
| Rules/evidence/model/access | Implements and tests | Uses canonical examples to expose UI defects |
| Screen/reducer/locale | Reviews contract integration | Implements and tests |
| Security | Owns route/key/content controls | Owns inert rendering, state clearing and browser checks |
| Deployment | Owns chosen host and environment | Runs independent signed-out UI smoke |
| Evaluation | Runs model and records actual outputs | Bilingual review/timing if allowed, not source of invented labels |
| Final submission | Sole final owner | Supporting verification only if permitted |

Branch boundaries match REPOSITORY_STRUCTURE.md. Shared contracts and package.json are frozen by Kaif after IC1. Review-state reducer is frontend-owned but its actions/types are agreed at IC1. Every integration checkpoint includes a small runnable case and a declared source revision.
