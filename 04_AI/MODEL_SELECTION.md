# Model selection

Primary candidate is Gemini 3.5 Flash-Lite because official docs list low-latency text and structured JSON support with a free tier. Tamil quality and account quota remain unverified. This choice is contingent on the critical experiment. Explicit same-model comparisons use the same model ID, generation settings, inputs and output language.

| Alternative | Assessment |
|---|---|
| Groq | Possible free quota, but current Tamil pair quality and structured-output model eligibility were not verified. Avoid adding it during the first build |
| Hugging Face hosted inference | Credit/model availability and public/private input policies vary. Not selected |
| Local open-weight model | Laptop GPU/RAM is unconfirmed. Small local models may underperform Tamil semantics. Not a reliable sprint fallback |
| Browser inference | Adds download, memory and model-coverage risks. No tested Tamil model selected |
| Generic Gemini chat/manual | Serious comparison workflow and emergency research route. It cannot be reported as integrated app inference |
| Deterministic/manual mode | Fully free and reproducible, but does not establish the semantic AI contribution |

Provider access is checked via a small original practice item. Only then select final model settings and freeze prompt v1. No model ranking is justified from the documentation alone. If quality fails, narrow the task or stop before UI investment. A different model needs another blinded comparison and updates to canonical docs.
