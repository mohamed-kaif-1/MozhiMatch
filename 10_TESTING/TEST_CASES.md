# Critical test cases

Every row starts NOT RUN. Inputs are original fixtures or deliberately malformed contracts, not real user submissions. No passing result is implied by this test plan.

| Test ID | Feature | Input | Expected/pass criterion | Method | Failure response |
|---|---|---|---|---|---|
| CORE-01 | Structure | Different option count/label sets | needs_review with exact affected fields and no provider item | Vitest rules | Fix rule before inference |
| CORE-02 | Numbers/units | 2000 vs 2020, Tamil digit variant, kg/கிலோ | Differences flagged as candidates, approved aliases equivalent | Vitest table | Keep human review for unknowns |
| EVID-01 | Exact quote | Invented or corrected source excerpt | Item invalidated, no false clear | Vitest evidence | Reject output |
| EVID-02 | Field identity | Quote copied from other item/label | Rejected against exact source lookup | Vitest evidence | Review state |
| EVID-03 | Coverage | Missing/duplicate stem or option comparisons | Item semantic data discarded | Vitest evidence | No partial equivalent result |
| EVID-04 | Unicode | NFD Tamil and emoji before excerpt | Raw preserved, UTF-16 span slice exact, grapheme-safe | Vitest evidence | Show whole field and review if boundary fails |
| API-01 | Validation | Blank source/duplicate ID/unknown property | 422 stable translated key | Route mock | Fix form/schema parity |
| API-02 | Body limit | 64,001 actual UTF-8 bytes with absent length | 413 before full parse | Route stream test | Fix bounded reader |
| API-03 | AI unavailable | No key or mode off | 200 rules_only and needs_review | Route mock | Retain manual workflow |
| API-04 | Access | Invalid Origin/code/allowlist text | 403/401 before provider call | Route mock counter | Close boundary |
| API-05 | Provider timeout | Provider exceeds 25 sec | Abort and AI_TIMEOUT fallback | Fake timer and mocked fetch | No automatic retry |
| API-06 | Bad provider | Malformed/truncated JSON or extra IDs | invalid_response/needs_review | Route mock | Discard unvalidated content |
| UI-01 | Normal entry | Load sample→compare→inspect→Fix→Copy | Exact excerpts and separate decision | Playwright mock | Fix integration |
| UI-02 | Reset | Work exists→Reset→Cancel/Confirm | Cancel retains, Confirm clears code/text/results | Playwright | Fix state |
| UI-03 | Race | Edit/reset during pending response | Stale response ignored | Reducer and Playwright | Fix request/revision guard |
| I18N-01 | Dictionary parity | Flatten keys/placeholders | Identical en/ta coverage | Vitest and blueprint audit | Complete translations |
| I18N-02 | Locale switch | Switch after decision | Source and decision retained, lang updates | Playwright | Fix remount |
| AI-01 | Semantic core | Four heldout material changes | 4/4 found, zero false clears | Explicit live evaluation | Fail concept gate |
| AI-02 | Clean controls | Three original clean pairs | At most one false alert | Explicit live evaluation | Refine development only |
| AI-03 | Uncertainty | Initial expansion/missing passage | 2/2 needs_review | Explicit live evaluation | Fail gate |
| AI-04 | Option meaning | H04 option A changed | Grounded option-level finding | Explicit live evaluation | Fix comparison task |
| SEC-04 | Injection | Instructions inside stem | No tool/key disclosure, valid schema or reject | Mock and separate live fixture | Fail safety boundary |
| SEC-05 | XSS | HTML in source/model explanation | Displayed inertly as text | Playwright | Replace unsafe renderer |

Security tests SEC-01 through SEC-09 are detailed in 06_SECURITY/SECURITY_TEST_PLAN.md. Multi-language layout and manual screen-reader steps are in 05_MULTILINGUAL/MULTILINGUAL_TEST_PLAN.md. Record actual commands/results in HANDOFF.md and the phase-completion report.
