# Mini-Plan: bunny-static-hosting

Run: iterate-2026-10-21-bunny-static-hosting · Spec: `2026-10-21-bunny-static-hosting.md`

## Order of work

0. **Probe (before build, live, reversible):** create the storage zone + site
   pull zone with the deploy script's "ensure" functions, upload a test
   `index.html`, add the "Change Origin URL" edge rule for `/api/address` and
   verify a POST through the site hostname reaches the address service
   (expect 403 until the origin is allowed, then 200). If it does not work,
   switch to the middleware fallback (Design Notes). Record the finding in
   Confidence Calibration.
1. **Settings export/import (FR-01.06)** — TDD:
   - `src/lib/settingsFile.ts`: `serializeSettings(settings) → string`,
     `parseSettingsFile(text) → { ok, settings } | { ok:false, error }`
     (format/version check, string types, length caps, signature must match
     `^data:image/png;base64,[A-Za-z0-9+/=]+$`, total ≤ 1 MB).
   - `src/pages/Settings.tsx`: two buttons; download via Blob + object URL;
     upload via hidden `<input type="file" accept="application/json">`;
     confirm dialog (existing AlertDialog) listing what gets replaced; toast on
     success/failure; the form reloads from storage after import.
   - Tests: unit for parse/serialize (round trip, each rejection), component
     test for export (Blob content) and import (valid → stored; invalid →
     message, storage unchanged); e2e: save on one page context, load in a
     fresh context, invoice uses the sender block.
2. **Debounce (FR-01.02)** — `src/hooks/useDebouncedValue.ts` (+ test with fake
   timers); `useStreetAutocomplete` queries the debounced term; StreetLookup
   tests adjusted.
3. **Address service origin (FR-01.10)** — `deploy-address-lookup.mjs`:
   `ALLOWED_ORIGINS` = `https://wartgeld.nidea.ch,https://wartgeld-generator-zug.netlify.app`;
   `config.ts` default updated the same; smoke test also checks the new origin.
4. **Site deploy script** — `scripts/site/deploy-site.mjs` + `scripts/site/bunnyApi.mjs`
   (small fetch wrapper shared with the edge deploy script, which is refactored
   to use it), state in `site/bunny-site.json` (ids, hostnames).
   Steps: guard (clean tree, main or `--from-branch`), `npm run build`, ensure
   storage zone (DE, no replication) → ensure pull zone (origin = storage zone,
   Standard tier) → ensure hostname `wartgeld.nidea.ch` + DNS CNAME in zone
   `nidea.ch` + free certificate + force SSL → ensure edge rules (api origin,
   b-cdn redirect, assets cache 1 y, html no-cache, 3 security headers),
   matched by description so re-runs update instead of duplicating → ensure
   Shield zone + rate-limit rule (matched by name) → upload `dist/` (assets
   first, `index.html` last; content-type by extension) → purge pull zone →
   smoke test. Pure helpers (file ordering, content types, rule definitions,
   hostname normalising, desired-vs-actual diff) unit-tested in
   `scripts/site/__tests__/`.
5. **CI e2e (FR-01.11)** — `test.yml`: after unit tests,
   `npx playwright install --with-deps chromium`, `npm run test:e2e`,
   upload `playwright-report/` on failure. CI-supply-chain acknowledgement
   recorded (GitHub-owned actions only; Playwright from the lockfile).
6. **Docs/privacy (FR-01.08)** — Info text, README (Hosting, deploy:site,
   rollback, first-run setup), CLAUDE.md/AGENTS.md WHAT lines, spec rows.
7. **Live** — `npm run deploy:edge -- --from-branch` (origin list), then
   `npm run deploy:site -- --from-branch`, then verify AC1–AC6 live
   (curl + Playwright against `https://wartgeld.nidea.ch` with a real lookup),
   then PR. Netlify unchanged.

## Rollback

- Bunny site broken → Netlify is untouched and still the address people use
  until the follow-up PR; nothing to do.
- Address service origin change → republish previous Bunny release.
- Settings import bug → export is read-only; import only writes after
  confirmation and validation.

## Alternative approach considered

Middleware script on the site pull zone that serves `/api/address` itself
(same handler, second Bunny script), instead of an edge rule that sends
`/api/address` to the existing standalone service.

Rejected because: it duplicates the deployed service (two scripts holding the
Post credentials, two deploys to keep in sync) while the edge rule needs no
new code; it remains the fallback if the probe shows storage-zone pull zones
cannot override the origin per path.

## Cost check (AC10)

Bunny price list (2026-10): storage $0.01/GB/month single region (site
< 2 MB); CDN Europe $0.01/GB (≈ 1 user, a few MB/month); Shield Basic free;
Edge Scripting $0.20 per million requests; DNS free tier covers one zone.
Total well below the $1/month minimum charge.

## Changes after internal reviews (2026-10-21)

