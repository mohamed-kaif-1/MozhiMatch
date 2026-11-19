# Low-fidelity layout specification

| Region | Desktop 1024–1440 | Mobile 360–390 |
|---|---|---|
| Header | Name left, mode and locale right | Name on first row, mode/locale wrap on next |
| Intro | One task sentence and Help | One task sentence, Help below |
| Input controls | Example, item selector, add/reset | Full-width example and compact item selector |
| Paired editor | English left and Tamil right, equal widths | English stem/options followed by Tamil stem/options |
| Consent/action | Source-kind left, consent centre, Analyze right | Vertical source-kind, consent, Analyze, Cancel |
| Review area | Queue 1/3 width, evidence 2/3 | Queue above evidence |
| Evidence | Two text panels under the same field caption | English quote then Tamil quote, reason below |
| Decision/export | Keep/Fix/Escalate row and Copy | Wrapping row with 44px targets and full-width Copy |

These are implementation-ready regions, not a pixel-identical external product. The grid background remains in margins while panels are opaque. A top-level max-width of 1280px and 16px mobile gutters preserve space. Avoid fixed pixel heights on source text or Tamil buttons.
