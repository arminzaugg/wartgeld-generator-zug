# Test Evidence Report

Generated: 2026-11-08T09:00:55.369715+00:00
Source-State: run=iterate-2026-11-08-security-weekly-schedule base=2e3ba3d44d3c
Consistency-audit: never run

## Summary

| Metric | Value |
|--------|-------|
| Total test checkpoints | 20 |
| Total unit tests (latest full suite) | 392/392 (2026-11-08) |

## Test Progression

| # | Event | Source | Layer | New Tests | Suite Total | Result | Date |
|---|-------|--------|-------|-----------|-------------|--------|------|
| 1 | The security scan runs every Monday on its own, and a run only passes when every scanner reported. | [iterate](traceability-matrix.md#evt-fba965bb) | unit | +0 | 392/392 | PASS | 2026-11-08 |
| 2 | Measured C5 right-window invoice layout; intact recipient text with 5 mm clearance, sender/window and sender/title exclusion verified | [iterate](traceability-matrix.md#evt-b0881d7f) | mixed | +0 | 419/419 | PASS | 2026-11-06 |
| 3 | The security scan now runs clean: five findings that cannot affect this app are recorded as accepted, with reasons and a review date. | [iterate](traceability-matrix.md#evt-1594ef78) | unit | +0 | 379/379 | PASS | 2026-11-02 |
| 4 | Move the invoice recipient block up so the postcode line shows in a C5 right-window envelope | [iterate](traceability-matrix.md#evt-edd13b0b) | unit | +0 | 379/379 | PASS | 2026-10-31 |
| 5 | The dependency list now names the license of every package the app uses, so the compliance report no longer shows 6 as unknown. | [iterate](traceability-matrix.md#evt-3dc0b4f0) | unit | +0 | 377/377 | PASS | 2026-10-28 |
| 6 | The automated build tools were updated to their current versions; the app is unchanged. | [iterate](traceability-matrix.md#evt-d073d089) | mixed | +0 | 403/403 | PASS | 2026-10-24 |
| 7 | The test suite now enforces the intended 80% coverage minimum, and the required Node version is written down. | [iterate](traceability-matrix.md#evt-5b95ca53) | mixed | +0 | 403/403 | PASS | 2026-10-23 |
| 8 | The test tooling is now on a version without known critical security issues; the app itself is unchanged. | [iterate](traceability-matrix.md#evt-4daa9e00) | mixed | +0 | 403/403 | PASS | 2026-10-23 |
| 9 | The code scanner's last two warnings were checked, confirmed harmless and marked, so the scan is now clean. | [iterate](traceability-matrix.md#evt-5b8ed851) | mixed | +0 | 403/403 | PASS | 2026-10-23 |
| 10 | The automated build now uses fixed, tamper-proof versions of its tools, and dependency updates wait a week before being proposed. | [iterate](traceability-matrix.md#evt-16e78a08) | mixed | +0 | 403/403 | PASS | 2026-10-23 |
| 11 | Outdated libraries with known security holes were updated to safe versions of the same release line; the app behaves the same. | [iterate](traceability-matrix.md#evt-f2663c99) | mixed | +0 | 403/403 | PASS | 2026-10-23 |
| 12 | The PDF library used to build invoices was updated to a version without known security holes; invoices look the same. | [iterate](traceability-matrix.md#evt-dffc8190) | mixed | +0 | 403/403 | PASS | 2026-10-23 |
| 13 | On iPhone and iPad, «Drucken» now opens the share menu with the invoice instead of printing an empty page. | [iterate](traceability-matrix.md#evt-c236d5f0) | mixed | +0 | 401/401 | PASS | 2026-10-22 |
| 14 | The settings page now shows what is really saved and what is still missing, the invoice page points new users to it, the information page has its new look with the same privacy facts, and the appearance menu is German and follows the device. | [iterate](traceability-matrix.md#evt-c8801a80) | mixed | +0 | 389/389 | PASS | 2026-10-22 |
| 15 | The invoice page gets its new design: the total and the receiving municipality show up front, problems are listed with links to the fields, and on phones the finished invoice opens in a panel from the bottom. | [iterate](traceability-matrix.md#evt-55f0e977) | mixed | +0 | 325/325 | PASS | 2026-10-22 |
| 16 | The app gets its new warm paper-and-green look with its own fonts, and no longer loads anything from outside services. | [iterate](traceability-matrix.md#evt-aa5dba7d) | mixed | +0 | 258/258 | PASS | 2026-10-22 |
| 17 | host the app on Bunny at wartgeld.nidea.ch | [iterate](traceability-matrix.md#evt-dbcc3545) | mixed | +0 | 239/239 | PASS | 2026-10-21 |
| 18 | Swiss Post APIM lookup via Bunny edge service, drop Supabase | [iterate](traceability-matrix.md#evt-aff36dee) | mixed | +0 | 166/166 | PASS | 2026-10-21 |
| 19 | Municipality proposed in the browser from the official locality snapshot; recipient from bundled data; requirements confirmed | [iterate](traceability-matrix.md#evt-aced1b25) | mixed | +0 | 96/96 | PASS | 2026-10-21 |
| 20 |  | adopted-backfill | — | — | — | — |  |

## Full Suite Runs

_Synthesized from per-iterate **unit** results — Integration / pgTAP / E2E / Smoke read `—` because no `test_run` events (the only source of a full layer breakdown) are recorded; an empty column means the breakdown is unavailable, not that a layer failed._

| Run | Trigger | Unit | Integration | pgTAP | E2E | Smoke | Date |
|-----|---------|------|-------------|-------|-----|-------|------|
| 1 | iterate | 96/96 | — | — | — | — | 2026-10-21 |
| 2 | iterate | 166/166 | — | — | — | — | 2026-10-21 |
| 3 | iterate | 239/239 | — | — | — | — | 2026-10-21 |
| 4 | iterate | 258/258 | — | — | — | — | 2026-10-22 |
| 5 | iterate | 325/325 | — | — | — | — | 2026-10-22 |
| 6 | iterate | 389/389 | — | — | — | — | 2026-10-22 |
| 7 | iterate | 401/401 | — | — | — | — | 2026-10-22 |
| 8 | iterate | 403/403 | — | — | — | — | 2026-10-23 |
| 9 | iterate | 403/403 | — | — | — | — | 2026-10-23 |
| 10 | iterate | 403/403 | — | — | — | — | 2026-10-23 |
| 11 | iterate | 403/403 | — | — | — | — | 2026-10-23 |
| 12 | iterate | 403/403 | — | — | — | — | 2026-10-23 |
| 13 | iterate | 403/403 | — | — | — | — | 2026-10-23 |
| 14 | iterate | 403/403 | — | — | — | — | 2026-10-24 |
| 15 | iterate | 377/377 | — | — | — | — | 2026-10-28 |
| 16 | iterate | 379/379 | — | — | — | — | 2026-10-31 |
| 17 | iterate | 379/379 | — | — | — | — | 2026-11-02 |
| 18 | iterate | 419/419 | — | — | — | — | 2026-11-06 |
| 19 | iterate | 392/392 | — | — | — | — | 2026-11-08 |

