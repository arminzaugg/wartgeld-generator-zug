# Mini-Plan: redesign-invoice-page (part 2 — invoice page)

- **Run ID:** iterate-2026-10-22-redesign-invoice-page
- **Spec:** `.shipwright/planning/iterate/2026-10-22-redesign-invoice-page.md`

## 1. Files

| File | Change |
|---|---|
| `package.json` / lock | add `@radix-ui/react-dialog` (^1.3.1 installed, MIT) |
| `src/components/ui/sheet.tsx` | new — shadcn Sheet (bottom side only needed), scrim `bg-scrim`, `rounded-t-2xl`, handle, reduced-motion safe |
| `src/components/ui/badge.tsx` | new — `h-7 px-3 rounded-full bg-accent text-accent-foreground text-[13px] font-semibold` |
| `src/components/ui/toast.tsx` | viewport `sm:` → `md:` (top below 768); 32px icon circle |
| `index.html` | viewport meta gains `viewport-fit=cover` (safe-area padding for the phone bar) |
| `src/lib/invoiceTotal.ts` | new — `invoiceTotal(values)` (400 per ticked service), `formatChf(n)` → `CHF 400.00` |
| `src/lib/pdfActions.ts` | new — `printPdf(dataUri)`, `downloadPdf(dataUri, filename)`, `pdfFileName(values)`: code moved verbatim from `FormActions` |
| `src/hooks/useIsPhone.ts` | new — `matchMedia("(max-width: 767px)")` with change listener |
| `src/components/AppHeader.tsx` | new — brand block, Information / Einstellungen links (text ≥768, icon buttons below), ThemeToggle |
| `src/components/PrivacyNote.tsx` | new — accent Alert with ShieldCheck, route-accurate text, "Mehr erfahren" → `/info` (compact variant on phones) |
| `src/components/PreviewPanel.tsx` | new — "Vorschau" heading + badge; empty / generating skeleton / PDF states; Drucken / Speichern; filename line |
| `src/components/PdfSheet.tsx` | new — phone sheet: title "Rechnung bereit", recipient · total, `PDFPreview`, Drucken / Speichern, close |
| `src/components/PDFPreview.tsx` | white paper with `shadow-paper`, height from parent (panel 620px, sheet flex) |
| `src/pages/Index.tsx` | new layout; `isGenerating` + generation counter; success stores snapshot `{pdfData, fileName, recipient, total}`; `sheetRequested` set after `matchMedia` check, `open` derived; ≤150 LOC |
| `src/features/form/components/FormContainer.tsx` | error summary at top; two cards "Angaben" / "Dienstleistungen"; passes errors to fields; `isSubmitting` from props |
| `src/features/form/components/ErrorSummary.tsx` | new — replaces `FormValidationDisplay` + `components/FormValidation.tsx` (deleted): shown after submit attempt, focused heading, singular/plural, "Feldname: Meldung" in field order, link-styled buttons focusing the field (`address`/`plz` → `address-input`) |
| `src/features/form/components/PersonalInfoFields.tsx` | `aria-invalid`, `aria-describedby`, shared `FieldError` (icon + destructive text) |
| `src/features/form/components/FieldError.tsx` | new — small inline error line |
| `src/features/form/components/AddressFields.tsx` | no inner grey card; `<Label htmlFor="address-input">Adresse</Label>`; help line; receives `errors` (address/plz) |
| `src/features/form/components/RecipientSummary.tsx` | new — below the municipality select; "PLZ / Ort" + Landmark "Rechnung geht an <title (+ name)>" + "Kanton Zug" badge; `recipientLabel()` helper; nothing focusable |
| `src/features/form/components/DateAndMunicipalityFields.tsx` | label "Geburtsdatum", Calendar icon, `FieldError`; `text-red-500` → tokens |
| `src/features/form/components/ServiceSelectionFields.tsx` | rows as `<label>` (whole row toggles), CHF 400.00, selected style; total line (≥768) |
| `src/features/form/components/FormActions.tsx` | desktop row: fixed-date note + Ändern, Zurücksetzen (ghost, RotateCcw), primary with busy state; phone: fixed bottom bar (total + 52px button), Zurücksetzen stays in flow above it; print/save buttons leave this file |
| `src/components/StreetLookup/StreetInput.tsx` | remove sr-only label and hard-coded `aria-label`; `aria-describedby` help/error; tokens instead of greys |
| `src/components/StreetLookup/SuggestionsList.tsx` | popover surface, MapPin rows, accent active row; `role=listbox` on the `<ul>`; footer outside it, hint `aria-hidden` |
| `src/components/StreetLookup/highlightMatches.tsx` | keep `<mark>`, restyle `bg-transparent font-semibold text-foreground` |
| `src/components/StreetLookup.tsx` | Escape handled before the early return; placeholder "Strasse und Hausnummer"; `describedBy` prop |
| tests | see §5 |
| `.shipwright/planning/01-adopted/spec.md` | (E) lines for FR-01.01, 01.02, 01.04, 01.08 |

