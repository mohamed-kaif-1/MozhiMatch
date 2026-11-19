# Canonical data models

Schemas in this directory and 04_AI/provider-output.schema.json are the canonical wire definitions. Implement equivalent strict Zod schemas in src/lib/contracts/schemas.ts and infer exported TypeScript types with z.infer. JSON schemas and app Zod definitions must accept/reject the same contract fixtures. The schemas specify shape. Additional semantic invariants below must be tested in code.

| Model | Identity/invariant | Handling |
|---|---|---|
| AnalyzeRequest | requestId is UUID, revision nonnegative, locale en/ta, 1–10 items, unique item IDs | Unknown properties and whitespace-only text reject 422 |
| QuestionSide | Stem 1–2000 UTF-16 code units at the UI, options 2–5, each 1–400. Actual server validation follows Unicode code points in JSON schema, plus 64,000 UTF-8 bytes overall | Keep raw strings. Use a conservative client code-unit limit and server bound. Never truncate silently |
| Option | A–E label, one text per row | Duplicate or unequal sets produce structural finding and skip semantic provider for that item |
| FieldRef | kind stem requires label null. kind option requires A–E | Enforced after shape parse |
| Provider comparison | Exactly one comparison for stem plus every label of each compatible item | Unknown IDs, missing/duplicate fields or cross-item quotes invalidate that item's semantic result |
| Validated comparison | Exact raw excerpts with UTF-16 start/end indices, end exclusive | Literal source match and unique occurrence required, not offsets invented by the model |
| ReviewDecision | Local only, itemId plus current revision and keep/fix/escalate | Reset on text mutation. Never included as a model label |

Reviewer decisions and language state are browser data, not wire result extensions. No server table, row ownership, auth identity or migration exists. Request sourceKind is an attestation and does not prove provenance. Hosted mode therefore also compares raw item payloads with a server-owned demo allowlist. The item identifier by itself grants no permission.

JSON strings permit raw source punctuation and newlines. Derive NFC-normalized strings for matching numeric/unit tokens, while exact citation checks use original strings. The English and Tamil versions are paired by explicit ID and label. Reordered semantic choices appear as differences in the affected labels. This avoids hiding answer-slot changes through automatic realignment.
