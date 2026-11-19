# Free-tier audit

Checked 18 November 2026. Free availability is a current provider offering, with account conditions and changing limits. No paid dependency is required to develop or run structural/manual review.

| Component | Free path | Known limits | Status and action |
|---|---|---|---|
| Next/React/TypeScript/Tailwind/Zod/next-intl | Open-source packages, local execution | No service quota. Hardware and licences apply | Registry versions/licences and strict peer lock resolution checked, full install/app build pending |
| Fonts/icons | Local packages | Include OFL/ISC notices | Licence metadata checked, layout testing pending |
| Gemini Flash-Lite | Free tier listed in S04 | Active request/token limits vary by project/model/tier. Exact RPM/TPM/RPD unknown for user's account | Provider docs VERIFIED, account and latency UNVERIFIED. Inspect AI Studio first. Do not activate billing for this plan |
| Gemini data use | Public/owned synthetic content only | Free service terms may permit product improvement and infrastructure retention | Consent and source scope required. Confidential exam drafts excluded from this deployment |
| Vercel Hobby | Personal demo on free plan | Account usage limits, personal-use terms and 4.5 MB function request/response limit. Product uses 64,000 bytes | Hosting docs VERIFIED, account eligibility/runtime UNVERIFIED. Deploy shell in first five hours |
| Git/GitHub | Local Git and public repo | Account/service terms and repo access | User owns final creation/publish authorisation, no paid GitHub features selected |
| Vitest/Playwright | Local test tools | Chromium download and local RAM/disk | No paid browser-testing service |

ZERO-PAID-DEPENDENCY path uses Node 24 LTS and packages locally, AI_MODE=off, deterministic comparisons, manual review, original fixtures and a static replay banner where relevant. Optional live AI requires a working free project and must not silently switch to billed access. Provider failure leaves structural/manual mode usable and the AI gate unpassed.

Do not publish numeric provider quotas copied from older reports. Check the active console and record its actual values in HANDOFF.md without keys. If free quota is zero, show unavailable and choose whether the same model can be evaluated manually in an allowed free UI. Such a manual test establishes a workflow experiment, not a live integrated feature.

Sources are S03–S08 in [SOURCES](SOURCES.md). Free-tier limits are not runtime benchmarks.
