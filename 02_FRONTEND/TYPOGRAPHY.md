# Typography

Use local @fontsource/geist for English/interface Latin text and @fontsource/noto-sans-tamil for Tamil. Import only normal 400 and 600 weights initially. Retain package licence notices. Fontsource packages avoid a Google Fonts network dependency at runtime.

Body is 16px, supporting labels 14px, section title 20px, mobile page title 28px and desktop title 36px. Set English line-height 1.5 and Tamil 1.7. Textareas use 16px minimum to avoid mobile zoom and preserve Tamil vowel marks. Field labels are semibold, not all caps. Do not apply letter-spacing to Tamil.

`lang=en` and `lang=ta` identify source fields independently of the interface locale. The document language changes with the UI locale. Use normal word wrapping with overflow-wrap:anywhere only for long tokens/identifiers. Avoid truncating a question, explanation or action label. Option labels are a small fixed column while option text grows.

Evidence highlighting must respect grapheme boundaries and source spelling. Machine offsets are UTF-16 indices. If an offset would split a grapheme, show the full field without destructive substring styling and mark review. Avoid text-transform on source strings. Use tabular numerals only for elapsed timing tables, not as a substitute for source formatting.
