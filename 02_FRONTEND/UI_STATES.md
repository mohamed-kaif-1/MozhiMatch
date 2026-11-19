# UI state model

State lives in one reducer. Fields are items, revision, activeRequestId, phase, response, decisions, selectedItemId, locale and operatorCode. The locale provider persists only en/ta. Derived status/filters should not be independently stored.

| Event | State transition | Invariant |
|---|---|---|
| sourceEdited/sampleLoaded | increment revision, clear response/decisions, abort current request | No old finding can be shown for new text |
| analyzeStarted | checking, new UUID and captured revision | Duplicate Analyze disabled |
| analyzeSucceeded | commit only when ID and revision equal current captured values | Late responses ignored |
| analyzeFailed | editing/unavailable, retain raw items and rules where returned | No success toast |
| canceled | clear active ID, phase editing, retain raw items | Late result discarded |
| localeChanged | update locale only | No provider call, no decision reset |
| decisionChanged | update current item+revision | Human choice remains separate from machine status |
| resetConfirmed | empty items/result/decisions/code, increment revision | Locale retained |

Display providerStatus independently from final item status. A rules-only empty findings array means no semantic review, not an equivalent translation. The initial empty page asks for an example. The app should not auto-run inference on mount, source edit, locale switch or health check.
