# Iterate Spec: redesign-papier-tanne (part 1 of 3 — theme and fonts)

- **Run ID:** iterate-2026-10-22-redesign-papier-tanne
- **Type:** change
- **Complexity:** medium
- **Status:** approved (plan reviewed; user decisions 2026-10-22 integrated)

## Goal
Replace the generic shadcn look with the "Papier & Tanne" design system chosen in Claude Design:
warm paper surfaces, a fir-green accent, a designed dark palette, Newsreader for headings and
Instrument Sans for UI text, and the restyled building blocks (button, field, card, checkbox,
alert, toast, tooltip, menu). Nothing about how the app works changes. Page layouts follow in
parts 2 (invoice page) and 3 (settings and information). The user deploys only after part 3
(interview, 2026-10-22). In the same `<head>`, the leftover third-party `gptengineer.js` script
is removed so the privacy statement ("nothing else is sent") is true (user decision 2026-10-22).

## Acceptance Criteria
- [ ] AC1 (light): with the light theme, the page background computes to `rgb(246, 243, 236)`
  and the primary button ("Rechnung Generieren", not hovered or focused) to background `rgb(31, 92, 78)` and text `rgb(255, 255, 255)`.
- [ ] AC2 (dark): after choosing "Dark" in the theme menu and reloading, the page background
  computes to `rgb(18, 21, 19)` and the primary button background to `rgb(134, 201, 179)`.
  (Menu labels stay as they are; German labels + "System" come with part 3.)
- [ ] AC3 (tokens): every colour token in `src/index.css` (`:root` and `.dark`) equals the token sheet
  in `.shipwright/designs/richtung-a-handoff.md` exactly (HSL channels with one decimal, round-tripped to hex);
  the four tokens the sheet leaves open are set as decided below; `tailwind.config.ts` contains no hex colour,
  channel colours resolve as `hsl(var(--x))`, and full-value colours (`ring`, `danger-ring`, `scrim`) as `var(--x)`.
- [ ] AC4 (fonts): Newsreader (500, 500 italic) and Instrument Sans (400/500/600) are bundled with the site
  (`@fontsource`, Latin subset, `font-display: swap`); the page contacts no font host; body text computes to an
  `Instrument Sans` font-family and the page title `h1` to `Newsreader`, and `document.fonts.check` confirms
  both faces actually loaded.
- [ ] AC5 (components): on the invoice page a text input computes to height 48px and border-radius 10px,
  the primary button to height 48px and radius 10px, the form card to radius 16px, and a service checkbox to 22×22px.
- [ ] AC6 (privacy): `index.html` loads no script, stylesheet or font from another host (the `cdn.gpteng.co`
  script and the "GPT Engineer" meta tags are gone); loading the start page in a browser contacts no host other
  than the app itself. The Datenschutz text stays unchanged and is now true.
- [ ] AC7 (no functional change): the existing unit suite and the existing Playwright specs pass
  without changing their assertions; lint, typecheck (part of `npm run build`) and build pass.

## Spec Impact
- **Classification:** modify
- **ADD:** none
- **MODIFY:** FR-01.08 — new AC line: the app loads no third-party script, stylesheet or font, so the privacy
  statement's "nothing else leaves the browser" holds. FR-01.09 — light and dark appearance use the new
  palette (new AC line; behaviour unchanged).
- **REMOVE:** none

## Out of Scope
- Page layouts, new UI pieces (CHF total, municipality display, setup nudge, mobile PDF sheet,
  privacy band, badges, sheet component) — parts 2 and 3.
- Theme menu labels (German "Hell / Dunkel / System") — part 3.
- Hard-coded grey/red/blue utilities in callers (22 occurrences in 7 files: AddressFields, SignaturePad,
  StreetInput, PersonalInfoFields, DateAndMunicipalityFields, Info) — parts 2 and 3.
