# Git workflow

Inspect git status and current branch before changes. If a repository already exists, preserve its history and files. Create a new repository only in the intended extracted directory. Do not auto-reinitialise a parent project. Commit the blueprint and scaffold separately so implementation changes can be reviewed.

In the conditional team plan, Kaif uses feature/core-contracts and Aasim uses feature/workbench. Kaif alone edits package.json/package-lock.json and shared schema files. Aasim requests a contract change through a short interface note. Merge small working increments at the integration checkpoints. Do not create two competing package lockfiles.

Commit messages describe a concrete behaviour, for example `feat: validate paired source evidence`. Before a commit run relevant tests and inspect diff/staged files. Never stage .env.local, logs with raw source or personal credentials. No force push, reset --hard, clean -fd, broad deletion or secret-history rewrite without explicit approval. Revert a mistaken coherent commit through normal reversible Git operations after inspecting it.

Public repository creation and pushing use the user's chosen account/repository and authorisation. Local commits are reversible authorised implementation work. Branch protection can be configured later if available; it is not a dependency on a paid plan. Keep the final README honest about fixture provenance and untested assumptions.
