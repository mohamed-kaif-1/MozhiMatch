# Backend responsibilities

Only two Node-runtime handlers are needed. GET /api/health reports configured mode. POST /api/analyze performs bounded parsing, source validation, deterministic checks, optional inference and evidence validation. It does not save content or reviewer decisions.

The analyze handler reads a bounded stream. Reject Content-Length >64,000 early, but also count actual bytes for chunked/missing headers. Require application/json, same-origin request and valid schema. A route can accept one local development origin explicitly configured. Do not infer trust from unvalidated X-Forwarded headers.

Calculate structural findings with pure functions. Duplicate labels or unequal label sets/counts block the semantic call for that item and return needs_review. Numeric/unit differences are review candidates. If a valid semantic difference exists, status becomes meaning_changed. Otherwise any deterministic finding or uncertain/invalid comparison results in needs_review. Only complete equivalent comparisons and no rule findings permit no_issue_found. Rules-only items always have needs_review, even when their finding list is empty.

For AI mode, check consent. In hosted demo mode check the private operator code using hashed constant-time comparison and enforce exact server-side demo item equality, including IDs and all text. Local mode can accept public/owned practice data after consent. The code remains in browser memory. A best-effort process-local throttle can reduce repeated calls, but is not a distributed quota guarantee. Free provider project limits and access controls remain the operational boundary.

Set an AbortController at 25 seconds. Make zero automatic retries. Upstream timeout, quota, invalid JSON or a missing key returns HTTP 200 with deterministic results and explicit providerStatus/warnings. Security/shape/access errors return the documented non-200 envelope. Do not include provider raw payloads or stack traces in client errors.
