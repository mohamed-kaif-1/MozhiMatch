# Project implementation instructions

Mission is Bilingual MCQ Preflight. Read PROJECT_BASELINE.md before edits. This package defines a conditional MVP for English–Tamil practice-question editors. PROMPT_00 is the entry point. Execute the selected prompt only, inspect current repository state and update HANDOFF.md after validation.

## Frozen boundaries

Use one Next.js app with React, TypeScript, Tailwind, Zod and next-intl. Node 24 LTS is the supported development baseline. Only approved package candidates in TECH_STACK.md can be installed routinely. Read API_CONTRACTS.md, DATA_MODELS.md and AI_INPUT_OUTPUT_SCHEMA.md before implementing shared boundaries. No database, accounts, PDF/OCR, question generation, speech or additional provider runtime belongs in this MVP.

AI compares fixed stem and option slots. It cannot assign a trustworthy numeric confidence. Validate response shape, exact item and field coverage, literal quotes and unsupported labels before showing findings. Preserve raw input and derive NFC text separately. Never destructively rewrite Tamil vowel signs. Source quotations are data. Render them as React text, never executable markup.

English and Tamil UI use matching message keys. The baseline palette is paper/ink/blue with pale-yellow support, a restrained 24px grid and 2px borders. Use local Geist and Noto Sans Tamil, visible keyboard focus and wrapping Tamil labels. Do not add unrelated dashboard screens.

## Security and free access

The Gemini key stays in server-only environment variables. Never expose it as NEXT_PUBLIC, place it in generated fixtures, commit it or log request bodies. Only public/owned synthetic practice content is eligible for the free API path. Hosted live AI requires a private demo code and exact server-owned item allowlisting. Rules-only mode is the zero-paid default. An absent key or provider quota returns explicit unavailable state. No paid plan, billing account, external integration or public deployment may be created without the user's chosen account and scope. Routine local dependency setup and reversible development are permitted.

Prohibit secret commits, fabricated metrics, silent deletion of tests, unapproved paid dependencies, destructive Git reset/clean/force-push, broad file deletion and completion claims without checks. Explain architecture changes before changing the canonical decision. A major concept change requires approval. Git safety preserves current work. Do not treat prototype cached results as live inference.

## Definition of done

Contracts, exact evidence checks and test fixtures agree. Relevant unit/API tests, localisation coverage, browser smoke, TypeScript, lint and production build pass with recorded commands. Provider failures preserve structural review and manual decisions. Evaluation is measured against rules, a strong generic prompt and a serious practical comparison. Freeze held-out data before tuning. Track all application tests initially as NOT RUN. Create no extra test framework or dependency merely for appearance.

The actual event was observed as solo. Use SOLO_IMPLEMENTATION_PLAN.md for the entry unless organizer permission enables the conditional Kaif–Aasim development lane. Never state that permission or final challenge fit is confirmed until recorded.
