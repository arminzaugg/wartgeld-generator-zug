# Measured C5 right-window address

Run-ID: iterate-2026-11-06-c5-window-address
Intent: CHANGE · Complexity: small (history prior; bounded PDF layout; touches_billing/shared lib review)
Status: implemented
Spec Impact: MODIFY FR-01.03
Model tiers: review=inherit, finalization=inherit, plan_review=inherit (unset)

## Phase checklist
TaskCreate/TodoWrite are unavailable in this session; this file is the durable checklist.
- [x] Scout
- [x] Build (TDD)
- [x] Self-review
- [x] Review cascade (spec → code → doubt)
- [x] F0 / F0.5
- [x] F1–F5c
- [ ] F6 commit
- [ ] F11 push + PR + delivery MERGED
- [ ] F12
Mini-plan and external plan review are below the small CHANGE threshold.
Autonomous mode: use the explicitly supplied dimensions without an interview.

## Decision
Replace ADR-018's estimated 48–72 mm window band with geometry derived from the supplied C5 envelope (229 × 162 mm), right window (x=120, y=52, width=100, height=45 mm), flap up. A4 folded horizontally is 210 × 148.5 mm. With its printed upper half facing the window and the fold at the bottom, sheet offsets range x=0–19, y=0–13.5 mm. The intersection visible in every position is paper x=120–201, y=52–83.5 mm. Inset text bounds by 5 mm: x=125–196, y=57–78.5 mm. Use recipient baselines 61/66/71/76 mm at x=125 mm; ensure glyph bounds and all recipient widths fit. Wrap sender text into the left column, outside every possible window position (paper x=101–220, y=38.5–97). Date and body already sit below it. Print A4 at actual size (100%, no scaling).

Alternative: centre the sheet and optimise only for that insertion position. Rejected: normal envelope play could hide an address line. No user calibration/settings UI is needed.

## Acceptance criteria
1. All non-empty recipient lines for all 11 municipalities remain within the window with >=5 mm clearance at all four extreme sheet offsets; PDF remains A4, one page. No recipient text is lost.
2. An absent department leaves no blank line. Sender, date and body stay outside the union of possible window locations; long sender lines cannot intrude horizontally.
3. The real browser can generate, preview and save an invoice with the same measured PDF layout; no runtime console errors.

## Verification / Test Completeness Ledger
- AC1: real jsPDF output coordinates, font metrics, page size/count, all municipalities, four offsets; unit test suite.
- AC2: real PDF content, long sender line wrapping and missing department regression tests.
- AC3: Playwright browser generation/download, inspect downloaded PDF and screenshot.
- Physical paper/printer/fold fit: untestable here, reason_code requires-physical-device; user can print at 100%, fold at 148.5 mm, upper printed half facing window, fold down.

## Context / prerequisites
main health unknown (configured workflow names no longer match repository); not green evidence. shipwright_test_results.json absent in fresh worktree; regenerate in F5. Startup quality warning refers to missing historical iterate evidence; do not fabricate prior events/ADRs. This run must write its own decision drop, work_completed event and review/test evidence before finalization.

## Review
- Self: all eight checklist items pass (payload in run review directory).
- Spec: PASS, independent geometry agrees.
- Code: PASS, no concrete findings in first pass.
- Doubt: accepted counterexample: nine 25-character-wide sender lines wrap to 18 and overlap the title. Reproduced with a failing test; fixed by proportionally fitting sender font and pitch so baselines remain within 25–90 mm (normal sender stays 11 pt / 5 mm). All characters retained, same horizontal exclusion. Regression now passes.
- External: approve, one configured cross-vendor CLI reviewer answered; optional GLM unavailable (no key). Accepted parser-count improvement: every PDF text operator must have parsed bounds. Missing-department observation needs no change: existing explicit test already checks 5/10 mm line gaps. Sender-height observation resolved by the doubt fix above.
- Browser gate first invocation could not launch `E2E_PREVIEW=1` as an executable (exit127, zero tests); corrected runner uses `env E2E_PREVIEW=1 npx playwright test`.
- Code and doubt delta re-reviews: PASS after sender-height fix. Fresh verification: 392/392 unit tests (41 files), 27/27 browser tests, 92.86% line coverage; lint/typecheck/build pass. No mirrored scripts/verify_local.py or test-suite config exists in this adopted app. F2 structural impact: none (existing PDF only). F3a learning updates earlier envelope estimate in conventions.md. Physical probe remains the only untestable behavior.
