# Threat model

| Threat | Asset/boundary | Mitigation | Residual risk |
|---|---|---|---|
| Key exposure | Server environment to client bundle | server-only modules, no NEXT_PUBLIC key, asset scan | Host/account compromise remains external |
| Source prompt injection | User text to model | Fixed system task, structured result, no tools, output and quote checks | Model reasoning may still be influenced, gate tests required |
| Output XSS | Provider/source to DOM | React text nodes only, no raw HTML/markdown | Developer regression if renderer changed |
| Anonymous quota abuse | Public analyze route | Private operator code, exact demo samples, free project and kill switch | Code sharing/replay and distributed throttling limits |
| Large body | HTTP parser to server memory | Bounded stream, item/field/output caps | Host handles transport before app code |
| Forged result | Provider JSON to verdict | Strict IDs/slots/evidence and revision checks | Validly quoted wrong semantics require human review |
| Stale request | Network to browser reducer | UUID/revision guard, abort on edit/reset | Upstream call may still consume quota |
| Unintentional retention | Logs/storage/clipboard | In-memory content, metadata-only logs, visible copy preview | Provider/platform/OS policies apply |
| File malware | No file boundary in MVP | Reject non-JSON and upload endpoints absent | Future imports need a new assessment |

Order protections by the actual workflow. There is no SQL injection surface because no SQL/database is present. Do not add unused “security modules” for nonexistent services. Every mitigation has a corresponding security test and owner. External secrets are user-managed configuration, never generated into the documentation package.