Plan-review deltas: one submit button (responsive wrapper); PreviewPanel does not mount its PDF on phones;
"Rechnung anzeigen" reopen button in the phone bar; Zurücksetzen disabled while generating; busy state tested
in unit tests with a deferred promise; PDF code untouched (agreement test page total ↔ PDF total instead).

## 2. Work breakdown

1. **Tests first:** unit tests for `invoiceTotal`/`formatChf`, `pdfFileName`, ErrorSummary focus links, ServiceSelection row toggle + total, RecipientSummary, Escape in StreetLookup, Index wording; e2e `e2e/invoice-page.spec.ts` (desktop + phone viewport). Update text selectors in existing specs for AC2. All new ones fail.
2. **Pure helpers + moved print/save code** (`invoiceTotal`, `pdfActions`).
3. **Primitives:** Sheet, Badge; `@radix-ui/react-dialog` install.
4. **Form components:** fields, error summary, service rows, recipient, actions; remove hard-coded colours.
5. **Page:** AppHeader, PrivacyNote, PreviewPanel, PdfSheet, Index layout.
6. **Verify:** full unit + Playwright (dev + built preview), lint, build; screenshots light/dark × desktop/phone against the design states; PDF bytes unchanged (existing municipality e2e reads the PDF).
7. Spec update and finalization.

## 3. Component hierarchy

```
Index
├─ AppHeader (ThemeToggle)
├─ h1 "Neue Rechnung" + intro
├─ PrivacyNote
├─ FormContainer (form)
│  ├─ ErrorSummary
│  ├─ Card "Angaben": PersonalInfoFields · AddressFields(StreetLookup, RecipientSummary) · DateAndMunicipalityFields
│  ├─ Card "Dienstleistungen": ServiceSelectionFields (+ total)
│  └─ FormActions (desktop row | phone fixed bar)
├─ PreviewPanel (≥768): PDFPreview · Drucken/Speichern
└─ PdfSheet (<768): PDFPreview · Drucken/Speichern
```

## 4. Data model
None. `isGenerating` moves from FormContainer to Index (one boolean) so the preview panel can show the
skeleton; FormContainer still calls `onSubmit` only with valid values.

## 5. Test strategy
- Unit (Vitest + Testing Library): helpers; components render and behave (row click toggles, total text,
  recipient title for a BFS, summary link focuses field, Escape closes suggestions); Index shows new wording
  and the privacy link.
- E2E (Playwright, Chromium): desktop 1440 — side-by-side layout, sticky preview, empty → busy → ready badge,
  Drucken/Speichern present, download filename `Anna_Muster.pdf`; phone 390×844 — no iframe before generating,
  fixed bar visible and not covering the last field (scroll to bottom), sheet opens with PDF, closes on Escape,
  values kept; error summary links focus fields; no external requests (existing guard).
- Existing municipality spec asserts PDF contents → AC11 "PDF unchanged".
- Performance (touches_build): bundle size delta of `@radix-ui/react-dialog` (expected < 10 KB gzip).

## 6. Alternative considered
**Keep the embedded preview on phones (stacked under the form) instead of a sheet.** No new dependency and
less code, but the PDF iframe is barely usable at 390px and pushes print/save far down; the user put the
sheet in scope. **Rejected.**

**Hand-rolled sheet without Radix Dialog.** Saves one dependency but re-implements focus trap, Escape,
scroll lock and aria-modal. **Rejected** — Radix is already the primitive family used here.
