# Architecture decisions

| ADR | Decision | Reason | Rejected choice and consequence |
|---|---|---|---|
| 001 | One Next.js project and Node runtime routes | Smallest shared TypeScript deployment with safe key boundary | FastAPI adds two deployments/CORS and Python setup without a core need |
| 002 | Fixed paired fields, 1–10 items | Stable input and source checks make the core claim testable | PDF parsing adds extraction and alignment risks |
| 003 | Native fetch for Gemini generateContent | Avoid SDK size/peer constraints, keep adapter small | SDK is valid future alternative if REST schema support changes |
| 004 | Zod mirrors JSON schemas | Strong runtime validation and inferred app types | Untyped JSON assertions allow invented fields |
| 005 | next-intl provider on one route | Typed dictionary coverage, locale switch with no route/middleware overhead | URL locale routing has no shareable content need here |
| 006 | Source/decisions in memory, locale in storage | Minimal retention and zero hosted DB | Supabase/Postgres and accounts add services/costs without a pilot requirement |
| 007 | Hosted AI code plus exact owned-demo allowlist | Protect anonymous API use and restrict cloud data scope | Browser keys and unrestricted endpoint expose quota and content |
| 008 | No model confidence score | Evidence and coverage are verifiable, self-reported probabilities are uncalibrated | Displaying confidence could mislead reviewers |
| 009 | Same-label comparison | Fixed A–E correspondence is explicit. Reorders surface as meaning issues at affected labels | Automatic semantic realignment can hide answer-slot changes |
| 010 | No automatic provider retry | Predictable quota and user-visible failure | Automatic retries multiply cost and hidden latency |
| 011 | No automatic corrections | Reviewer owns wording and subject interpretation | New AI-generated wording needs separate evaluation |

Changing an ADR requires a short rationale, affected contract/test list, owner review and an update here. Routine implementation refinements within these boundaries do not require another approval cycle. A changed user/problem or paid service is a substantive change and must be surfaced.
