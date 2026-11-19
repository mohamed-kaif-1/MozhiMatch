# API contracts

## POST /api/analyze

Purpose is same-origin comparison. Accounts are absent. Hosted live requests require `X-Demo-Code`. JSON schemas define the complete request/response/error shapes. A browser sends only after local validation and source consent for AI.

Request includes requestId, revision, locale, mode, sourceKind, consent and paired items. Limits are 64,000 UTF-8 bytes, 1–10 items, 2–5 options per side and the text bounds in DATA_MODELS.md. Unknown properties reject. Duplicate item IDs and whitespace-only strings reject 422. Duplicate option labels instead become deterministic findings so the editor can inspect the mismatch.

Success returns HTTP 200 and AnalyzeResponse. `mode=live_ai` requires at least one successfully validated provider item. A per-item invalid result is needs_review with no displayed unvalidated comparison. When the provider fails entirely, `mode=rules_only` and providerStatus explains the failure. A structurally blocked item can coexist with successful comparisons on another item.

| HTTP | Code | Trigger | UI recovery |
|---|---|---|---|
| 400 | INVALID_REQUEST | JSON parse failure | Fix malformed request or report client bug |
| 401 | UNAUTHORIZED_DEMO | Missing/invalid operator code for hosted AI | Enter correct code privately, rules still available |
| 403 | FORBIDDEN_ORIGIN | Origin fails allowlist | Check exact deployed origin setting |
| 403 | DEMO_INPUT_RESTRICTED | Hosted text differs from owned allowlist | Load original demo sample or use local permitted mode |
| 413 | BODY_TOO_LARGE | Actual stream exceeds product cap | Reduce batch/text |
| 415 | UNSUPPORTED_MEDIA_TYPE | Non-JSON | Use client JSON path |
| 422 | INVALID_REQUEST / CONSENT_REQUIRED | Schema/domain validation or absent AI consent | Highlight field or consent requirement |
| 429 | RATE_LIMITED | Best-effort local throttle rejects | Wait then explicitly retry |
| 500 | INTERNAL_ERROR | Unexpected app failure | Preserve editor, retry, inspect metadata-only logs |

Client total timeout is 30 seconds. Provider timeout is 25. A client abort discards the result and attempts upstream cancellation where supported. Cancellation can still consume provider quota. Request IDs and revision checks prevent stale UI commits, not provider billing.

Concrete examples are [request](examples/request.json), [response](examples/response.json), [fallback](examples/fallback.json), and [error](examples/error.json). OpenAPI is [api-schema.yaml](api-schema.yaml). Tests must cover every documented response and ensure no key/body/stack appears in errors.

## GET /api/health

Public read-only, no auth, no provider call. Return `{"status":"ok","aiConfigured":false,"deploymentMode":"public_demo"}` with configured mode enum local/public_demo. aiConfigured means key and model configuration exist. It does not establish current quota, latency or semantic accuracy. Never return key prefixes, code hash, account details or environment values. No-store response. Configure external live health check only if explicitly requested later.
