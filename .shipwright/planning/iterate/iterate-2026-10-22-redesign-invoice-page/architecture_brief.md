# Architecture Brief: redesign-invoice-page (part 2 — invoice page)

## The problem
The invoice page still has the old stacked layout: generic header, all fields in one card, a list of
error messages at the bottom, print/save buttons under the form, and a PDF iframe that on phones sits far
below the form and is barely usable. Part 1 introduced the new visual system; the invoice page now needs the
designed layout so midwives see what they are billing (total, recipient) and can finish on a phone.

## What already exists here
- React page `src/pages/Index.tsx` with a form (`src/features/form/components/*`), validation service,
  address lookup (`StreetLookup`), municipality proposal in the browser, client-side PDF generation (jsPDF),
  print via hidden iframe and save via a blob link.
- shadcn/Radix primitives (button, card, alert, toast, tooltip, dropdown-menu, checkbox, scroll-area) styled
  with the Papier & Tanne tokens from part 1.
- Municipality data with recipient titles shipped in `src/data/municipalities.ts`.

## What would newly, permanently exist
- A phone-only bottom sheet for the finished PDF (new dependency `@radix-ui/react-dialog`).
- Displayed derived information: the CHF total and the recipient municipality title, which must keep
  matching what the PDF says.
- A shared app header component (used on the invoice page now, on the other pages in part 3).
- A privacy note on the invoice page whose wording must stay true to the actual data flow.

## Options on the table
- **A:** implement the designed layout including the phone bottom sheet (Radix Dialog).
- **B:** designed layout, but on phones keep the embedded PDF stacked under the form (no sheet, no new dependency).
- **C:** restyle the existing layout only (no total, no recipient display, no sheet).

## Constraints that are not negotiable
- No functional change: validation, address lookup, PDF bytes, print and save behaviour stay identical.
- Privacy statements must be true: only the typed address leaves the browser (via the app's own lookup service).
- German only; the user chose the design wording and the total, recipient display and sheet (2026-10-22).
