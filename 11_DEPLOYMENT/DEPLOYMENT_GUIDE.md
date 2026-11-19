# Deployment guide

Primary target is Vercel Hobby for an eligible personal demonstration. One Next.js project serves UI and Node route handlers. The exact user account eligibility, quota and target project remain unverified. No database, Docker, Python service or separate CORS setup is required.

## Local verification

After source exists, run each command in PowerShell and inspect its exit code before continuing.

```powershell
npm ci
npm run typecheck
npm run lint
npm run test
npm run build
npm run start
```

Open http://localhost:3000 in a fresh browser tab. Set APP_ORIGIN exactly to that origin for local mode. Test rules-only first. For local permitted AI, set DEPLOYMENT_MODE=local and AI_MODE=gemini with key through .env.local. Restart after environment changes. Verify source consent, provider timeout and valid evidence.

## Hosted release

Use the user's chosen repository and hosting account. Before external publish, prepare the production build, check no secrets and identify the exact project and public content. Where the task authorises deployment, proceed within that account scope. If account/visibility is missing, ask only for that concrete missing input. Do not create a billed plan.

Import the Next.js repo with Node24 and root build directory. Add server-only environment values. Begin AI_MODE=off and DEPLOYMENT_MODE=public_demo. Set APP_ORIGIN to the deployment's exact HTTPS origin. /api/health must show configuration without leaking secret values. Signed-out visitor rules flow should work. For a live operator demo enable AI_MODE=gemini and add the private demo code through host secrets, then redeploy. Verify wrong code and modified sample are blocked before testing a valid original sample.

The app cap is 64,000 request bytes, under the documented 4.5 MB host bound. Node handler maxDuration is proposed at 30 seconds, provider abort 25. Check that the host accepts these settings. No automatic retries or database cold start exists. Free function limits and model availability still can interrupt a demo.

After release record URL, commit SHA, mode, observed health, timestamp and actual smoke result in HANDOFF.md. Do not put a private code in a URL. If custom domains or preview origins are used, update the exact origin rather than disabling checks. Local recovery alone does not meet the event live-link requirement.
