# Architecture Brief: redesign-papier-tanne (part 1 — theme and fonts)

## The problem
The app uses the untouched shadcn default look (system font, generic slate/blue), which midwives
perceive as unpolished. A design team produced a complete visual system ("Papier & Tanne") with
its own colours, two brand typefaces and restyled controls; the app should adopt it without any
change to what it does.

## What already exists here
- Tailwind 3 + shadcn/ui primitives in `src/components/ui/`, themed by CSS custom properties in `src/index.css` (`:root` / `.dark`).
- A theme switch (light/dark/system) stored in localStorage.
- The site is static on Bunny (storage + pull zone); besides the address lookup via our own Bunny edge service, `index.html` still loads a leftover third-party script (`cdn.gpteng.co/gptengineer.js`), which the privacy statement does not mention. (Corrected after internal architecture review.)
- A privacy statement on the information page listing exactly what leaves the browser.

## What would newly, permanently exist
A second permanent visual token set replacing the first (same mechanism, new values), and a
runtime dependency on two web typefaces that every page view must load. Whoever changes the
design or the privacy statement keeps these consistent from now on.

## Options on the table
- **A:** load the typefaces from Bunny Fonts (fonts.bunny.net) via a stylesheet link.
- **B:** bundle the typeface files with the site (self-hosted).
- **C:** keep the system font stack and adopt only colours and component styling.

## Constraints that are not negotiable
- The privacy statement must stay complete and true (only the typed address text is personal data leaving the browser).
- No functional change; the existing tests are the contract.

## Outcome (after review)
Option B chosen by the user on 2026-10-22. The leftover gptengineer script is removed in this change.
