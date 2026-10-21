# Mini-Plan: zug-municipality-data

- **Run ID:** iterate-2026-10-21-zug-municipality-data
- **Spec:** `.shipwright/planning/iterate/2026-10-21-zug-municipality-data.md`

## Files

| File | Change |
|---|---|
| `scripts/municipality-data/build-localities.mjs` | new, manual tool (never run in build/CI) — reads the swisstopo AMTOVZ CSV, checks the header, keeps every locality that has at least one ZG row, writes the generated module with JSON.stringify'd values and a header (source URL, date, SHA-256, regeneration command) |
| `scripts/municipality-data/supabase-export-2026-10-21.json` | new — raw export of `administration_addresses` (public data), source of truth for AC13 |
| `src/data/zugLocalities.generated.ts` | new (generated, committed) — `{ postcode, locality, main, municipalities: [{ bfs, share }], outsideShare }[]`; municipalities sorted share desc, BFS asc |
| `src/data/municipalities.ts` | new — the 11 Zug municipalities (BFS number, name, invoice recipient: title, department?, address, city), copied from the Supabase export |
| `src/lib/municipality.ts` | new — `proposeMunicipality(postcode, town)` → `{ known, proposed, candidates, sharedHint, outsideHint }`, `getMunicipality(bfs)`, `UnknownMunicipalityError` |
| `src/lib/administrationData.ts` | delete (Supabase lookup + `UnknownPlzError`) |
| `src/types/form.ts` | add `gemeindeBfs: string` |
| `src/pages/Index.tsx` | address change: postcode undefined → clear postcode/town/municipality; postcode/town changed → new proposal; unchanged → keep the choice. German toast for `UnknownMunicipalityError` |
| `src/features/form/components/DateAndMunicipalityFields.tsx` | add `Zuständige Gemeinde` select + ambiguity hint |
| `src/features/form/components/FormContainer.tsx` | pass municipality props |
| `src/services/form/formValidationService.ts` | require `gemeindeBfs` ∈ the 11 BFS numbers; block postcodes without Zug locality |
| `CLAUDE.md` | WHAT/backend lines: municipality data ships with the app |
| `src/services/pdf/pdfGenerationService.ts` | synchronous recipient lookup by BFS number |
| `src/lib/pdfGenerator.ts` | take `MunicipalityRecipient` instead of the Supabase row type |
| `e2e/municipality.spec.ts`, `playwright.config.ts` | new — browser test, address-lookup call stubbed |
| `package.json`, lockfile | `@playwright/test` devDependency, `test:e2e` script; vitest excludes `e2e/` |
| `.shipwright/planning/01-adopted/spec.md`, `.shipwright/adopt/derived-catalogue.json` | FR-01.01/01.03 text + ACs; Basis → `interview` for all 12; provenance banner updated |

## Work breakdown

1. **Data generator + data** — test first: generated module contains 6319
   Allenwinden → Baar (1701) 100 %, 6314 Neuägeri → four municipalities with
   Unterägeri first; every BFS number has a recipient in `municipalities.ts`;
   exactly 11 municipalities.
2. **`proposeMunicipality`** — normalise town names (NFC, trim,
   case-insensitive). Exact locality match → its municipalities; no match →
   union of all localities of the postcode (main locality first, no summing),
   shared hint and no pre-selection if > 1. Pre-select only when the top
   share ≥ 80 % of a matched locality. Shared hint
   when ≥ 2 Zug municipalities hold ≥ 5 %; outside hint when `outsideShare` ≥
   5 %. Unknown postcode → `known: false`. One `normalizeTown` helper is used
   here and by `Index` change detection (NFD test). Pre-select + shared hint
   together pinned with an injected 85/10/5 locality. Tests: Allenwinden, Neuägeri, Zug
   6300, Bennau, town-spelling mismatch, tie order (Baar/Zug 11.009 %), 8000.
3. **Form state + validation** — tests: pick → proposal; pick Neuägeri,
   choose Menzingen, type house number → still Menzingen; pick a different
   address → new proposal; free typing → postcode/town/municipality cleared and
   submit blocked; 8000 → `Diese PLZ liegt nicht im Kanton Zug`; reset clears.
4. **Select UI** — tests (RTL): proposed value shown; hint only when ambiguous;
   changing the selection updates the form.
5. **PDF path** — tests: recipient lines for all 11 equal the export (AC13);
   Menzingen case; Supabase client never called; unknown BFS → typed error.
6. **Remove** `administrationData.ts`; Supabase client stays only for address
   suggestions (removed in step 2).
7. **Spec + catalogue** — FR edits, Basis → interview, resolve triage card.
8. **E2E** — Playwright: pick a stubbed Neuägeri suggestion, see the hint,
   switch to Menzingen, generate, assert the preview shows the PDF and the
   PDF text contains `6313 Menzingen`; assert no request leaves the origin
   except the stubbed address lookup.

## Data model

No database change. Supabase tables stay untouched until step 2/3 cut-over
(they keep serving the live Netlify site).

## Test strategy

Vitest unit/RTL for steps 1–5, Playwright for the journey. Full suite + lint +
typecheck at F0.

## Alternative approach (rejected)

- **Exact per-building lookup** via the federal building register
  (api3.geo.admin.ch) — always correct, but sends street + number to one more
  service and adds a runtime dependency; the product owner chose
  propose-and-correct.
- **Hand-maintained postcode table** (as today) — simpler but repeats the
  drift that broke 6319 Allenwinden; the generated official snapshot is
  reproducible and testable.
