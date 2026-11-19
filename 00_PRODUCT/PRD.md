# Product requirements

Primary job is to review an existing English–Tamil item before publication. The editor supplies both versions and already knows the intended curriculum. A per-item workbench keeps preparation, machine findings and human decisions in one view.

| Requirement | Behaviour | Verification |
|---|---|---|
| P01 | Load or edit 1–10 paired items with explicit IDs, separate stems and 2–5 A–E options per language | Request schema and form tests |
| P02 | Validate length, blank fields, duplicate IDs/labels and structural disagreement | Deterministic fixtures |
| P03 | Compare each aligned stem/option using fixed input fields and structured inference | Provider-mocked contract and live gate |
| P04 | Reject missing coverage, unknown item IDs or invalid evidence as needs_review | Evidence tests |
| P05 | Show issues with both exact snippets and localized reason labels | Browser test |
| P06 | Reviewer chooses keep/fix/escalate and can copy issue list | Reducer/clipboard tests |
| P07 | Switch en/ta without losing text or decisions | Locale coverage and browser test |
| P08 | Provider unavailable retains structural checks and manual review | Timeout test |
| P09 | Hosted inference code/allowlist protect private keys and enforce public sample scope | Route tests |
| P10 | Warn on edit that prior machine findings and decisions are stale, then clear them | State race test |

The success gate in PROJECT_BASELINE.md controls product continuation. A UI alone cannot establish improvement. Time-to-verified-decision includes input preparation, upload/paste, reading, source checking and reviewer action. The unit of evaluation is a paired item, with field evidence and no-issue decisions assessed separately.

The screen works at 360px and 1440px. Evidence uses semantic text and keyboard navigation. Source strings stay unchanged. Only comparison tokens use NFC. Domain ambiguity remains an explicit review state. The app does not score candidates, determine eligibility or solve which option is substantively correct.
