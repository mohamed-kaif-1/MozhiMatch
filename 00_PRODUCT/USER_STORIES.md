# User stories

| ID | User and trigger | Desired action | Acceptance |
|---|---|---|---|
| US01 | Teacher has one translated item | Enter both versions with the same question ID | Both sources and labelled options remain editable, with visible bounds |
| US02 | Editor has a mismatched label/count | Find structural difference before spending API quota | Rules show the affected item and slot, and the item is blocked from a no-issue result |
| US03 | Reviewer sees a meaning alert | Inspect exact text in each language | Both excerpts are literal substrings of the correct fields, with labels and a reason |
| US04 | Reviewer encounters a proper name/idiom | Escalate when equivalence is uncertain | App marks needs_review and allows a manual decision without clearing uncertainty |
| US05 | Editor changes one word after analysis | Avoid trusting stale findings | In-flight response is discarded and prior findings/decisions reset for that source revision |
| US06 | Operator's key or quota fails | Finish manual review with structural results visible | Clear unavailable notice, no fabricated AI result, retry is explicit |
| US07 | Tamil-first user works on a phone | Review in Tamil UI with mixed-language source | Interface switch preserves data, labels wrap and source language stays explicit |
| US08 | Judge uses the public URL | Run the original example and inspect the process | Structural mode runs without a secret. Live operator code is entered privately before the pitch |

Use a teacher or bilingual reviewer for exploratory user testing only with permitted practice content. User interviews are not assumed completed. Track observed difficulty and verification time separately from hypothetical adoption.
