# AI and evidence contract

Provider output shape is [provider-output.schema.json](provider-output.schema.json). API output shape is [response.schema.json](../03_BACKEND/response.schema.json). These differ deliberately because the provider proposes text while server code derives spans and final status.

The model result contains results[{itemId, comparisons[]}]. Each comparison specifies field.kind, field.label, relation, enQuote, taQuote, reasonCode and explanation. Compare the same label in both languages. Stem label must be null. Unknown slots and IDs are invalid.

Coverage is exact. A compatible four-option item must have five comparisons. Repeated field refs are invalid even when their count matches. Missing comparisons cannot be discarded while accepting the remaining equivalent fields. For a structurally blocked item, do not send it to the model and return no comparisons.

Evidence validator uses raw JavaScript source strings. Locate each quote via indexOf and require a single occurrence in the specified field. Compute start and end as UTF-16 indices, using end=start+quote.length. Verify source.slice(start,end)===quote. This avoids Python/JavaScript index disagreements. Grapheme boundaries must not split a combining mark in the highlight. If a snippet would split a grapheme, use the whole field only when that exact whole-field quote came from the model, otherwise return needs_review. UI may show the whole field without a highlight as a safe display fallback.

ReasonCode is localized via static dictionaries. The free explanation is untrusted plain text, capped at 600 characters, in the requested locale where possible. Failure to use the chosen language is a QA defect and remains visible as model text. Never translate source quotations to make them fit. Exact source evidence establishes traceability, while semantic correctness still needs the reviewer and evaluation.
