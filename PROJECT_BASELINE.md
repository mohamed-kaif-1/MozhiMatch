# Project baseline

Evidence vocabulary applies throughout this package. VERIFIED means a source was inspected. DECIDED means a blueprint design choice, subject to the feasibility gate. PROPOSED means implementation work. ASSUMED means a reversible planning assumption. UNVERIFIED identifies a dependency that still needs confirmation. TESTED refers only to an executed and recorded check.

| Field | Frozen value | Status |
|---|---|---|
| PROJECT_NAME | Bilingual MCQ Preflight | DECIDED working name |
| PROJECT_GOAL | Help a bilingual practice-paper editor find material English–Tamil differences before release | DECIDED |
| TARGET_USERS | Teachers and coaching/mock-paper editors with both authorized versions | DECIDED initial segment, demand untested |
| PROBLEM_STATEMENT | When releasing parallel question versions, an editor must check that stems and options preserve meaning. Documented public exam defects demonstrate omissions and altered meanings, while local review time and repeat frequency remain unknown. | VERIFIED examples, ASSUMED pilot workflow |
| CORE_INNOVATION | An option-aware queue of source-grounded comparisons and reviewer actions | PROPOSED advantage against direct alternatives |
| CORE_AI_CAPABILITY | Classify meaning equivalence for fixed paired stem/option fields, with uncertainty and exact excerpts | PROPOSED |
| PRIMARY_USER_WORKFLOW | Load/edit paired items, run structure checks, consent to permitted cloud review, inspect findings, decide, copy issue list | DECIDED |
| MVP_SCOPE | Up to 10 explicitly paired items, 2–5 options per side, exact source citations, bilingual UI, no accounts, one review screen, manual decision state | DECIDED |
| SUCCESS_METRIC | Four of four held-out material defects found, two of two ambiguous cases escalated, no false clear on material defects, at most one false alert on three clean pairs, all displayed quotes grounded. Beat strongest comparable workflow by 25% verified median time or one extra grounded finding with equal time/errors. | PROPOSED gate |
| PRIMARY_TECHNICAL_RISK | A general model ties or outperforms the structured workflow, or Tamil evidence is unreliable | UNVERIFIED |
| CRITICAL_FEASIBILITY_EXPERIMENT | Run development fixtures and then frozen holdout against rules, strong generic same-model prompt, manual review and a direct QA tool where available | PROPOSED |

The selected idea follows the latest recommendation in this conversation. Gemini's broad legal PDF/font engine is a different proposal and is excluded from this baseline. The baseline stays conditional until the model and competitive gate passes.

The user requested a Kaif–Aasim plan. The exact public event listing was observed as solo. The pair schedule is a reusable collaboration plan, conditional on organizer permission for collaborative code contributions. The event-compliant solo plan assigns all implementation to Kaif. No participant consent or approval is invented. Source S01 and the unresolved-decision register remain authoritative on event fit.

Three essential features are paired input/structural validation, evidence-grounded semantic review, and human decision with plain-text export. PDF/OCR, font repair, speech, question generation, answer solving, eligibility adjudication, user profiles, persistence services and multi-agent inference are deferred. See [refinement](00_PRODUCT/PRODUCT_REFINEMENT.md) and [canonical architecture](01_ARCHITECTURE/SYSTEM_ARCHITECTURE.md).
