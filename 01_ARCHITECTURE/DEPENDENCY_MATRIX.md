# Dependency matrix

| Deliverable | Direct dependencies | Blocking proof | Fallback and owner |
|---|---|---|---|
| Request parser | Zod, canonical request schema | Fixtures parse and bounds hold | JSON schema reference, Kaif |
| Rules | Valid raw items | Label/count/numeric candidate tests | Pure TypeScript, Kaif |
| Semantic adapter | Environment key/model, native fetch, provider schema | Actual free project call returns valid coverage | Rules-only explicit state, Kaif |
| Grounded findings | Response schema, source lookup | Quotes/slots/IDs match and uncertain items do not clear | needs_review, Kaif |
| Workbench | Contracts, design tokens, reducer | Mock contract integration and stale-request test | Single-item layout, Aasim or solo Kaif |
| Localisation | en/ta dictionaries, next-intl, fonts | Key/placeholder parity and Tamil width | English fallback with visible missing-key dev warning, Aasim |
| Public AI | Operator code, exact server samples, origin allowlist | Invalid code/foreign origin/mutated sample fail before provider | Public rules mode, Kaif |
| Deployment | Public repo, Vercel eligible account, environment | Signed-out full flow and /api/health | Local recording labelled recovery, Kaif |
| Submission | G0 applicability, measured gate, live URL, repo README | Required fields verified | Event submission remains incomplete until resolved |

Install dependencies only where a selected module requires them. Native fetch eliminates a provider SDK. No durable content state exists, so no database migration or cleanup job is needed. The component matrix identifies actual blocking checks rather than assuming “installed” means integrated.
