# AI failure modes

| Failure | Detection | Required response | Regression |
|---|---|---|---|
| Invented quote | Literal match fails | Invalidate item semantic comparisons | EVID-01 |
| Quote copied from another question | Item/field lookup fails | needs_review, no incorrect highlight | EVID-02 |
| Missing option comparison | Exact field set mismatch | Invalidate item, retain rules | EVID-03 |
| Tamil synonym falsely flagged | Human clean controls | Count false alert, refine development prompt | AI-02 |
| Proper name meaning unknown | Ambiguous fixtures | uncertain, not speculative correction | AI-03 |
| Same labels but swapped option meanings | Fixed-slot comparison | Flag both affected slots where evidenced | AI-04 |
| Prompt instruction in source | Injection fixture and schema/access checks | Treat as data, never invoke tools or reveal keys | SEC-04 |
| Correct quotes with wrong reasoning | Heldout labels and reviewer | Record semantic error, gate can fail | AI-01 |
| Provider refusal/truncation | Candidate/finish status check | unavailable or invalid_response | API-06 |
| Stale response after source edit | requestId and revision differ | Discard entire late response | UI-03 |

No evidence validator can certify language understanding. Incorrect no_issue_found on a material case is a gate failure. Keep sample provenance and denominator explicit. A few synthetic questions cannot prove effectiveness on full academic exams.
