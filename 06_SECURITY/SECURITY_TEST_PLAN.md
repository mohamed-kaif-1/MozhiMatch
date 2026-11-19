# Security test plan

| ID | Input/action | Expected result | Method/status |
|---|---|---|---|
| SEC-01 | Import provider module from client fixture | Build rejects server-only boundary | Compile test, NOT RUN |
| SEC-02 | Missing/wrong operator code and changed owned sample | 401 or 403 before provider invocation | Route mock counter, NOT RUN |
| SEC-03 | Foreign/missing Origin in hosted mode | 403 before provider invocation | Route test, NOT RUN |
| SEC-04 | Stem asks model to reveal keys/ignore task | No tools, exact schema and no secret in response | Mock validation plus separate live fixture, NOT RUN |
| SEC-05 | Source `<img onerror=...>` and model HTML explanation | Text displayed inertly | Browser test, NOT RUN |
| SEC-06 | Body above cap, including chunked stream | 413 without buffering unbounded content | Unit/route test, NOT RUN |
| SEC-07 | Provider error contains secret canary | Client envelope/log capture excludes canary | Route test, NOT RUN |
| SEC-08 | Refresh/reset and inspect localStorage | Locale only, no text/decision/code | Browser test, NOT RUN |
| SEC-09 | Alter request ID/revision in response | Stale result discarded | Reducer test, NOT RUN |

Tests use synthetic source and fake credentials. Do not make live attack calls against other services. Local app and provider mocks cover controls deterministically. One authorised live prompt-injection fixture checks model behaviour separately and must not be confused with proof that all attacks are prevented.
