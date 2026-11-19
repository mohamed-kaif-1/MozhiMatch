# Prompt design and inference call

Canonical prompt files are [system](prompts/system-v1.txt), [user template](prompts/user-template-v1.txt) and [generic comparison](prompts/generic-baseline-v1.txt). Fill items_json through JSON.stringify, never string-concatenate unescaped source into an instruction block. The system prompt defines the task and source-as-data boundary. A structured schema is still required.

Use Node fetch POST to `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`, with the secret in `x-goog-api-key`, application/json and an AbortController. Model identifier is server-configured and allowlisted. No user-supplied URL/model is accepted. API key stays out of query strings and logs.

Proposed body contains systemInstruction.parts.text, contents with role user and a text part, and generationConfig with temperature 0, maxOutputTokens 8192, responseMimeType application/json and responseJsonSchema containing provider-output.schema.json without the optional meta-schema property. Confirm the current REST API accepts this schema during PROMPT_02. Some JSON Schema keywords may be unsupported. Relax only vendor transport schema while retaining full app validation, then record the difference.

Read the first eligible text candidate only after checking finish status and safety/refusal. Empty, truncated or missing text is invalid_response. Do not regex-repair arbitrary model prose or silently drop malformed comparisons. Validate the complete result. Token and 25-second latency budgets are design targets, not measured service guarantees.

No hidden answer markings, expert-referral notes or expected labels enter either model condition. Keep the same input evidence for the generic prompt. Freeze prompts before heldout. If changed after seeing holdout, mark that set development and author a fresh holdout.
