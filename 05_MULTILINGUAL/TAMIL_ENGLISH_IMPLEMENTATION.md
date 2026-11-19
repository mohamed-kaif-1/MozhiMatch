# Tamil and English implementation

Raw user strings are immutable source records. Derive NFC-normalized copies for numeric/unit token analysis. Do not remove Tamil diacritics, combine unrelated glyphs, strip “unusual” characters globally or deduplicate vowel-sign runs. Valid decomposed Tamil can contain adjacent combining signs. Exact source citations use raw strings and calculated JavaScript UTF-16 spans.

Normalize Tamil decimal digit tokens to ASCII only for rule comparison, never for display. Numeric differences are review candidates rather than proof because English words and Tamil number words need semantics. Unit matching uses an explicit small alias table such as kg/கிலோ, cm/செ.மீ. and m/மீ. Maintain paired tests and do not treat an unknown unit as a guessed equivalence.

Permit Tamil initials, proper names, punctuation and English subject terms inside Tamil fields. No separate language detector is needed because fields already carry language identity. A Tamil field containing English code-mixed wording is still evaluated as supplied. A predominantly English Tamil version may need human review; do not invent an automatic language-correctness score.

Noto Sans Tamil and Geist load locally. Use lang attributes, natural wrapping and line-height 1.7 for Tamil. Domain terms in the supplied dictionary, especially “விடைத் தெரிவு” and “மறுஆய்வு”, are proposed wording and require final teacher/native-speaker review. This is an unresolved linguistic QA action, not an assertion that a reviewer approved them.
