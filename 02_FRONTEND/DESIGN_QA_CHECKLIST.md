# Design QA checklist

- [ ] English and Tamil text render with local fonts after a network-disabled refresh of installed assets.
- [ ] Grid visible in margins but absent behind dense source text.
- [ ] Token colours, 2px borders and hard shadows consistent across inputs/cards/buttons.
- [ ] Status text and icons work without colour recognition.
- [ ] Every form control has a persistent label and errors associated with aria-describedby.
- [ ] Tab order follows input, actions, queue, evidence and decisions.
- [ ] Focus rings remain visible at 360/390/768/1024/1440px and 200% zoom.
- [ ] Tamil labels wrap with no fixed-height clipping or letter-spacing.
- [ ] Busy and completion announcements occur once and do not interrupt editing.
- [ ] Provider fallback and replay labels are visible in the main work area.
- [ ] Source highlights preserve exact text, field labels and grapheme boundaries.
- [ ] Reset dialog traps/restores focus and Cancel preserves work.

Implementation status starts NOT RUN for every item. Record real viewport observations in HANDOFF.md. Automated checks supplement manual Tamil reading and keyboard review. Do not replace a usability check with a screenshot-only completion claim.
