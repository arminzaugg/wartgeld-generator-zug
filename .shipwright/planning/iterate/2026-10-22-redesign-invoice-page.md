# Iterate Spec: redesign-invoice-page (part 2 of 3 — invoice page)

- **Run ID:** iterate-2026-10-22-redesign-invoice-page
- **Type:** change
- **Complexity:** medium
- **Status:** approved (user 2026-10-22); plan reviewed, findings integrated

## Goal
Lay out the invoice page as in the "Papier & Tanne" screens (`InvoiceDesktop.dc.html`, `InvoiceMobile.dc.html`):
a new top bar, a privacy note, form cards with clickable service rows and a CHF total, the recipient
municipality shown once chosen, a field-linked error summary, a calm preview panel on desktop and, on
phones, a fixed action bar plus a bottom sheet for the finished PDF. What the invoice contains, how it is
validated, generated, printed and saved does not change. Settings and Info pages follow in part 3.

User decisions (2026-10-22): use the design wording; keep the privacy note but name the real route
(own address service → Swiss Post); CHF total, recipient display and mobile sheet are in scope;
the "Einrichtung unvollständig" nudge and German theme menu stay in part 3.

## Acceptance Criteria
- [ ] AC1 (header): the invoice page shows a top bar with the brand "Wartgeld Generator" / "Kanton Zug" (not a
  heading; the page has exactly one `h1`), links "Information" (→ `/info`) and "Einstellungen" (→ `/settings`)
  rendered as `Button asChild` + `Link` (no button inside a link), and the theme switch; below 768px the links are
  44×44 icon buttons with accessible names "Information" and "Einstellungen" and the "Kanton Zug" line is hidden
  (as in the phone mockup).
- [ ] AC2 (wording): page title `h1` "Neue Rechnung" with intro line (intro from 768px, as in the mockups); buttons "Rechnung generieren" and
  "Zurücksetzen"; the birth-date field is labelled "Geburtsdatum"; the address combobox has the accessible name
  "Adresse" (visible label bound via `htmlFor`; the hard-coded `aria-label` and sr-only label are removed),
  placeholder "Strasse und Hausnummer" and the help line "Tippen Sie Strasse und Nummer. PLZ und Ort übernehmen
  Sie aus der Liste der Post." referenced by `aria-describedby`.
- [ ] AC3 (privacy note): an accent note "Patientendaten bleiben in diesem Browser." says nothing is stored or
  sent except the entered address, which goes via the app's own address service to the Swiss Post for
  suggestions; "Mehr erfahren" links to `/info`. Compact one-line variant below 768px.
- [ ] AC4 (services + total): each service is a `<label>` row (min-height 64px) where clicking the text, the
  price or the checkbox toggles it exactly once; it shows "CHF 400.00", a checked row uses the selected surface
  and a primary border, keyboard focus shows a ring on the row. A total line (`data-testid="invoice-total"`)
  shows "CHF 0.00" (muted), "CHF 400.00" or "CHF 800.00" for the current ticks, in the services card (≥768px)
  and in the phone action bar. A unit test proves the page total equals the PDF's "Fr. N.-" total for all four
  tick combinations.
- [ ] AC5 (recipient): directly below "Zuständige Gemeinde", once a municipality is chosen, the page shows
  "Rechnung geht an" with the recipient title, completed with the municipality name when the title does not
  contain it (e.g. "Gemeindeverwaltung Menzingen"; "Einwohnergemeinde Baar" stays), plus "PLZ / Ort" of the
  address. Nothing is shown while no municipality is chosen; nothing focusable sits between the selector and the
  first service checkbox.
- [ ] AC6 (errors): after a failed submit (not while typing), a summary above the form reads "Bitte prüfen Sie
  1 Angabe" / "Bitte prüfen Sie N Angaben", receives focus, and lists "Feldname: Meldung" entries in field order;
  each entry is a button styled as a link that focuses its field without changing the URL (HashRouter) or
  losing input. `address`/`plz` errors show under the address field and link to it. Every field with an error
  shows the message below it with an icon, `aria-invalid` and `aria-describedby`. The toast "Ungültige
  Eingaben" still appears. No hard-coded `gray-*`, `red-*`, `blue-*`, `yellow-*` or `bg-white` colour
  utilities remain in Index, the form components or the StreetLookup parts.
