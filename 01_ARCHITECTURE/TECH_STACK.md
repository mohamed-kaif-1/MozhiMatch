# Selected technology stack

Versions below are exact registry candidates queried on 18 November 2026, not a claim that the app builds. The starter package and lockfile passed strict peer dependency resolution in this workspace. The first application install/build and Windows native execution still belong to Phase 00. Keep the matching package-lock.json and use npm ci. Node 24 LTS is chosen because Vitest 5 and current tooling support it, whereas the user's Node 25 is outside Vitest's declared range. No Docker is required.

| Technology | Exact package version | Purpose | Licence | Alternative/fallback |
|---|---|---|---|---|
| Next.js | `next@16.4.6` | Single app and route boundary | MIT | Vite + FastAPI would create two deploys |
| React | `react@19.3.1` | Workbench components and reducer | MIT | Extra global state library unnecessary |
| React DOM | `react-dom@19.3.1` | DOM renderer matching React version | MIT | Keep paired version |
| Tailwind | `tailwindcss@4.3.5` | Tokens and responsive styling | MIT | CSS modules acceptable fallback |
| Tailwind PostCSS | `@tailwindcss/postcss@4.3.5` | Tailwind 4 compiler integration | MIT | Plain CSS |
| Zod | `zod@4.6.7` | Request and provider validation | MIT | Manual validation harder to audit |
| next-intl | `next-intl@4.15.1` | Locale provider and translations | MIT | Small custom context if integration fails |
| Lucide | `lucide-react@1.75.0` | Accessible status/action icons | ISC | Text labels can replace icons |
| Noto Sans Tamil | `@fontsource/noto-sans-tamil@5.3.0` | Locally hosted Tamil font | OFL-1.1 | System Nirmala UI |
| Geist | `@fontsource/geist@5.3.0` | Locally hosted Latin font | OFL-1.1 | System UI |
| server-only | `server-only@0.0.1` | Prevent importing key-bearing modules to client | MIT | Keep secrets behind route module |
| TypeScript | `typescript@5.9.3` | Strict typecheck | Apache-2.0 | Use supported stable range if tool compatibility fails |
| Vitest | `vitest@5.1.1` | Pure core and route contract tests | MIT | Node tests if framework incompatibility |
| Playwright | `@playwright/test@1.65.1` | Chromium workflow and responsive smoke | Apache-2.0 | Manual browser QA with logged results |
| ESLint | `eslint@9.39.5` | Static quality checks | MIT | Stable compatible ESLint release |
| Next ESLint config | `eslint-config-next@16.4.6` | Framework lint rules | MIT | Match exact Next release |

Native Node fetch uses the Gemini REST endpoint. No Google SDK is needed. No database driver, storage client, Supabase, Python runtime, queue or Redis service is selected. These choices reduce external setup and operational surface. This is a personal hackathon demo deployment, with the host's free-plan usage terms to be verified for the account.

Vercel is the primary deployment recommendation with one server boundary. Local Next.js is the free fallback for development. It does not satisfy the event's live-link requirement by itself. Cloudflare and Netlify are alternatives to assess only if Vercel cannot host this account. Their Node adapters and free limits are unverified in this package.

See [the audited source register](SOURCES.md), [free-tier audit](FREE_TIER_AUDIT.md), [the dependency matrix](DEPENDENCY_MATRIX.md) and the exact starter package candidate in 12_DEVELOPMENT_STANDARDS/starter/package.json. Changes to major versions require typecheck, tests and a build.
