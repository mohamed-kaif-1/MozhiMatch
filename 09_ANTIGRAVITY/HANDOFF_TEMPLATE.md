# Handoff template

Copy this structure into root HANDOFF.md and update it after each completed or blocked phase. Avoid secrets and private source text.

| Field | Record |
|---|---|
| Phase and timestamp | Actual selected prompt, local time and timezone |
| Branch/commit | Current Git state and uncommitted work |
| Verified implementation | Existing files and observed behaviours |
| Changed files | Paths and why each changed |
| Checks run | Exact command, exit status and concise output summary |
| Live evaluation | Model/prompt/input IDs and actual outcome, or NOT RUN |
| Contract changes | Version and consumer impact, or none |
| Event constraints | Solo/brief/registration status with evidence |
| Blockers | Concrete missing dependency and independent work completed |
| Next dependency | One executable milestone and required inputs |

The initial handoff belongs to this documentation package and explicitly states no app source has been implemented. Do not overwrite actual later work with this initial state. Regenerate only a template, never fabricated history.
