# Phase completion evidence

| Record | Required content |
|---|---|
| Phase | Prompt number and intended acceptance |
| Source state | Commit/branch and exact changed files |
| Implementation | Actual user-visible behaviour or backend invariant |
| Validation | Commands run, results and skipped checks with reason |
| Evidence | Fixture IDs or local screenshot references where needed, with provenance |
| Failures | Exact error class, impact and repair attempted |
| Readiness | PASS, FAIL or BLOCKED for this phase only |
| Remaining | Known gaps and their owner |
| Next | Next dependency when current phase passes |

A mocked provider unit test validates application handling. A real model comparison validates a separate probabilistic capability. A production build validates a build. None can stand in for the other. Write the right status for each, and keep final product continuation conditional on the original semantic/comparison gate.