- [ ] AC7 (address suggestions): popover surface; matched text stays a `<mark>`, restyled bold without yellow;
  active row on the accent surface; `role="listbox"` holds only options; a footer outside the listbox reads
  "Adressdaten: Schweizerische Post" and, from 768px, an `aria-hidden` hint "↑ ↓ auswählen · Enter übernehmen ·
  Esc schliessen". Escape closes an open list in every state (results, loading, no results) and does nothing
  special when the list is closed. Enter without a highlighted row still submits the form as today.
- [ ] AC8 (preview, ≥768px): before generating, the panel shows "Noch keine Rechnung" and an instruction;
  while generating, the main button shows a spinner and "Rechnung wird erstellt …" and is disabled, while
  "Zurücksetzen" stays available (it outdates the running generation; doubt review); afterwards the PDF appears with a "PDF bereit" badge, "Drucken" / "Speichern"
  beneath it, a line "An <Empfänger> · CHF …" and "Wird gespeichert als Vorname_Nachname.pdf". Filename, recipient and total
  next to the PDF are those of the generated invoice (snapshot taken at generation), not live form values. From 1024px form and a
  480px preview sit side by side and the preview is sticky.
- [ ] AC9 (phone, <768px): no preview panel and no iframe is mounted until a PDF is shown in the sheet; one
  submit button only, inside a fixed bottom bar with the total, 52px high, and the page has bottom padding so
  the last content is not covered. When generation succeeds and the viewport is a phone at that moment, a bottom
  sheet opens with "Rechnung bereit", the generated recipient and total, the PDF, "Drucken" and "Speichern"
  (visible without scrolling). It closes by close button, Escape or tapping outside; form values stay. While a
  PDF exists and the sheet is closed, a full-width "Rechnung anzeigen" button in the bar reopens it; at 320px and
  390px the bar fits the screen without sideways scrolling and covers no content. The sheet closes by
  itself when the PDF is cleared or the viewport grows to ≥768px. Toasts appear at the top below 768px.
- [ ] AC10 (fixed invoice date): when a fixed invoice date is set, the action row says "Rechnungsdatum fest
  eingestellt auf TT.MM.JJJJ · Ändern" with "Ändern" linking to `/settings`.
- [ ] AC11 (no functional change): `src/lib/pdfGenerator.ts`, `src/lib/pdf.ts` and `src/services/pdf/**` are
  unchanged; print and save code moves verbatim into `src/lib/pdfActions.ts` (unit test: download name
  `Anna_Muster.pdf`, no download without both names); existing PDF content assertions still pass; the existing
  unit and Playwright specs pass with only their selectors updated for the AC1/AC2/AC8 wording (one assertion added to
  the dark-theme spec for the shared `color-scheme` touch below)
  (`data-testid="invoice-form-card"` stays on the "Angaben" card); lint and build pass.

## Spec Impact
- **Classification:** modify
- **ADD:** none
- **MODIFY:** FR-01.05 (reset) — (E) line for the new label and the cleared summary. FR-01.01 (entry form) — (E) lines for the service total, the recipient display and the
  field-linked error summary. FR-01.02 (address suggestions) — (E) line for Escape closing the list.
  FR-01.04 (print and save) — (E) lines for the desktop preview states and the phone sheet.
  FR-01.08 — (E) line for the privacy note on the invoice page.
- **REMOVE:** none

