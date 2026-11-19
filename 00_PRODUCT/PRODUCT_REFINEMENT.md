# Product refinement

The prior decision selected a narrow comparison workflow. This blueprint makes routine choices within it. The draft legal/font platform is a separate alternative and has not been imported.

| Original design | Problem | Improvement and justification | Cost | MVP impact | Decision |
|---|---|---|---|---|---|
| Whole exam PDF upload | OCR, layout matching and font recovery obscure the semantic experiment | Explicit paired item editor with fixed labels. Both versions are visible before analysis. | 45–75 min | Smaller core risk and clearer citations | ACCEPT |
| Single global safe/unsafe output | Could imply approval of an entire paper | Per-field comparison plus item status and reviewer decision. No issue found is a bounded result. | 30–45 min | Better oversight | ACCEPT |
| Model-generated character offsets | Unicode indices and hallucinated offsets can mis-highlight Tamil | Return exact snippets, then find raw substrings and compute UTF-16 indices server-side. Ambiguous matches require review. | 45 min | Grounded evidence | ACCEPT |
| Multiple AI agents or providers | Additional state, costs and integration time | One native-fetch adapter, one explicit primary model, no automatic provider switching | 20 min | Reproducible baseline | ACCEPT |
| Accounts/history/dashboard | No demonstrated pilot need | In-memory source and decisions, locale only in storage | 15 min | Lower retention and setup | ACCEPT |
| Arbitrary anonymous hosted inference | Exposes operator quota and allows private submissions | Rules available publicly. Live operator mode uses private code and exact sample allowlist | 45 min | Public demo can fail gracefully | ACCEPT |
| Numeric confidence | Uncalibrated model numbers appear authoritative | equivalent/different/uncertain per fixed slot, source evidence and manual action | 15 min | Honest uncertainty | ACCEPT |
| Automatic correction | Introduces new wording that needs domain review | Reviewer copies a plain-text issue list and edits in their original paper | 20 min | Actionable output | ACCEPT |
| Heavy animation or image hero | Reduces working area | One workbench, square CSS grid outside solid text panels | 20 min | Faster and usable | ACCEPT |
| Speech, legal typed-copy export, library catalogue auditing | Each changes the user and evaluation | Keep as future separate projects | Multiple hours | Protect current scope | DEFER |

No approved problem is changed. The specific step of free-tier cloud processing is an explicit privacy tradeoff. Public/owned practice content is the initial input boundary. Demand, model quality, comparison benefit and actual event fit remain unverified. The feasibility gate can reject the product even after a technically successful API call.
