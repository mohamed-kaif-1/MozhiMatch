# AI architecture

Single AI task is meaning comparison between fixed paired English and Tamil fields. Deterministic checks handle shape, labels and visible token differences. They cannot reliably establish that a verb, qualifier or proper-name rendering preserves the assessed meaning, which is the hypothesis for the model experiment.

Only structurally compatible items enter the provider batch. Supply item ID, raw en/ta stems and same-label options. The prompt treats all source strings as quoted data. Require one comparison per stem and per label. Each has equivalent/different/uncertain, exact source excerpts, a controlled reasonCode and a brief explanation in the requested UI language. No answer key or content solving is requested.

Output validation occurs in three passes. Parse and strict schema validation check shape. Coverage checks enforce expected item IDs and each slot exactly once. Evidence checks verify the exact excerpts belong uniquely to the expected source fields and compute exclusive UTF-16 spans from raw source. Bad coverage invalidates semantic results for that item. A failed quote invalidates the item so an incomplete subset cannot imply no issue.

Aggregation preserves rules. A valid different comparison yields meaning_changed, unless structural incompatibility already blocked analysis. Any uncertain comparison, invalid semantic output or deterministic candidate finding gives needs_review when no valid material difference exists. Only all expected fields equivalent and no rule finding yields no_issue_found. UI wording explains that a human review decision is still required.

No hallucination proof follows from valid quotes. A model can quote correctly and reason incorrectly. The heldout labels and external comparison test this residual error. No self-reported numerical confidence is displayed. Request timeout, model settings, prompt version and model ID are recorded for evaluation without storing live user content in operational logs.