## Known Limitations
- iOS Safari: save revokes the blob URL right after the click and print uses a hidden iframe; both moved
  verbatim (AC11) and may misbehave on iPhones. Follow-up change proposed (reuse SettingsTransfer's deferred revoke).
- PDF iframes show only page 1 on iOS and nothing on Android Chrome (existing); in the sheet "Speichern" stays
  above the fold as the fallback.
- When the form is edited during or after generating, the PDF carries the values from the moment of submit (as today); panel/sheet show those generated values while the live total may already differ.
- An invoice with no service ticked (CHF 0.00) can still be generated — unchanged validation, out of scope here (doubt review #5).
- A stalled first jsPDF load has no timeout; the busy state persists until reset, an address change or reload (reset stays enabled for that reason).
- iOS: the fixed bottom bar rides above the on-screen keyboard and can cover the focused field (not addressed).
- Toasts keep their part-1 look (no 32px icon circle yet); the date field keeps the native picker icon.

## Out of Scope
- Settings and Info page layouts, shared header on those pages, "Einrichtung unvollständig" nudge and the
  header's settings dot, German theme menu, dark flash before mount, `lang="de"` — part 3.
- "Valid" check icons inside fields (design nicety; adds per-field validity logic) — not now.
- `--check` contrast — pending design decision.
- The PDF layout itself.

## Design Notes
- Breakpoints: phone `<768` (`md`), two-column desktop `≥1024` (`lg`); 768–1023 is one column with the
  preview panel below the form and inline actions (no fixed bar, no sheet).
- Sheet state: `open = sheetRequested && !!pdfData && isPhone`; `sheetRequested` is set only in the success path
  after `window.matchMedia("(max-width: 767.98px)").matches` at that moment; `useIsPhone` initialises
  synchronously. A generation counter discards results that finish after a reset; `isGenerating` is cleared in
  `finally`.
- Snapshot: on success Index stores `{ pdfData, fileName, recipient, total }` together, so the panel and sheet
  always describe the PDF they show (no change to when the PDF is cleared).
- One submit button: the actions wrapper is `fixed inset-x-0 bottom-0 … md:static`; no ancestor of it carries a
  transform/filter. `viewport-fit=cover` is added so `env(safe-area-inset-bottom)` works for bar padding.
- Error summary is shown only after a submit attempt (`submitAttempted`), focused via a `tabIndex={-1}` heading.
- Radix Dialog: `SheetTitle` + `SheetDescription`, initial focus on the close button.
- Shared touches (minimal, affect all pages; found during build, recorded after spec review):
  `.dark { color-scheme: dark }` so native controls (date-picker icon, scrollbars) are legible in dark mode —
  replaces a custom calendar icon; Label `leading-none` → `leading-5` so wrapped labels do not overlap on phones
  (part-1 follow-up); `viewport-fit=cover` in `index.html` for the safe-area padding.
- Below 360px the service price moves under its label and the recipient wraps onto its own line.
- After a successful submit, and when an address is entered, stale problem messages are cleared.
- Print/save code moves unchanged from `FormActions` into `src/lib/pdfActions.ts`, used by the preview panel
  and the sheet.
- Total = 400 per ticked service, computed by a pure `invoiceTotal(values)`; formatted `CHF 400.00`
  (the PDF keeps its own formatting).
- Recipient comes from `getMunicipality(Number(gemeindeBfs))?.recipient.title`.
- Sheet: shadcn `Sheet` on `@radix-ui/react-dialog` (new dependency, MIT), `side="bottom"`, top radius 24,
  40×5 handle; `prefers-reduced-motion` → no slide.

## Affected Boundaries
n/a — no storage key, serialized format, env or API change. New npm dependency `@radix-ui/react-dialog`.

## Internal Plan Review
- **Ran:** yes (shipwright-plan:opus-plan-reviewer) — verdict approve-with-changes
- **Summary:** sound direction; HashRouter, duplicate submit button, address label override and several
  tests/ACs would have failed as written.
- **Findings:**
  1. high · summary `href="#id"` navigates HashRouter → fixed (buttons focusing the field; e2e asserts URL/input kept)
  2. high · two submit buttons via CSS → fixed (one responsive button)
  3. high · `aria-label` override blocks "Adresse" label → fixed (removed; AC2 via `htmlFor`)
  4. medium · address/plz errors have no field → fixed (AC6)
  5. medium · ambiguous duplicate messages, singular → fixed ("Feldname: Meldung", 1 Angabe)
  6. medium · summary popping up while typing → fixed (`submitAttempted`, focus on failed submit)
  7. medium · tests outside AC2 break (testid, placeholder text, heading) → fixed (AC11 wording, testid kept, single h1)
  8. medium · hidden iframe on phones → fixed (panel PDF not mounted on phones)
  9. medium · stale sheet state, reset during generation → fixed (derived `open`, counter, disabled reset)
  10. medium · toast breakpoint 640 vs 768 → fixed (`md:`)
  11. medium · Escape after early return → fixed (handled first, 3 unit cases)
  12. medium · footer inside listbox → fixed
  13. medium · `<mark>` test, ambiguous totals → fixed (keep mark, `data-testid`)
  14. medium · "Gemeindeverwaltung" uninformative; placement → fixed (title + name, below selector)
  15. medium · busy state flaky in e2e → fixed (unit test with deferred promise)
  16. medium · byte-identical PDF impossible literally → fixed (AC11: PDF files unchanged + content assertions)
  17. low · fixed bar clearance / safe area / transforms → fixed (padding, `viewport-fit=cover`); iOS keyboard overlap disclosed
  18. low · Radix title/description/focus → fixed
  19. low · label row double toggle → fixed (e2e toggles once per click target, focus ring)
  20. low · button inside link → fixed (`asChild`)
  21. low · `useIsPhone` first frame, jsdom mock → fixed
  22. low · "Strasse" vs postcode sent → fixed ("eingegebene Adresse")
  23. low · sizes/scope → confirmed
- **Status:** 22 fixed, 1 confirmed

## Internal Architecture Review
- **Ran:** yes (shipwright-plan:architecture-internal-reviewer) — verdict build-with-changes, prefers A
- **Findings:**
  1. medium · displayed total/recipient can contradict a kept PDF → fixed (snapshot at generation, AC8/AC9)
  2. medium · total computed twice → fixed (agreement test page ↔ PDF; PDF code left untouched per AC11)
  3. medium · iOS save/print fragile → disclosed (Known Limitations, follow-up proposed)
  4. low · iframe PDF on iOS → disclosed
  5. low · privacy note vs Bunny hop → accepted (note names the own address service; Info page covers Bunny, part 3 keeps it)
  6. low · PDF unreachable after closing/rotating → fixed ("Rechnung anzeigen" reopen, auto-close on ≥768)
  7–8. low · header fine; no injected instructions → confirmed
- **Status:** 3 fixed, 1 accepted, 2 disclosed, 2 confirmed

## Architecture Review
- **Brief:** `.shipwright/planning/iterate/iterate-2026-10-22-redesign-invoice-page/architecture_brief.md`
- **Verdicts:** glm=unavailable (package missing) · openai=approve (option A)
- **Smallest thing that would do:** keep form and PDF pipeline, derive total and recipient, phone sheet on Radix.
- **Findings:** none.
- **External iterate review (openai=revise):** snapshot of generated values → fixed; PDF byte comparison →
  restated (AC11, PDF code untouched); toast breakpoint → fixed; check `matchMedia` at success, close sheet when
  leaving phone width → fixed.

## Confidence Calibration
- **Overall: high** for behaviour parity and the new layout; **medium** for real-device phone behaviour.
- Evidence: 307 unit tests (generation counter races, sheet open/close/focus/resize, validation summary), Playwright 18/18 on dev and on the built site (desktop 1440, phone 390 and 320), lint/typecheck/build clean.
- Reviews: spec PASS (round 2), code PASS (9 findings fixed), external codex revise → 3 fixed, doubt 0 high/0 medium/5 low → 3 fixed, 2 recorded as limitations.
- Residual risk: iOS Safari keyboard vs fixed bar and PDF iframe/print on iOS/Android are not covered by automated tests (Known Limitations); to be checked by hand on a phone before deploy after part 3.

## Verification (medium+)
- **Surface:** web
- **Runner command:** `npx playwright test`
- **Evidence path:** `test-results/e2e-results.json`
