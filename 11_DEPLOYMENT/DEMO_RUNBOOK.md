# Demo runbook

## Before presenting

1. Open the deployed URL in a signed-out browser and confirm the matching release SHA in the operator notes.
2. Load the original DEV_NEGATION sample. Its expected discrepancy is a missing negation in the Tamil stem. It is deliberately synthetic and must be identified as such.
3. Enter the private operator code in the password field before screen sharing, choose AI and confirm public/owned source consent. Keep .env and host secret panels closed.
4. Confirm the key's current free quota and make one rehearsal call. Real timing/results go into the measured table. Avoid a hidden model call on page load.
5. Prepare DEV_UNCERTAIN and DEV_STRUCTURE for the review/structural cases. Keep the strong generic prompt and measured evaluation table available for a question.

## Expected observable sequence

Paired source loads → Analyze starts busy state → validated exact snippets appear → reviewer chooses Fix → clipboard preview shows issue list. DEV_UNCERTAIN should need human review if the model respects the initial ambiguity. A wrong confident clear must be reported as a failed case. DEV_STRUCTURE does not need an AI call.

## Failure handling

If the provider is unavailable, point to the unavailable warning and run structural/manual review. A separately labelled recorded fixture replay can show intended UI flow, with a permanent replay banner. Do not substitute replay into the live route. If deployment is unavailable, show the local app or recording as a recovery demonstration and disclose the live-link issue. Fix the real deployment before claiming submission readiness.

The public source evidence in S12/S13 motivates the problem, but the hosted demo contains original authored text. Benchmark metrics and product advantage are shown only after actual evaluation. A 10-item pilot has limited external validity.
