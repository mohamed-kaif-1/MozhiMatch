# Error handling and recovery

The UI maps stable error codes to translation keys. Provider exception strings and raw JSON never become UI text. Include a generated request ID where valid, with the message key. Logs contain status, duration, provider status and request ID only.

For malformed inputs, show field-specific validation before requesting, then retain all source text on server rejection. An invalid/missing model response returns structural review and an unavailable warning. If one model item lacks a field or source evidence, show only its validated deterministic findings and needs_review. Other validated items can still display comparisons. Do not silently treat an omitted result as equivalent.

On 25-second provider abort show AI_TIMEOUT with a retry button. The button starts a new request ID against the same source revision. No automatic retry loop is permitted. A 30-second browser abort invalidates its operation token. A late response is ignored even if the server completes later.

On edit increment the revision, abort the active client request, clear old findings and decisions, and announce that the source changed. On locale switch preserve revision and results. On reset clear all source/results/decisions/code, retaining locale. Clipboard rejection leaves a selectable plain-text issue panel so the reviewer can copy manually.

Test invalid origin, invalid code, changed demo sample, malformed JSON, too-large chunked body, invalid schema, provider 429/5xx, wrong response ID, duplicate comparison and source text injection. Failure should be visible and actionable, with no success notification emitted for a rejected operation.
