# API & Data Contracts

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
| 413 | BODY_TOO_LARGE | Actual stream exceeds product cap (64,000 bytes) | Reduce batch/text |
| 415 | UNSUPPORTED_MEDIA_TYPE | Non-JSON | Use client JSON path |
| 422 | INVALID_REQUEST / CONSENT_REQUIRED | Schema/domain validation or absent AI consent | Highlight field or consent requirement |
| 429 | RATE_LIMITED | Best-effort local throttle rejects | Wait then explicitly retry |
| 500 | INTERNAL_ERROR | Unexpected app failure | Preserve editor, retry, inspect metadata-only logs |

Client total timeout is 30 seconds. Provider timeout is 25. A client abort discards the result and attempts upstream cancellation where supported. Cancellation can still consume provider quota. Request IDs and revision checks prevent stale UI commits, not provider billing.

---

## GET /api/health

Public read-only, no auth, no provider call. Return `{"status":"ok","aiConfigured":false,"deploymentMode":"public_demo"}` with configured mode enum local/public_demo. aiConfigured means key and model configuration exist. It does not establish current quota, latency or semantic accuracy. Never return key prefixes, code hash, account details or environment values. No-store response.

---

## CSV Batch Import Contract

MozhiMatch supports bulk question entry using RFC 4180 CSV files with UTF-8 encoding.

### Header & Column Specification (13 columns)
```csv
id,en_stem,ta_stem,en_A,ta_A,en_B,ta_B,en_C,ta_C,en_D,ta_D,en_E,ta_E
```

| Column | Required | Constraints | Purpose |
|---|---|---|---|
| `id` | Yes | 1–40 alphanumeric, hyphens, underscores (`/^[A-Za-z0-9_-]{1,40}$/`). Unique in batch. | Unique question identifier. |
| `en_stem` | Yes | 1–2000 non-whitespace characters. | English question prompt. |
| `ta_stem` | Yes | 1–2000 non-whitespace characters (UTF-8 Tamil). | Tamil question prompt. |
| `en_A`, `ta_A` | Yes | 1–400 characters per side. Minimum 2 options required. | Option A text for English and Tamil. |
| `en_B`, `ta_B` | Yes | 1–400 characters per side. | Option B text for English and Tamil. |
| `en_C`, `ta_C` | Optional | 1–400 characters per side if present. | Option C text (empty pair = absent option). |
| `en_D`, `ta_D` | Optional | 1–400 characters per side if present. | Option D text (empty pair = absent option). |
| `en_E`, `ta_E` | Optional | 1–400 characters per side if present. | Option E text (empty pair = absent option). |

### Import Validation Rules
- **File Size**: Bounded at **512 KB** before reading.
- **Batch Size**: 1 to 10 questions per batch.
- **Payload Bound**: Total serialized QuestionItem JSON must not exceed **64,000 bytes**.
- **Encoding**: UTF-8. Optional UTF-8 BOM (`\uFEFF`) is automatically stripped. Replacement character (`\uFFFD`) causes immediate rejection to prevent corrupted Tamil text.
- **Structural Integrity**: A pair of empty option columns is treated as an absent option. One-sided option content is preserved as a structural discrepancy for human inspection (e.g., 4 EN options vs 3 TA options).
- **Atomicity**: Any validation error (duplicate ID, missing header, row-level error) prevents import; all errors are listed in the preview modal.

---

## CSV Review Report Export Contract

MozhiMatch exports findings to an RFC 4180 CSV file with a UTF-8 BOM (`\uFEFF`) for compatibility with Microsoft Excel, LibreOffice, and Google Sheets.

### Export Columns (16 columns)
```csv
item_id,item_status,analysis_mode,provider_status,model,field_kind,option_label,finding_type,reason_code,en_source,ta_source,en_quote,ta_quote,explanation,reviewer_decision,analyzed_at
```

| Column | Type / Values | Description |
|---|---|---|
| `item_id` | String | Question identifier (e.g. `Q1`). |
| `item_status` | `meaning_changed` \| `needs_review` \| `no_issue_found` \| `not_analyzed` | Overall question status. |
| `analysis_mode` | `rules_only` \| `live_ai` \| `not_analyzed` | Processing mode used. |
| `provider_status` | `ok` \| `unavailable` \| `timeout` \| `invalid_response` \| `""` | Gemini API response status. |
| `model` | String (e.g. `gemini-2.5-flash`) | Identifier of model used for evaluation. |
| `field_kind` | `stem` \| `option` | Component being compared. |
| `option_label` | `A` \| `B` \| `C` \| `D` \| `E` \| `""` | Option label if applicable. |
| `finding_type` | `structural` \| `semantic` \| `none` | Category of finding (summary row uses `none`). |
| `reason_code` | String (e.g. `negation`, `OPTION_COUNT_MISMATCH`, `none`) | Rule or semantic classification code. |
| `en_source` | String | Raw English source text for the field. |
| `ta_source` | String | Raw Tamil source text for the field. |
| `en_quote` | String | Exact validated English excerpt quoted by model. |
| `ta_quote` | String | Exact validated Tamil excerpt quoted by model. |
| `explanation` | String | Grounded explanation or structural issue summary. |
| `reviewer_decision` | `keep` \| `fix` \| `escalate` \| `pending` | Human reviewer triage decision. |
| `analyzed_at` | ISO 8601 Timestamp (or `""`) | Timestamp when analysis completed. |

### Formula Injection Protection
To protect users opening exported CSVs in spreadsheet software, any cell value whose raw text begins with `=`, `+`, `-`, `@`, `\t`, or `\r` is automatically prefixed with a single quote (`'`). This protection is applied strictly to the export representation and never mutates original question text.
