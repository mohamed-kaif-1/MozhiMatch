# Screen details

| Field | WB01 specification |
|---|---|
| Purpose/target user | Bilingual practice-paper editor preparing an item for release |
| Entry | Open / directly or reset from the workbench |
| Layout | Header, task instruction, sample/source controls, item selector, paired editor, action area, review queue, evidence and manual decisions |
| Content hierarchy | Actual paired text first, machine status second, explanation and human action third |
| Components | PairEditor, ReviewQueue, EvidencePanel, LocaleControl, status/alert/button primitives |
| Inputs | Raw paired stems/options, ID, mode, locale, source-kind and optional consent/code |
| Outputs | Deterministic findings, validated semantic comparisons, reviewer decisions and copied issue list |
| Validation | Client mirrors bounds and duplicate IDs. Server is authoritative. Show field labels and translated messages |
| Error states | Empty field, malformed batch, origin/code restriction, provider timeout, bad evidence and clipboard rejection |
| Loading | Disable duplicate Analyze, retain edit and Cancel, aria-busy on results region |
| Empty | “Load an example or enter a question” with one action |
| Success | Queue with source-grounded statuses and no automatic paper approval |
| Mobile | Stack both languages, full-width buttons and results after editor. No horizontal page overflow |
| Tamil layout | Auto-height labels, 1.7 line-height, no truncation or letter-spacing |
| API | GET /api/health once for safe configuration, POST /api/analyze per user action |
| Accessibility | Skip link, labelled fields, correct lang, polite status, logical focus, 44px controls, contrast |
| Acceptance | Load→analyze→inspect→decide→switch locale→reset passes in Chromium at five widths |

WB01-R focuses its heading after a completed analysis when focus is still on Analyze. A user editing another field keeps focus there and receives a polite result announcement. On failure focus the error summary only when it helps locate a blocked form field. Modal Reset restores focus to its trigger on cancel.
