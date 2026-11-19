# Windows development environment

Commands below are proposed for the user's Windows PowerShell environment. They were not run on that laptop. Node 24 LTS is the supported baseline; the earlier user Node 25 version is outside current Vitest engine ranges. Install from the official Node distribution if needed, then restart the terminal. Git and npm are required. Python is optional for auditing the blueprint.

```powershell
node --version
npm --version
git --version
Get-Location
Get-ChildItem
git status --short
```

After inspection, create src directories and copy the starter package candidate to the root. Do not run a scaffold that overwrites docs. Antigravity must add layout/page, PostCSS/ESLint/TypeScript configs and test configs using the exact contract paths.

```powershell
Copy-Item ./12_DEVELOPMENT_STANDARDS/starter/package.json ./package.json
Copy-Item ./12_DEVELOPMENT_STANDARDS/starter/package-lock.json ./package-lock.json
Copy-Item ./12_DEVELOPMENT_STANDARDS/starter/.env.example ./.env.local
Copy-Item ./12_DEVELOPMENT_STANDARDS/starter/.gitignore ./.gitignore
npm install
npm run typecheck
npm run lint
npm run test
npm run build
npm run dev
```

If the target files already exist, compare and merge rather than overwrite. The delivered starter lockfile passed npm strict peer resolution on Linux/Node24. Copy it with the matching package candidate, then use npm ci for the implementation. Full installation, Windows native packages and the application build remain untested. If dependencies change, resolve and pin a new lockfile with strict peer checks. No application scripts can pass before the source/configs are implemented. Playwright browser installation is explicit with `npx playwright install chromium`. A blocked browser download leaves automated browser QA NOT RUN and requires a documented manual review.

Never paste a secret into source or a command likely to enter shared transcript logs. Set the actual key/code through a local editor or the chosen host's secret UI. The empty example does not claim provider readiness.
