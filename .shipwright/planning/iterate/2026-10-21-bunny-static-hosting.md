# Iterate Spec: bunny-static-hosting

- **Run ID:** iterate-2026-10-21-bunny-static-hosting
- **Type:** change
- **Complexity:** medium
- **Status:** draft

Step 3 of 3 of the hosting migration (Netlify + Supabase → Bunny + Swiss Post
APIM). Step 1 (municipality data, PR #175) and step 2 (Bunny address service,
PR #176) are live.

## Goal

The app is served from Bunny at **https://wartgeld.nidea.ch** (static files in
a Bunny storage zone behind a pull zone, custom hostname with free TLS). Its
`/api/address` is same-origin there and reaches the existing address service.
Each visitor gets a per-visitor request limit from Bunny Shield (free plan).
The midwife can save her settings to a file and load them on the new address.
Playwright e2e tests run in CI. Netlify stays untouched as the fallback in this
change; forwarding Netlify to the new address is a small follow-up PR after the
midwife has moved her settings (she needs the old site to export them).

## Decisions taken in the interview (2026-10-21)

1. **Address:** `wartgeld.nidea.ch` (nidea.ch DNS is already on Bunny; the
   GoDaddy "Launching Soon" page on the apex stays untouched).
2. **Settings move:** "Einstellungen sichern" / "Einstellungen laden" buttons
   on the settings page (file export/import; doubles as a backup).
3. **Publishing:** one manual command `npm run deploy:site` (Bunny key stays in
   `.env.local`; nothing secret in GitHub).
4. **Netlify:** forwards to the new address once the Bunny site is verified
   (follow-up PR, see Out of Scope).

## Acceptance Criteria

- [ ] AC1 — `https://wartgeld.nidea.ch` serves the current build with a valid
  TLS certificate; `#/settings` and `#/info` work; the Bunny default hostname
  (`*.b-cdn.net`) redirects permanently to `https://wartgeld.nidea.ch`
  (one origin only, so settings are never split across two addresses).
- [ ] AC2 — On `wartgeld.nidea.ch`, typing `Bahnhofstr 1` shows Zug addresses
  (same behaviour as AC1 of step 2): `POST /api/address` is same-origin and
  reaches the existing address service, which allows the origin
  `https://wartgeld.nidea.ch` (added to its allowed origins; Netlify
  production and previews stay allowed while Netlify is the fallback).
- [ ] AC3 — More than **50 lookups within 10 seconds from one visitor (IP)**
  are refused by Bunny Shield for 60 seconds (HTTP 429); normal typing never
  reaches the limit. The address field waits **250 ms** after the last
  keystroke before looking up, so fast typing sends one request instead of
  one per letter. The service's total per-instance cap stays as a second line.
- [ ] AC4 — A new deploy is visible right after `npm run deploy:site`:
  `index.html` is never served stale (browser `no-cache`, CDN cache purged on
  deploy); hashed files under `/assets/` are cached long-term (immutable) and
  earlier builds' assets stay available, so an open tab keeps working.
- [ ] AC5 — `npm run deploy:site` (manual, from a clean `main`, or
  `--from-branch`): builds, refuses a build that fails the secret check,
  creates the Bunny storage zone / pull zone / hostname / certificate / DNS
  record / Shield zone + rate-limit rule / edge rules on first run (ids
  recorded in a tracked JSON file), uploads `index.html` last, purges the
  cache, and smoke-tests the live address (page 200 with the new bundle name,
  lookup 200 with results, foreign origin 403). Prints names, ids and status
  codes only — never a key or password.
- [ ] AC6 — Responses carry `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: no-referrer` and `X-Frame-Options: DENY` (edge rules).
- [ ] AC7 — Settings page: "Einstellungen sichern" downloads
  `wartgeld-einstellungen.json` with sender block, place, invoice date and
  signature; "Einstellungen laden" reads such a file, shows what will be
  replaced, and on confirmation stores it so the next invoice uses it.
  Invalid files (not JSON, wrong shape, wrong types, signature not a PNG data
  URL, larger than 1 MB) are rejected with a German message and change
  nothing.
