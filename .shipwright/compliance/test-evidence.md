# Test Evidence Report

Generated: 2026-10-24T08:27:49.492073+00:00
Source-State: run=iterate-2026-10-23-ci-actions-bump base=d4cdc705631a release=v1.5.0
Consistency-audit: never run

## Summary

| Metric | Value |
|--------|-------|
| Total test checkpoints | 15 |
| Total unit tests (latest full suite) | 403/403 (2026-10-24) |

## Test Progression

| # | Event | Source | Layer | New Tests | Suite Total | Result | Date |
|---|-------|--------|-------|-----------|-------------|--------|------|
| 1 | The automated build tools were updated to their current versions; the app is unchanged. | [iterate](traceability-matrix.md#evt-d073d089) | mixed | +0 | 403/403 | PASS | 2026-10-24 |
| 2 | The test suite now enforces the intended 80% coverage minimum, and the required Node version is written down. | [iterate](traceability-matrix.md#evt-5b95ca53) | mixed | +0 | 403/403 | PASS | 2026-10-23 |
| 3 | The test tooling is now on a version without known critical security issues; the app itself is unchanged. | [iterate](traceability-matrix.md#evt-4daa9e00) | mixed | +0 | 403/403 | PASS | 2026-10-23 |
| 4 | The code scanner's last two warnings were checked, confirmed harmless and marked, so the scan is now clean. | [iterate](traceability-matrix.md#evt-5b8ed851) | mixed | +0 | 403/403 | PASS | 2026-10-23 |
| 5 | The automated build now uses fixed, tamper-proof versions of its tools, and dependency updates wait a week before being proposed. | [iterate](traceability-matrix.md#evt-16e78a08) | mixed | +0 | 403/403 | PASS | 2026-10-23 |
| 6 | Outdated libraries with known security holes were updated to safe versions of the same release line; the app behaves the same. | [iterate](traceability-matrix.md#evt-f2663c99) | mixed | +0 | 403/403 | PASS | 2026-10-23 |
| 7 | The PDF library used to build invoices was updated to a version without known security holes; invoices look the same. | [iterate](traceability-matrix.md#evt-dffc8190) | mixed | +0 | 403/403 | PASS | 2026-10-23 |
| 8 | On iPhone and iPad, «Drucken» now opens the share menu with the invoice instead of printing an empty page. | [iterate](traceability-matrix.md#evt-c236d5f0) | mixed | +0 | 401/401 | PASS | 2026-10-22 |
| 9 | The settings page now shows what is really saved and what is still missing, the invoice page points new users to it, the information page has its new look with the same privacy facts, and the appearance menu is German and follows the device. | [iterate](traceability-matrix.md#evt-c8801a80) | mixed | +0 | 389/389 | PASS | 2026-10-22 |
| 10 | The invoice page gets its new design: the total and the receiving municipality show up front, problems are listed with links to the fields, and on phones the finished invoice opens in a panel from the bottom. | [iterate](traceability-matrix.md#evt-55f0e977) | mixed | +0 | 325/325 | PASS | 2026-10-22 |
| 11 | The app gets its new warm paper-and-green look with its own fonts, and no longer loads anything from outside services. | [iterate](traceability-matrix.md#evt-aa5dba7d) | mixed | +0 | 258/258 | PASS | 2026-10-22 |
| 12 | host the app on Bunny at wartgeld.nidea.ch | [iterate](traceability-matrix.md#evt-dbcc3545) | mixed | +0 | 239/239 | PASS | 2026-10-21 |
| 13 | Swiss Post APIM lookup via Bunny edge service, drop Supabase | [iterate](traceability-matrix.md#evt-aff36dee) | mixed | +0 | 166/166 | PASS | 2026-10-21 |
| 14 | Municipality proposed in the browser from the official locality snapshot; recipient from bundled data; requirements confirmed | [iterate](traceability-matrix.md#evt-aced1b25) | mixed | +0 | 96/96 | PASS | 2026-10-21 |
| 15 |  | adopted-backfill | — | — | — | — |  |

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

