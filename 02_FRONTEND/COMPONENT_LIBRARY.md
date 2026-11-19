# Component library

| Component | Exact behaviour and styling | Interaction/accessibility |
|---|---|---|
| Button | 2px ink border, 3px hard shadow, 12×16px padding, 44px min height | Native button, focus-visible, disabled only with reason text |
| Panel/card | White, square, 2px border, 4px shadow, 16/24px padding | Section heading associates content |
| Input/textarea | White, 2px border, 12px padding, body font | Explicit label, error ID via aria-describedby, textarea rows grow |
| Select | Native select styled with 2px border | Visible label, no custom listbox dependency |
| Header | Product name, locale, mode and help details | One skip link goes to main editor |
| Source tabs | Mobile language tabs with both fields preserved | role tablist/tab/tabpanel and arrow-key navigation if custom. Stacked layout is the simpler alternative |
| Review queue | Full-width selectable item buttons with status text | Selection announced, keyboard Tab/Enter, no colour-only meaning |
| Evidence panel | Two source excerpts, labels and a reason | Plain React text, mark elements, exact field references |
| Status | Text plus small Lucide icon | aria-live polite for summary, icons aria-hidden |
| Progress | “Comparing…” with elapsed-independent busy indicator | aria-busy, one announcement, Cancel action |
| Inline alert | Semantic surface, dark text and stable title | role alert only for new actionable error, no repeated narration |
| Toast/copy result | Small polite status region | Remains long enough to read, no vital info only in a toast |
| Empty state | One sentence and Load example action | No decorative illustration required |
| Loading skeleton | Static panel silhouettes if useful | aria-hidden, real progress label remains accessible |
| Locale control | English / தமிழ் native select or buttons | Persistent, wraps, distinct selected state |
| Operator code | Password input in collapsible operator section | Never echoed, in-memory, accessible reveal control optional |
| Reset dialog | Native dialog only when current work exists | Focus trapped by native modal and restored to Reset, Cancel default |
| Results table | Only in evaluation evidence panel | Semantic caption, headers, overflow wrapper, no app-wide analytics |
| Tooltip | Short optional help via native title plus persistent help text | Critical instructions stay visible |

File upload and mobile navigation menu have no MVP workflow. Their styles are deferred instead of adding inactive components. No modal library or motion library is selected. Use CSS transitions at 120–180ms with reduced-motion support.
