# Design system

DECIDED identity uses warm paper, dark ink and a single blue action accent. Yellow supports the source-review context. Semantic green/amber/red appear only for status feedback. The 24px square CSS grid is visible in margins and header, while the editor and evidence panels remain opaque white. This keeps the dense Tamil text readable.

The visual hierarchy is a compact title, a short task instruction, the paired editor, the comparison action and the evidence queue. There is no marketing hero, decorative count badge or unused navigation. Flat square geometry and 2px borders carry the neobrutalist character. Shadows are hard-offset, not blurred. Use consistent 4px spacing increments and one icon family.

Canonical tokens are design-tokens.json and design-tokens.css. Copy the CSS token file into src/app/globals.css or import it from the source tree after checking relative paths. Tailwind 4 utilities reference these CSS variables. Do not maintain a separate contradictory palette in tailwind config.

Primary controls have 44px minimum targets and 16px text. Keyboard focus uses a visible blue 3px outline outside the border, with enough clearance from panel edges. Hover may shift by -1px and add one pixel shadow, while active may move +2px and reduce shadow. Disabled controls keep readable text, clear disabled semantics and explanation. Colour never carries status alone.

Reduced-motion users receive no transform animation. The layout keeps full source context on mobile via stacked fields and a sticky action area that does not obscure focus. Domain text is left aligned for both scripts. See COMPONENT_LIBRARY.md, TYPOGRAPHY.md and RESPONSIVE_DESIGN.md for exact application rules.