- [ ] AC8 — CI runs the Playwright e2e suite (Chromium) on every pull request
  and on `main`; a failing e2e test fails the workflow; the HTML report is
  uploaded on failure. No new third-party GitHub Action.
- [ ] AC9 — The Info page privacy text names bunny.net as host (and Netlify
  only for the old address while it still exists); README/CLAUDE.md/AGENTS.md
  describe Bunny hosting, `deploy:site`, and the rollback.
- [ ] AC10 — Monthly cost stays within Bunny's $1 account minimum
  (storage zone in one region, no replication; Shield free plan; pull zone
  Standard tier) — checked against Bunny's price list in the plan, not
  measured.

## Spec Impact

- **Classification:** modify
- **ADD:** none
- **MODIFY:** FR-01.06 — settings can be exported to and imported from a file
  (AC7); FR-01.08 — privacy text names bunny.net as host (AC9); FR-01.10 —
  allowed origins include `https://wartgeld.nidea.ch`, per-visitor limit at
  the Bunny edge (AC2/AC3); FR-01.02 — lookup waits 250 ms after typing (AC3);
  FR-01.11 — CI includes the e2e suite (AC8).
- **REMOVE:** none

## Out of Scope

- Netlify forwarding to `wartgeld.nidea.ch` and removing the Netlify mention
  from the privacy text (follow-up PR once the midwife has exported her
  settings from the old address and the Bunny site is verified).
- Deleting the Netlify site, retiring Supabase (existing triage card,
  due 2026-11-30).
- Content-Security-Policy (needs an inventory of inline styles/fonts first;
  triage card).
- The nidea.ch apex and `www` records.
- Visual design changes.

## Design Notes

- **Routing `/api/address`:** preferred — an edge rule on the site pull zone
  ("Change Origin URL" for path `/api/address`) to
  `https://wartgeld-address-lookup.bunny.run`; the service already answers
  only `POST /api/address`. Fallback if the probe fails (storage-zone origins
  may not accept an origin override): attach a middleware script whose
  `onOriginRequest` answers `/api/address` with the same handler
  (short-circuit, no origin hit). Decided by an empirical probe before build.
- **Rate limit:** Shield zone on the site pull zone (free plan: ≤ 2 rules,
  ≤ 10 s window); one rule: `REQUEST_URI` begins with `/api/address`,
  counter key IP, 50 per 10 s, block 60 s, action RateLimit.
- **Cache:** edge rules — `/assets/*` browser cache 1 year; everything else
  browser cache 0; CDN purge after each deploy.
- **Upload:** Bunny Storage HTTP API with the zone password fetched at deploy
  time via the account API key (only `BUNNY_API_KEY` in `.env.local`);
  `assets/` first, `index.html` last; nothing deleted.
- **Settings file:** `{ "format": "wartgeld-einstellungen", "version": 1,
  "settings": { senderInfo, ortRechnungssteller, rechnungsDatum, signature? } }`;
  parsing and validation are a pure function next to `presetStorage.ts`.
- **Debounce:** a small `useDebouncedValue(value, 250)` in the autocomplete
  hook; react-query keys use the debounced term.
- **CI:** extend `.github/workflows/test.yml` with `npx playwright install
  --with-deps chromium` and `npm run test:e2e` (e2e stubs `/api/address`, so
  no secrets and no Swiss Post calls in CI).

## Affected Boundaries

- Browser → `https://wartgeld.nidea.ch` (Bunny pull zone → storage zone);
  `/api/address` → edge rule/middleware → address service → Swiss Post.
- Deploy script → Bunny account API, Storage API, Shield API, DNS API.
- Browser file download/upload (settings export/import).
- GitHub Actions runner → npm + Playwright browser download.

