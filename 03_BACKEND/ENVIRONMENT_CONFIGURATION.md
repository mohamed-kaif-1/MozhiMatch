# Environment configuration

The starter .env.example contains empty secret slots and safe defaults. Copy it to .env.local locally. Never commit .env.local. The implementation agent must inspect the chosen account and must not activate billing to satisfy a free-tier test.

| Name | Allowed value/default | Visibility |
|---|---|---|
| AI_MODE | off or gemini, default off | Server |
| GEMINI_API_KEY | Empty by default, actual key entered locally | Server only |
| GEMINI_MODEL | gemini-3.5-flash-lite | Server, identifier can appear in result |
| DEPLOYMENT_MODE | local or public_demo, public_demo default in example | Server |
| APP_ORIGIN | Exact origin e.g. http://localhost:3000, no path/trailing slash | Server |
| DEMO_ACCESS_CODE | Random operator value at least 32 characters if hosted AI enabled | Server and private operator memory |

Set runtime=nodejs and export maxDuration=30 in analyze route after confirming host support. Constants for max bytes/items/text lengths and timeout belong in contracts/config.ts, not externally adjustable during a benchmark. Only compare publicly owned fixtures in hosted mode. No NEXT_PUBLIC secret or API-key storage in localStorage is allowed.

When setting production environment, use the host's secret interface on the user's chosen project. A preview URL requires its exact APP_ORIGIN. Never use a wildcard to fix a failed origin test. /api/health may report aiConfigured only after validating mode, key presence and model identifier. It makes no upstream call.
