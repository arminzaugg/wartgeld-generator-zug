# Architecture Brief: zug-municipality-data

## The problem

The invoice must reach the administration of the municipality the mother lives
in. Today the app maps each postcode to exactly one municipality from a database
table; the official Swiss locality list shows several Zug postcodes/localities
span two to four municipalities (e.g. 6314 Neuägeri), one Zug postcode (6319) has
no mapping at all, and some Zug addresses carry a postcode of a neighbouring
canton. Wrong or missing recipients mean a rejected or lost claim for the
midwife. One active user; about a handful of invoices per month.

## What already exists here

- Supabase tables `plz_mappings` (postcode → municipality) and
  `administration_addresses` (11 recipients), read by the browser at invoice time.
- An address autocomplete (Swiss Post) that returns street, house number,
  postcode, town and canton — but no municipality.
- The database and its hosting are being retired in the next steps of the same
  migration; the app is becoming a static site.

## What would newly, permanently exist

A data file in the repository with the 11 recipients and a generated snapshot of
the official locality list for canton Zug (postcode, locality, municipalities
with address shares), plus a small script that regenerates the snapshot from the
federal CSV. A required "responsible municipality" choice on the form, pre-filled
from the address. The maintainer (the repo owner) keeps the snapshot and the
recipient addresses current by re-running the script / editing the file.

## Options on the table

- **A:** Snapshot shipped with the app; form proposes the municipality and the
  midwife can change it; hint when the locality is shared.
- **B:** After the address is picked, query the federal building register
  (geo.admin.ch) for the exact building's municipality.
- **C:** Keep one municipality per postcode (hand-maintained table in the repo),
  only fixing the missing postcode.
- **D:** Do nothing (keep the database tables).

## Constraints that are not negotiable

- The database is being retired (decided); no new server-side storage.
- Patient data (names, birth date) must not leave the browser.
- Budget under €2/month in total for hosting and services.