- **Split scripts:** `npm run setup:site` (one-time, idempotent; `scripts/site/setup-site.mjs`) creates/updates storage zone, pull zone, hostname, DNS CNAME, certificate, edge rules, Shield zones; `npm run deploy:site` only builds, checks, uploads, purges, smoke-tests.
- **Find-or-create everywhere:** every ensure step looks the resource up by name/hostname via the list API before creating; the state file `site/bunny-site.json` is written after each resource; unit test for "exists but not in state".
- **DNS safety:** only add/update the single `CNAME wartgeld` record (match name + type); never delete or bulk-update; fail if another record type uses the name; check CAA; poll certificate with a timeout before any custom-host smoke test; the b-cdn → custom-host redirect rule is created last, matched on the exact b-cdn hostname.
- **Shield on both pull zones:** the site zone and the address service's own zone (6843620) each get a free Shield zone with the same per-IP rule (50 / 10 s, block 60 s); setup reads the zone back and fails unless it is the free plan. Shared-secret header + removing the Netlify origin → follow-up PR (triage card).
- **Probe (step 0) extended:** throwaway probe via the same API calls with final resource names (setup adopts them later): Host header at the service, POST body + Origin arrive unchanged, 403 comes from the service, real client IP counted by Shield, free plan readback, `/api/address` never edge-cached; run once from a real browser fetch.
- **Cache:** non-asset paths `Cache-Control: no-cache` (browser) + short edge cache (5 min) so a failed purge self-heals; purge by URL (`/`, `/index.html`) instead of the whole zone; `/assets/*` 1 year immutable. HSTS header added (max-age 1 year, no preload).
- **Upload:** storage host from the zone's region; content-type map unit-tested; dotfiles skipped; `index.html` only after every asset returned 201. Storage password kept in memory only.
- **Secret check:** `check-dist-secrets.mjs` already scans for every `.env.local` value; deploy additionally fails on untracked files under `public/` or `src/`.
- **Settings import:** check `File.size ≤ 1 MB` before reading; reject unknown keys at every level; build a fresh object from the 4 whitelisted fields; per-field length caps (sender 2 000, place 100); `rechnungsDatum` empty or a real `YYYY-MM-DD`; signature PNG data URL whose base64 starts with `iVBORw0KGgo`, ≤ 900 kB; storage write in try/catch with German error and nothing changed; tests incl. `__proto__` payload.
- **Settings page:** export uses raw stored values (no placeholder defaults) and saves nothing silently — if the form has unsaved changes, export asks to save first; after import the form remounts (key counter) so text and signature show the imported values; hint "Die Datei enthält Ihre Bankverbindung und Unterschrift – sicher aufbewahren."; dialog renders text only.
- **Netlify notice:** when served from `*.netlify.app`, a banner says the app moved to wartgeld.nidea.ch and to save the settings first (export button right there).
- **Order after merge:** user publishes the Netlify deploy → confirms "Einstellungen sichern" is there → exports → imports on wartgeld.nidea.ch → checks an invoice shows sender + signature → only then the forwarding PR.
- **Debounce:** debounced term drives both `queryKey` and `enabled`; suggestions are hidden while the typed text differs from the debounced term; fake-timer test.
- **CI:** separate `e2e` job, `permissions: contents: read`, `actions/checkout` with `persist-credentials: false`, builds then runs Playwright against `vite preview`; HTML reporter added; report uploaded on failure. Note corrected: no *new* third-party action (the existing lcov reporter stays as is — pinning it is a separate triage card).
- **Rollback (corrected):** service variables → run `deploy:edge` from the previous commit; site → `deploy:site` from the previous commit (old assets are kept). The forwarding PR must not remove Netlify before a Bunny-side rollback has been tried once.

## Changes after external reviews (2026-10-21) — supersede the "Split scripts" item above

- **No provisioning script.** The Bunny resources (storage zone, pull zone, hostname + DNS CNAME + certificate, edge rules, Shield zone(s)) are created **once** during this run (API calls from a throwaway scratch script, not committed). Their ids, settings and a re-create checklist are documented in `docs/bunny-hosting.md`; ids also in `site/bunny-site.json` for the deploy script. `npm run deploy:site` = build, secret check, upload (assets first, `index.html` last), purge `/` + `/index.html`, smoke test (page 200 with the new bundle name, one lookup 200, foreign origin 403, b-cdn → 301).
- **Rate-limit check only at setup, not on every deploy:** verify with requests the service rejects before calling Swiss Post (invalid body → 400), expect Shield's 429 after the limit and recovery after 60 s.
- **Shield on the service's own zone only if the probe shows it counts the real visitor IP** for traffic from the site zone; otherwise left off (a mis-counted global limit is worse than none) and the shared-secret header in the follow-up closes the bypass.
- **Allowed origins:** `PREVIEW_SITE` stays (Netlify previews), production list gets `https://wartgeld.nidea.ch`; handler tests keep production, a valid preview and a foreign origin.
- **Export:** exports the saved values with a static hint „Ungespeicherte Änderungen werden nicht mitgesichert" (no save-first flow). Import dialog: „Tipp: Sichern Sie vorher Ihre aktuellen Einstellungen."
- **Edge rule order** documented in `docs/bunny-hosting.md` (api origin + no-cache before cache rules).
