# End-to-end acceptance gates

| Gate | Executed scenario | Required evidence | Initial state |
|---|---|---|---|
| AT01 | Original development meaning change | Source view plus correctly validated exact spans | NOT RUN |
| AT02 | Structural mismatch | Model spy shows incompatible item skipped, rule finding visible | NOT RUN |
| AT03 | Ambiguous content | needs_review with no speculative correction | NOT RUN |
| AT04 | Invalid source quote | Unvalidated provider content absent from UI | NOT RUN |
| AT05 | Tamil UI | Matching controls, source retained and no overflow | NOT RUN |
| AT06 | Timeout/key missing | Structural review preserved with explicit unavailable label | NOT RUN |
| AT07 | Public hosted mode | Anonymous rules work, unauthorized AI blocked | NOT RUN |
| AT08 | Live benchmark | Frozen labels, comparison timing/error table and limits | NOT RUN |
| AT09 | Submission | Signed-out repo and live URL accessible, deadline/brief checked | UNVERIFIED |

Product readiness requires the acceptance scenarios plus the semantic gate. Review screenshots can show actual implemented flow after tests, but the blueprint itself contains no app screenshot or runtime success claim. Never infer a live model result from a mocked browser test.
