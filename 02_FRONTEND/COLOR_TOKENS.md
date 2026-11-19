# Colour tokens

| Role | Value | Usage |
|---|---|---|
| Paper | #FFFDF5 | Grid background and page margins |
| Surface | #FFFFFF | Input, source and result panels |
| Ink | #171717 | Body text, borders and hard shadows |
| Muted | #545454 | Supporting instructions, no body copy opacity reduction |
| Primary | #2154F4 with white text | Analyze action and focus outline |
| Support | #FFE066 with ink text | Source-review reminder and selection accent |
| Success | #D6F3DD / #18552C | No issue found label with explicit text |
| Warning | #FFF0B3 / #654800 | Needs review and provider unavailability |
| Danger | #FFE0DB / #8A241A | Meaning changed or validation error |

Use blue for action and selection, not semantic correctness. Reserve red for a specific finding. Manual decisions use text labels and outline changes. Evidence highlights use support background plus a dark underline and a field caption. Multiple alerts must remain distinguishable in monochrome.

The blueprint audit computes WCAG contrast for named text/background pairs. Runtime QA also checks browser focus, active states and any alpha overlays. Grid lines must stay outside text surfaces. Do not apply primary blue to long paragraphs or use pastel text on white.
