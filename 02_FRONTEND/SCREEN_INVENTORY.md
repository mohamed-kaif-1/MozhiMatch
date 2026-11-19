# Screen inventory

| Screen/state | Purpose | Route | Dependencies |
|---|---|---|---|
| WB01 Workbench | Enter, analyze and review one batch | / | Client state, locale, optional analyze route |
| WB01-R Results region | Inspect queue and source evidence on the same page | /, in-page region | AnalyzeResponse and current revision |
| WB01-O Operator section | Enter code privately for hosted live demonstration | /, collapsible region | Configured deployment mode |
| WB01-E Error/recovery | Keep inputs while explaining failure | /, inline region | Localized stable error codes |
| WB01-H Help | Explain input format, cloud processing and limits | /, native details | Static translated copy |

No account onboarding, admin, marketing, analytics or separate history page is required. A system health endpoint has no dedicated user screen. At small viewports the same workbench stacks vertically and keeps source context visible. The screen's ephemeral states are specified in UI_STATES.md. Avoid routing to a new results page, which would require passing or persisting source text.
