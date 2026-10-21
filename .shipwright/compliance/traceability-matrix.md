# Requirements Traceability Matrix

Generated: (no events)
Source-State: run=(unknown) base=49c0ddaa837e
Consistency-audit: never run

## Requirements Coverage

| Requirement | Title | Priority | Verified By | Tests | Last tested | Reconciled? | Status | Unit | Integration | E2E |
|-------------|-------|----------|-------------|-------|-------------|-------------|--------|------|-------------|-----|
| [FR-01.01](../../.shipwright/planning/01-adopted/spec.md#fr-0101)<a id="rtm-fr-0101"></a> | The midwife enters the mother's first and last name, home address, date of birth, and which reimbursable services were provided. Missing or too-short entries are flagged before an invoice can be produced, and the address must be chosen from the suggestion list so that the postcode is known. | Must | — | — | — | — | NOT VERIFIED | MISSING | — | MISSING |
| [FR-01.02](../../.shipwright/planning/01-adopted/spec.md#fr-0102)<a id="rtm-fr-0102"></a> | While the midwife types a street, matching addresses are suggested, limited to postcodes in the Canton of Zug and ranked so the closest street-name matches come first. Choosing a suggestion fills in street, house number, postcode and town. If the lookup fails, the midwife is told to try again later. | Must | — | — | — | — | NOT VERIFIED | MISSING | — | MISSING |
| [FR-01.03](../../.shipwright/planning/01-adopted/spec.md#fr-0103)<a id="rtm-fr-0103"></a> | From valid form data the app produces a one-page PDF invoice addressed to the administration of the municipality responsible for the mother's postcode. It contains the midwife's sender details, the legal basis, the mother's details, the ticked services at CHF 400 each with the total, place and date, the stored signature, and payment terms. If no municipality is known for the postcode, the midwife is told to check the address instead of getting a wrong invoice. | Must | — | — | — | — | NOT VERIFIED | MISSING | — | MISSING |
| [FR-01.04](../../.shipwright/planning/01-adopted/spec.md#fr-0104)<a id="rtm-fr-0104"></a> | Once an invoice has been generated, the midwife can print it directly or save it as a PDF file named after the mother. | Must | — | — | — | — | NOT VERIFIED | MISSING | — | MISSING |
| [FR-01.05](../../.shipwright/planning/01-adopted/spec.md#fr-0105)<a id="rtm-fr-0105"></a> | The midwife can clear all entered patient data and the generated invoice in one step to start the next invoice. | Must | — | — | — | — | NOT VERIFIED | MISSING | — | MISSING |
| [FR-01.06](../../.shipwright/planning/01-adopted/spec.md#fr-0106)<a id="rtm-fr-0106"></a> | The midwife stores her sender details (name, address, contact, IBAN), the place shown on the invoice, and optionally a fixed invoice date; left empty, each invoice carries the current date. The details are kept in the browser and reused for every invoice, and the form page shows when a fixed date is in effect. | Must | — | — | — | — | NOT VERIFIED | MISSING | — | MISSING |
| [FR-01.07](../../.shipwright/planning/01-adopted/spec.md#fr-0107)<a id="rtm-fr-0107"></a> | The midwife draws her signature once; it is stored in the browser and placed on every invoice. Saving other settings never removes the signature, and it can be cleared on purpose. | Must | — | — | — | — | NOT VERIFIED | MISSING | — | MISSING |
| [FR-01.08](../../.shipwright/planning/01-adopted/spec.md#fr-0108)<a id="rtm-fr-0108"></a> | Explains what the app does, how to use it, what data leaves the browser (only the typed street text, for address suggestions), the best-effort service disclaimer, and whom to contact. | Must | — | — | — | — | NOT VERIFIED | MISSING | — | MISSING |
| [FR-01.09](../../.shipwright/planning/01-adopted/spec.md#fr-0109)<a id="rtm-fr-0109"></a> | The user can switch between light, dark and system appearance; the choice is remembered in the browser. | Must | — | — | — | — | NOT VERIFIED | MISSING | — | MISSING |
| [FR-01.10](../../.shipwright/planning/01-adopted/spec.md#fr-0110)<a id="rtm-fr-0110"></a> | The address lookup service only answers the app's own web origins, rejects malformed or oversized requests, and limits how often a single client and all clients together may call it, so the Swiss Post quota cannot be used up by others. It never logs the addresses it handles. | Must | — | — | — | — | NOT VERIFIED | MISSING | — | — |
| [FR-01.11](../../.shipwright/planning/01-adopted/spec.md#fr-0111)<a id="rtm-fr-0111"></a> | CI pipeline (github-actions) must pass on pull requests. | Must | — | — | — | — | NOT VERIFIED | MISSING | — | — |
| [FR-01.12](../../.shipwright/planning/01-adopted/spec.md#fr-0112)<a id="rtm-fr-0112"></a> | Code passes eslint-flat without warnings. | Must | — | — | — | — | NOT VERIFIED | MISSING | — | — |

> **Legend** — *Tests*: `passed/total` of the latest event that ran tests; `first → latest` shows progression across tested runs. *Last tested*: date of that event (`iter` / `build` source); age is informational, **not a penalty**. *Reconciled?*: ✅ behavior-affected FR re-verified since its last change · ⚠️ needs re-verification (behavior changed, not yet re-tested) · — not behavior-touched. *Unit / Integration / E2E* (traceability manifest): `ok` an executed-passing tagged test covers the FR at that layer · `MISSING` the layer is required but has no executed-passing test · `?` ambiguous — the display id is shared across namespaces so the fanned tag is not credited (D-layer defers this to TT5) · `n/a` layer not required · — no manifest entry.

## Verification Timeline

| Event | Source | Type | FRs | Tests | Commit | Date |
|-------|--------|------|-----|-------|--------|------|
|  | adopted-backfill | change |  | — | — |  |

## Coverage Summary

| Metric | Value |
|--------|-------|
| Total splits built | 0 |
| Build sections | 0 |
| Iterate changes | 0 |
| Requirements total | 12 |
| Requirements verified | 0/12 |
| Must-have verified | 0/12 |

### FRs without tests

- [FR-01.01](../../.shipwright/planning/01-adopted/spec.md) (Must): The midwife enters the mother's first and last name, home address, date of birth
- [FR-01.02](../../.shipwright/planning/01-adopted/spec.md) (Must): While the midwife types a street, matching addresses are suggested, limited to p
- [FR-01.03](../../.shipwright/planning/01-adopted/spec.md) (Must): From valid form data the app produces a one-page PDF invoice addressed to the ad
- [FR-01.04](../../.shipwright/planning/01-adopted/spec.md) (Must): Once an invoice has been generated, the midwife can print it directly or save it
- [FR-01.05](../../.shipwright/planning/01-adopted/spec.md) (Must): The midwife can clear all entered patient data and the generated invoice in one 
- [FR-01.06](../../.shipwright/planning/01-adopted/spec.md) (Must): The midwife stores her sender details (name, address, contact, IBAN), the place 
- [FR-01.07](../../.shipwright/planning/01-adopted/spec.md) (Must): The midwife draws her signature once; it is stored in the browser and placed on 
- [FR-01.08](../../.shipwright/planning/01-adopted/spec.md) (Must): Explains what the app does, how to use it, what data leaves the browser (only th
- [FR-01.09](../../.shipwright/planning/01-adopted/spec.md) (Must): The user can switch between light, dark and system appearance; the choice is rem
- [FR-01.10](../../.shipwright/planning/01-adopted/spec.md) (Must): The address lookup service only answers the app's own web origins, rejects malfo
- [FR-01.11](../../.shipwright/planning/01-adopted/spec.md) (Must): CI pipeline (github-actions) must pass on pull requests.
- [FR-01.12](../../.shipwright/planning/01-adopted/spec.md) (Must): Code passes eslint-flat without warnings.

