# Responsive layout

| Width | Required layout | Check |
|---|---|---|
| 360px | One column, 16px gutters, source options wrap, full-width primary action | Page scrollWidth ≤ innerWidth, all labels readable |
| 390px | Same order, extra source space | Tamil longest labels do not clip |
| 768px | Single workbench column, paired fields may be two columns only if each remains ≥320px | No squeezed source text |
| 1024px | Two source columns with 24px gap, results queue/evidence split | Keyboard focus fully visible |
| 1440px | Centre max-width 1280px, same density | No excessive line length or stretch |

CSS breakpoints use 640/768/1024/1280px as content decisions. Prefer grid minmax(0,1fr) and min-width:0 on children. Textareas and panels grow naturally. Tables use a local overflow container with an accessible caption. Never hide evidence to make a screenshot fit.

At 200% zoom the desktop workbench should flow like mobile. Mobile browser keyboard must not cover the focused textarea. Avoid a fixed footer. If sticky actions are used, reserve padding and test focus scrolling. Reduced-motion disables transforms and smooth scroll. Run both locales at every required viewport and record actual screenshots only during implementation QA.