## Internal Architecture Review (architecture-internal-reviewer)
- **Ran:** yes
- **Severity:** medium
- **Summary:** Move is justified (deciding reason: a real per-IP limit, not cost); Option 1 (edge rule to the existing service) is the smallest; close the direct-hostname bypass and shrink the routine deploy.
- **Findings:**
  - necessity, low, fixed — ADR records the per-IP limit as the deciding reason.
  - security (direct `*.bunny.run` bypasses the Shield limit), medium, fixed — the service's own pull zone gets a Shield zone with the same per-IP rule now; a shared-secret header from the site pull zone (and dropping the Netlify origin) follows in the Netlify-forwarding PR (triage card).
  - complexity-cost (one-shot setup on the routine path, DNS-capable key), medium, fixed — split into `npm run setup:site` (one-time, idempotent) and `npm run deploy:site` (build, check, upload, purge, smoke test only).
  - smallest-option, low, fixed — Option 1 chosen; Option 2 only as probe fallback.
  - completeness (no-cache for `/api/address`, Origin/body forwarding, real client IP), low, fixed — added to the pre-build probe; setup adds a "never cache /api/address" rule; deploy smoke test checks 429 after the limit.
  - completeness (two live addresses until the follow-up), low, fixed — the Netlify copy shows a notice "App ist umgezogen … zuerst Einstellungen sichern" with the export button.
  - security (import field limits), low, fixed — per-field length caps, pure validator with hostile-input tests.
- **Known limitations:** until the follow-up PR, Netlify-forwarded lookups share Netlify's IPs in the per-IP counter of the service's pull zone.
- **Status:** 7 fixed

## Internal Plan Review (opus-plan-reviewer)
- **Ran:** yes
- **Severity:** medium (two findings marked high, both fixed)
- **Summary:** Sound and well-scoped; gaps in bypass protection, probe coverage, idempotency, import hardening, CI report, and post-merge order.
- **Findings:** security/Shield bypass (high) fixed — Shield on both pull zones, shared secret in follow-up; architecture/Host header (high) fixed — probe; idempotency (medium) fixed — find-or-create + per-step state; DNS zone safety (medium) fixed; settings import hardening (medium) fixed; export order vs Netlify publish (medium) fixed — explicit post-merge order; Settings.tsx remount/defaults/unsaved edits (medium) fixed; export file hint (low) fixed; Shield free-plan probe (medium) fixed; cache headers/purge (low) fixed; secret/untracked files (low) fixed; storage region/content types (low) fixed; redirect timing/HSTS (low) fixed; CI e2e job/report/permissions (medium) fixed, pinning the existing third-party action declined as out of scope (triage card); rollback wording (low) fixed; debounce + probe-before-TDD (low) fixed.
- **Known limitations:** existing `romeovs/lcov-reporter-action` stays tag-pinned (triage card).
- **Status:** 16 fixed, 1 declined

## External Plan Review
GLM: approve; GPT: revise. Fixed: keep Netlify previews allowed (PREVIEW_SITE untouched, regression test); rate-limit verification moved out of the routine deploy into one-time setup using requests rejected before Swiss Post; explicit fallback if Bunny→Bunny traffic hides the visitor IP (no Shield on the service zone then); edge-rule order documented; import dialog hint to save first; export simplified to saved values + static hint. Rule update-in-place: moot (no provisioning code).

## Architecture Review
GPT: revise (option 1, but provision once instead of a reconciling controller) — **adopted**: no setup script, one-time provisioning documented in `docs/bunny-hosting.md`.
GLM: revise (option 4, the address script also serves the static files; drop Shield) — **declined, put to the user**: it would ship the PDF/React bundle inside the script that holds the Swiss Post credentials, make every page view a script execution, lose CDN-cached immutable assets, and its in-script IP counting is per instance (the reason a per-visitor limit needs Shield). Shield stays because the user asked for a per-visitor limit and it costs nothing. Driver recorded: a real per-IP limit and the user's own domain on Bunny, not cost.
