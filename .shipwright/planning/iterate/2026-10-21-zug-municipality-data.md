# Iterate Spec: zug-municipality-data

- **Run ID:** iterate-2026-10-21-zug-municipality-data
- **Type:** feature
- **Complexity:** medium
- **Status:** implemented

Step 1 of 3 of the hosting migration (Netlify + Supabase → Bunny + Swiss Post
APIM). Steps 2 (Post APIM proxy as Bunny edge script, Supabase removed) and 3
(Bunny deployment) are separate iterates.

## Goal

The municipality that receives the invoice is decided in the browser from
reference data shipped with the app, not from the Supabase database. Because
the official Swiss postcode list shows that one postcode/locality can belong to
several municipalities, the form proposes the most likely municipality and lets
the midwife change it, instead of silently picking one.

## Acceptance Criteria

Proposal rules (from the official locality snapshot, shares = % of a
locality's addresses, incl. the part outside canton Zug):
pre-select the top municipality only when it holds ≥ 80 % of the locality;
hint `mehrere Gemeinden` when ≥ 2 Zug municipalities hold ≥ 5 % each (or the
town does not match a locality and the postcode spans several); hint
`ausserhalb des Kantons Zug` when ≥ 5 % of the locality lies outside Zug.
When the town matches no locality, the postcode's localities are combined:
no pre-selection if they name more than one municipality (shares are never
applied across localities); the outside hint shows if any of them is ≥ 5 %
outside Zug. Postcode/town are compared with one shared normalisation (NFC,
trim, case-insensitive) for both the proposal and change detection.

- [x] AC1 — Address in 6319 Allenwinden → `Zuständige Gemeinde` = `Baar`, no
  hint; the invoice is addressed to `Einwohnergemeinde Baar` (today: error).
- [x] AC2 — Address in 6314 Neuägeri → field empty, candidates Unterägeri,
  Menzingen, Baar, Zug listed first, hint `Diese Ortschaft gehört zu mehreren
  Gemeinden. Bitte wählen Sie die zuständige Gemeinde.`; after selecting
  `Menzingen` the invoice is addressed to `Gemeindeverwaltung` / `Soziales und
  Gesundheit` / `Postfach` / `6313 Menzingen`.
- [x] AC3 — Address in 6300 Zug → `Zug`, no hint.
- [x] AC4 — Submitting without a municipality shows `Bitte wählen Sie die
  zuständige Gemeinde` and produces no invoice.
- [x] AC5 — Generating an invoice sends no request to Supabase or any other
  host than the app's own origin.
- [x] AC6 — Every Zug locality in the bundled snapshot maps only to Zug
  municipalities that have an invoice recipient; exactly 11 recipients.
- [x] AC7 — `Formular Zurücksetzen` clears the selected municipality.
- [x] AC8 — All 12 adopted requirements are recorded as confirmed by the
  product owner (Basis `interview`), the derived catalogue shows 12 confirmed,
  the triage follow-up `adopt-derived-catalogue-confirmation` is resolved.
- [x] AC9 — A municipality chosen by hand survives edits that keep the same
  postcode and town (e.g. typing the house number); picking an address with a
  different postcode or town replaces it with the new proposal.
- [x] AC10 — Typing over a picked address (no suggestion chosen) clears
  postcode, town and municipality, so submitting is blocked until an address
  is picked again.
- [x] AC11 — A postcode with no Zug locality (e.g. 8000 Zürich) shows `Diese
  PLZ liegt nicht im Kanton Zug` and produces no invoice.
- [x] AC12 — An address in 8836 Bennau → no pre-selection, hint `Diese
  Ortschaft liegt teilweise ausserhalb des Kantons Zug …`.
- [x] AC13 — The recipient lines for all 11 municipalities equal the Supabase
  export of 2026-10-21 (no change for the municipalities that worked before).

## Spec Impact

- **Classification:** modify
- **ADD:** none
- **MODIFY:** FR-01.01 — the form gains the required `Zuständige Gemeinde` choice
  (proposed from the address, changeable; non-Zug postcodes blocked). FR-01.03 — the recipient
  is the chosen municipality, looked up from data shipped with the app.
  FR-01.01..FR-01.12 — Basis `code`/`assumed` → `interview` (confirmed by the
  product owner on 2026-10-21).
- **REMOVE:** none

## Out of Scope

- Address suggestions keep using the existing Supabase edge function (step 2).
  Zug addresses with non-Zug postcodes (5642 Mühlau, 6417 Sattel, 6418
  Rothenthurm, 8836 Bennau) are already in the data, but suggestions for them
  arrive only once step 2 filters by canton.
- Exact per-building municipality lookup (federal building register) — rejected
  by the product owner in favour of propose-and-correct.
- Removing `@supabase/supabase-js`, hosting, deployment, privacy text (steps 2–3).
  The Info page already overstates what leaves the browser after this step
  (less data, not more); it is rewritten in step 2.
- Styling/design work (deferred by the product owner).

## Design Notes

- New select `Zuständige Gemeinde` in `DateAndMunicipalityFields` (the
  component already carries the name), below the date of birth. Native
  `<select>` styled like the existing `Input` (no new UI dependency). Lists the
  candidate municipalities of the chosen locality first, then the other Zug
  municipalities. Hint text in the muted style used elsewhere; error text in
  the existing red style.

## Affected Boundaries

| Producer (writes) | Consumer (reads) | Format |
|---|---|---|
| `scripts/municipality-data/build-localities.mjs` | `src/data/zugLocalities.generated.ts` → `src/lib/municipality.ts` | generated TS module from swisstopo AMTOVZ CSV (`;`-separated, UTF-8 BOM) |
| `Index.handleAddressChange` (postcode + town from the suggestion) | `proposeMunicipality()` | in-memory strings; town spelling from Swiss Post vs official locality name |

## Internal Plan Review (opus-plan-reviewer)
- **Ran:** yes
- **Severity:** high
- **Summary:** Direction sound; gaps in how the municipality interacts with the address field, the out-of-canton share, and an untestable AC5.
- **Findings:**
  - completeness/high — manual choice overwritten by house-number edits → fixed (AC9, re-propose only on postcode/town change).
  - completeness/high — stale municipality after free typing → fixed (AC10, undefined postcode clears postcode/town/municipality).
  - completeness/high — Bennau/Rothenthurm rule vs ZG-only filter → fixed (snapshot keeps outside-canton share; AC12).
  - completeness/medium — non-Zug postcodes no longer blocked → fixed (AC11).
  - completeness/medium — AC5 untestable (jsPDF chunk) → fixed (reworded to non-origin hosts).
  - completeness/medium — AC1 unreachable in prod → declined: 6319 is already in `canton_zip_codes`, so suggestions exist today.
  - architecture/medium — first-share pre-select is a coin flip for split localities → fixed (pre-select only at ≥ 80 %).
  - architecture/medium — summing shares across localities is wrong → fixed (fallback lists the union, no ranking by sums).
  - architecture/low — tie ordering → fixed (share desc, then BFS asc).
  - completeness/medium — recipient data unverifiable → fixed (export committed, AC13 field-for-field test).
  - architecture/low — snapshot provenance → fixed (URL, date, SHA-256 in header, header check); up-to-date check in CI disclosed.
  - architecture/low — derived state → fixed (only `gemeindeBfs` is state; membership validated).
  - completeness/low — failure mode of recipient lookup → fixed (typed error + German toast).
  - completeness/low — stale docs → fixed for FR-01.01 + CLAUDE.md; Info page in step 2.
- **Known limitations:** no automated check that the snapshot matches the latest federal CSV (manual regeneration).
- **Status:** 12 fixed, 1 disclosed, 1 declined

## Internal Architecture Review (architecture-internal-reviewer)
- **Ran:** yes
- **Severity:** medium
- **Summary:** Approve option A; close gaps on stale choice, town-name mismatch and non-Zug postcodes; keep the generator a manual tool.
- **Findings:**
  - necessity/low — justified → accepted.
  - smallest-option/medium — generator is a manual one-off, never in build/CI → fixed.
  - completeness/medium — stale choice on address change → fixed (AC9/AC10).
  - completeness/medium — town-name mismatch rule → fixed (postcode union fallback + hint).
  - completeness/medium — non-Zug postcodes → fixed (AC11).
  - completeness/low — keep hint visible; repeat municipality near generate → hint is derived and stays visible: fixed; repeat near button declined (the PDF preview already shows the recipient).
  - security/low — escape generated values → fixed (JSON.stringify).
  - complexity-cost/low — provenance header, delete old lookup now: fixed; move AC8 to its own change: declined (product owner asked to record it with this change).
- **Known limitations:** none
- **Status:** 6 fixed, 2 declined

## External Plan Review (glm + openai via codex)
- **Verdicts:** glm=revise · openai=revise
- **Findings:**
  - openai/high — postcode fallback applied locality shares to the union → fixed (no pre-selection when the union has > 1 municipality; outside hint if any locality ≥ 5 % outside; test with a town spelling that matches no locality).
  - openai/medium + glm/low — E2E network assertion window → fixed (observe only from after the address pick through the rendered invoice, stub included).
  - glm/high — CSV might lack address shares → declined: verified, `Adressenanteil` is a column of AMTOVZ_CSV_LV95 (e.g. 6314 Neuägeri 49.541 / 28.44 / 11.009 / 11.009).
  - glm/medium — import graph before deleting `administrationData.ts` → fixed: consumers are `Index.tsx`, `pdfGenerationService.ts`, `pdfGenerator.ts` (type) and one test; all change in this iterate.
  - glm/medium — same normalisation for change detection → fixed (shared `normalizeTown`, NFD test).
  - glm/low — pre-select + shared hint together → fixed (unit test on an injected 85/10/5 locality).

## Architecture Review
- **Brief:** `.shipwright/planning/iterate/iterate-2026-10-21-zug-municipality-data/architecture_brief.md`
- **Verdicts:** glm=approve · openai=approve
- **Smallest thing that would do (per reviewers):** as proposed (bundled snapshot + recipients, manual regeneration, required select).
- **Findings:** glm/low — make the snapshot's age visible → fixed (generated header carries date + SHA-256). openai — no findings; notes that data updates need an app release (accepted).
- **Reconciliation:** the plan had rejected the building-register lookup (extra service/data flow, product-owner choice) and the hand-maintained table (drift); both reviewers independently reached the same conclusion.

## Confidence Calibration

- **Boundaries touched:** swisstopo AMTOVZ CSV → `build-localities.mjs` → `zugLocalities.generated.ts` → `proposeMunicipality`; Swiss Post town names (via `StreetLookup.onChange`) → `applyAddressChange` / `normalizeTown`.
- **Empirical probes run:**
  - Generator run on the real CSV (SHA-256 ae33ad60…): 29 localities; data tests assert Allenwinden, Neuägeri order, Bennau outside share → match the CSV rows read by hand.
  - Live Swiss Post APIM autocomplete for 6314/6319/6343/6340/6315/8836: town names equal the official locality names (incl. `Holzhäusern ZG`); finding: Post reports 8836 Bennau as canton `SZ` → step 2 must not filter by Post's canton alone (noted for step 2).
  - Browser run (Playwright, real Vite dev server): Neuägeri → empty + hint → Menzingen → PDF contains `(6313 Menzingen)`; zero off-origin requests while generating.
- **Test Completeness Ledger:**

  | # | Testable behavior | Disposition | Evidence / reason_code |
  |---|---|---|---|
  | 1 | Allenwinden proposes Baar (AC1) | tested | municipality.test.ts::pre-selects Baar…; e2e::proposes Baar for an Allenwinden address PASSED |
  | 2 | Neuägeri empty + candidates + hint; Menzingen invoice (AC2) | tested | municipality.test.ts::leaves 6314 Neuägeri unselected…; DateAndMunicipalityFields.test.tsx::lists the locality's…; e2e::a Neuägeri invoice… PASSED |
  | 3 | 6300 Zug proposes Zug, no hint (AC3) | tested | municipality.test.ts::pre-selects Zug…; DateAndMunicipalityFields.test.tsx::shows the proposed… PASSED |
  | 4 | Submit blocked without municipality (AC4) | tested | formValidationService.test.ts::requires a municipality…; FormContainer.test.tsx::does not submit until… PASSED |
  | 5 | No request to Supabase/off-origin while generating (AC5) | tested | pdfGenerationService.test.ts::generates the invoice without contacting…; e2e external==[] PASSED |
  | 6 | Every locality maps to a recipient; 11 recipients (AC6) | tested | zugMunicipalityData.test.ts (2 cases) PASSED |
  | 7 | Reset clears municipality (AC7) | tested | e2e::a Neuägeri invoice… (reset step) PASSED |
  | 8 | Requirements recorded as confirmed (AC8) | untestable | requires-manual-visual-judgment |
  | 9 | Hand-picked municipality survives same-locality edits; replaced on new locality (AC9) | tested | addressChange.test.ts (2 cases, incl. NFD town) PASSED |
  | 10 | Typed-over address clears postcode/town/municipality (AC10) | tested | addressChange.test.ts::clears postcode…; StreetLookup.test.tsx::clears postcode and town when a different address… / …a longer street name… PASSED |
  | 11 | Non-Zug postcode blocked (AC11) | tested | formValidationService.test.ts::rejects a postcode outside…; DateAndMunicipalityFields.test.tsx::is disabled and explains… PASSED |
  | 12 | Bennau: no pre-selection + outside hint (AC12) | tested | municipality.test.ts::leaves 8836 Bennau…; DateAndMunicipalityFields.test.tsx::warns for 8836 Bennau… PASSED |
  | 13 | Recipient lines equal the export for all 11 (AC13) | tested | zugMunicipalityData.test.ts::prints the same recipient lines…; pdfGenerationService.test.ts::addresses the invoice for $municipality (11 cases) PASSED |
  | 14 | Town fallback combines localities without pre-selecting | tested | municipality.test.ts::combines all localities… PASSED |
  | 15 | Pre-select + shared hint together | tested | municipality.test.ts::pre-selects and still shows… PASSED |
  | 16 | Unknown BFS → typed error | tested | pdfGenerationService.test.ts::refuses to generate… PASSED |
  | 17 | Postcode with surrounding spaces treated like the trimmed one | tested | municipality.test.ts::ignores spaces around the postcode; addressChange.test.ts::keeps a hand-picked municipality when the postcode differs only by spaces PASSED |
  | 18 | House-number edits on the picked street reach the form | tested | StreetLookup.test.tsx::keeps postcode and town when the picked street is typed with a house number / passes a changed house number on to the form PASSED |
  | 19 | Clicked single-building suggestion keeps its own house number | tested | StreetLookup.test.tsx::uses the house number of the clicked suggestion… PASSED |
  | 20 | Address errors disappear after a new address | tested | FormContainer.test.tsx::drops the municipality error once a different address is picked PASSED |
  | 21 | Correcting the municipality discards the generated invoice | tested | e2e::a Neuägeri invoice… (re-select step: preview removed) PASSED |

- **Confidence-pattern check:** depth — the live Post probe produced one new finding (Bennau = SZ), which affects step 2, not this change; no further probe needed here. Breadth — 21 behaviours, 20 tested, 1 untestable with reason, 0 untested-testable (rows 17–21 added from external, code and doubt review).

## Verification (medium+)

- **Surface:** web
- **Runner command:** `npx playwright test e2e/municipality.spec.ts` (Vite dev
  server started by Playwright `webServer`; the address-lookup call is stubbed
  with `page.route`, so no Supabase/Post traffic)
- **Evidence path:** `.shipwright/runs/iterate-2026-10-21-zug-municipality-data/surface_verification.json`

## Code Review (Step 8)

- **Spec reviewer:** REJECT on AC10 (typing over a pick kept postcode/town) → fixed in `StreetLookup` + RTL test → PASS.
- **External (GLM approve, GPT revise):** postcode not trimmed → fixed; triage resolution "missing" → was in the tree, now in the review diff; GLM lows declined (kept choice is always one of the 11; NaN message never user-facing).
- **Code reviewer:** PASS, 7 low → 6 fixed (stale errors, stronger keep test, exact street compare, `cn`/`aria-invalid`, FR tag, ternary); Playwright-in-CI deferred to a triage card (needs CI supply-chain ack).
- **Doubt reviewer:** 2 medium fixed (house-number edits now reach the invoice; a clicked single-building suggestion keeps its number), 1 low fixed (correcting the municipality or address discards the generated PDF), 2 low accepted/deferred (sub-5 % minority municipalities get no hint by the agreed rule; out-of-canton localities → step-2 triage card trg-9e70266a).