- Dark-mode flash before React mounts (pre-existing) — follow-up for part 3.
- The PDF invoice layout (drawn with jsPDF's own fonts; neither tokens nor web fonts reach it).

## Design Notes
- Source: Claude Design project c5c682af…, `templates/wartgeld-tokens/WartgeldTokens.dc.html`
  (distilled in `.shipwright/designs/richtung-a-handoff.md`). Direction A was chosen by the design team.
- Tokens stay in the shadcn HSL-channel form (`--x: H S% L%`, used as `hsl(var(--x))`) so
  opacity modifiers such as `bg-primary/90` keep working; translucent tokens (`--ring`, `--danger-ring`,
  `--scrim`) are full colour values used as `var(--x)` (no opacity modifiers on those).
- Tokens the sheet leaves open (decision): `--card-foreground` = `--popover-foreground` = `--foreground`;
  `--secondary` = `--muted` and `--secondary-foreground` = `--foreground` ("Drucken"/"Speichern" use it).
- Button `destructive` becomes `bg-destructive text-white`, since `--destructive-foreground` is now
  "text on error surface" (dark red).
- Fonts are self-hosted, as the handoff requires (user decision 2026-10-22, after all reviewers recommended it).
- Headings use Newsreader 500 only: base layer `h1, h2 { font-serif font-medium }`; the two page `h1`s lose
  `font-bold` and CardTitle uses `font-medium` (otherwise the browser fakes a bold).
  Found during build: the same applies to the Settings `h1` and the `h2`s in Info, Settings and FormContainer,
  so their `font-bold`/`font-semibold` classes are removed too (class-only; guard test in `theme.test.ts`).

## Affected Boundaries
n/a — no serialized format, storage key, env, or API contract changes; only CSS, Tailwind
config, component class names, two font packages, removed `<head>` tags.

## Internal Plan Review
- **Ran:** yes (shipwright-plan:opus-plan-reviewer, opus) — verdict approve-with-changes
- **Summary:** sound approach; AC2/AC5/AC7 could not pass as written; privacy gaps (gpteng script, remote stylesheet).
- **Findings:**
  1. high · lazy font requests trip `municipality.spec.ts` "no external request" → fixed (fonts bundled, no external host at all)
  2. high · `FormActions` `h-11` overrides + cva size order defeat 48px → fixed (height in `size.default`, overrides removed)
  3. high · no "Dunkel" menu item → fixed (AC2 uses "Dark"; labels deferred to part 3 by user)
  4. high · `cdn.gpteng.co` script makes privacy text false → fixed (removed, AC6 + unit/e2e guards; user decision)
  5. medium · remote stylesheet leak vector / handoff guardrail overridden → fixed (self-hosted fonts)
  6. medium · sheet lacks secondary/card-fg/popover-fg → fixed (decision in Design Notes)
  7. medium · destructive-foreground breaks solid destructive button → fixed (`text-white`)
  8. medium · `--ring` rgba inside `hsl()` → fixed (`var(--ring)` + config test)
  9. medium · faked bold Newsreader → fixed (font-medium, `font-bold` removed from h1s)
  10. medium · rgb precision → fixed (one-decimal channels, exact hex round-trip test)
  11. low · no CSP today → n/a now (no external host remains)
  12. low · privacy sentence placement → n/a (text unchanged)
  13. low · dark flash on load → disclosed, follow-up part 3
  14. low · hard-coded caller colours → disclosed, parts 2/3 scope
  15. low · PDF unaffected → confirmed
- **Known limitations:** dark flash before mount; caller colour utilities until parts 2/3.
- **Status:** 12 fixed, 2 disclosed, 1 confirmed

## Internal Architecture Review
- **Ran:** yes (shipwright-plan:architecture-internal-reviewer) — verdict build-with-changes, prefers B
- **Summary:** worth building on existing theme mechanism; bundle fonts instead of a new outside host.
- **Findings:**
  1. medium · B smaller than A → accepted (user chose B)
  2. high · gptengineer.js makes privacy statement false; brief wrong → accepted, script removed
  3. low · A widens future CSP → resolved by B
  4. low · tests/page depend on outside host → resolved by B
  5. low · font-load failure unspecified; computed font-family proves nothing → fixed (`font-display: swap`, `document.fonts.check`)
  6. low · necessity → build
- **Known limitations:** none
- **Status:** 6 fixed/resolved

## Architecture Review
- **Brief:** `.shipwright/planning/iterate/iterate-2026-10-22-redesign-papier-tanne/architecture_brief.md`
- **Verdicts:** glm=unavailable (no key) · openai=reject (of option A)
- **Smallest thing that would do (per reviewers):** option B — same tokens and component styling, fonts bundled via `@font-face`.
- **Findings:** simpler-alternative / medium — a separate font service adds a permanent request destination and privacy obligation → accepted.
- **Reconciliation:** the plan had chosen A because the user picked Bunny Fonts. Put to the user with all reviewers' recommendation; user chose B (2026-10-22). External iterate review (openai=revise) findings integrated: direct `var()` for full-value tokens, caller-override audit, exact colour comparison, real font-load check, typecheck via `npm run build`.

## Confidence Calibration
- **Boundaries touched:** none (see above).
- **Empirical probes run:** computed styles, real font loading (`document.fonts.check`) and outgoing requests in Chromium on dev server and built preview; screenshots light/dark/mobile reviewed.
- **Test Completeness Ledger:** 12 behaviours, all tested, 7/7 ACs covered (`shipwright_test_results.json`).
- **Confidence-pattern check:** no green-without-run claims; the heading-weight guard was written after its fix (not test-first), disclosed. Known limitations: checkbox border token below 3:1 (design decision pending), dark dropdown focus contrast (part 3), twMerge unaware of custom shadow names, dark flash before mount.

## Verification (medium+)
- **Surface:** web
- **Runner command:** `npx playwright test` (all specs, incl. the new `e2e/theme.spec.ts`)
- **Evidence path:** `test-results/e2e-results.json`
