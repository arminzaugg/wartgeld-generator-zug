# Iterate Spec: bunny-post-proxy

- **Run ID:** iterate-2026-10-21-bunny-post-proxy
- **Type:** change
- **Complexity:** medium
- **Status:** draft

Step 2 of 3 of the hosting migration (Netlify + Supabase → Bunny + Swiss Post
APIM). Step 1 (municipality data in the app) is merged (PR #175). Step 3 moves
the static site to Bunny.

## Goal

Address suggestions come from the new Swiss Post APIM Address Query API through
our own small service on Bunny Edge Scripting instead of the Supabase edge
function and the old Post `autocomplete4` interface (shut down by 2027-09-30).
After this change the app no longer uses Supabase at all. The live site stays
on Netlify for now and forwards `/api/address` to the Bunny service, so it keeps
working and exercises the new path in real use before step 3.

## Decisions taken in the interview (2026-10-21)

1. **Live site:** deploy the Bunny service in this step; Netlify forwards
   `/api/address` to it (no outage, no big-bang switch in step 3).
2. **Border villages:** Bennau 8836, Sattel 6417, Rothenthurm 6418 and
   Mühlau 5642 (94–99 % of addresses outside Zug) are **not offered**. Swiss
   Post reports the canton per locality, not per building, so their Zug part
   cannot be told apart. A mother in the Zug part of these villages cannot be
   invoiced with the app (accepted).
3. **Sihlbrugg 6340** (67.5 % outside Zug, 32.5 % Neuheim) **stays offered**
   with the existing "liegt teilweise ausserhalb" hint and no pre-filled
   municipality. Rule: a locality is not offered when **more than 90 %** of
   its addresses lie outside Zug (`MAX_OUTSIDE_SHARE = 90`), judged per
   (postcode, town).
4. **Usage limit:** only a total per-instance cap (requests per minute); no
   per-visitor limit, because behind the Netlify proxy the service cannot
   reliably identify a visitor. Proper per-visitor limiting comes with the
   Bunny firewall in step 3.

## Acceptance Criteria

- [ ] AC1 — Typing `Bahnhofstr 1` offers Zug addresses (e.g. `Bahnhofstrasse 1,
  6300 Zug`, `Bahnhofstrasse 1, 6340 Baar`); picking one fills street, house
  number, postcode and town as before. Exact house-number matches rank first.
- [ ] AC2 — Suggestions only contain offered Zug localities: never a
  (postcode, town) outside the Zug locality snapshot, never
  Bennau/Sattel/Rothenthurm/Mühlau, at most 10 results, closest street-name
  matches first; Sihlbrugg is offered.
- [ ] AC3 — The browser only talks to its own origin (`/api/address`); no
  Supabase request, no Swiss Post request; the built `dist/` contains no
  `POST_APIM`, `client_secret` or `supabase.co`.
- [ ] AC4 — The Post client id/secret exist only as Bunny secrets and in the
  git-ignored `.env.local`; nothing named `VITE_*` carries them; the service
  fetches an OAuth token (client credentials), reuses it until shortly before
  it expires, and retries exactly once with a fresh token when Post answers
  401.
- [ ] AC5 — The service answers only allowed web origins: the configured
  production origin, Netlify deploy previews matching exactly
  `https://deploy-preview-<digits>--wartgeld-generator-zug.netlify.app`, and
  its own origin. Missing or other origins → 403, other methods → 405,
  bodies > 1 KB → 413, invalid JSON / fields → 400, more than the total
  per-instance cap per minute → 429. It logs fixed messages with status,
  duration and counts only — never request/response bodies or Post error
  text — and answers with `Cache-Control: no-store`.
- [ ] AC6 — If Swiss Post fails or does not answer within the deadline
  (token ≈ 3 s, whole lookup ≈ 8 s), the service answers 502 with no address
  data, and the app shows the existing `Fehler bei der Adresssuche` message.
- [ ] AC7 — `npm run dev` serves `/api/address` locally from the same service
  code, using only the `POST_APIM_*` values from `.env.local`; without them it
  answers 503 and the app shows the error message. Under Playwright the dev
  service is off, so e2e never calls Swiss Post.
- [ ] AC8 — The live Netlify site (and its deploy previews) forward
  `/api/address` to the deployed Bunny service; a real lookup works there.
- [ ] AC9 — An address in a non-offered locality (e.g. 8836 Bennau) cannot
  produce an invoice: the form shows `Diese PLZ liegt nicht im Kanton Zug`
  and proposes no municipality.
- [ ] AC10 — `@supabase/supabase-js`, `src/integrations/supabase` and the
  `supabase/` folder are removed (incl. README/AGENTS references); build,
  lint and all tests pass.
- [ ] AC11 — The Info page's privacy section says accurately what leaves the
  browser: the typed address text (street, house number, postcode, town as
  typed) goes via our hosting providers Netlify and bunny.net (which see the
  visitor's IP address) to Swiss Post; nothing else.

## Spec Impact

- **Classification:** modify
- **ADD:** none
- **MODIFY:** FR-01.01 — localities more than 90 % outside Zug are rejected
  (AC9); FR-01.02 — suggestions from Post APIM via `/api/address`, border
  villages not offered; FR-01.08 — privacy text names what is sent and via
  whom; FR-01.10 — service runs on Bunny, origin rules incl. previews/own
  origin, total per-instance limit (best effort).
- **REMOVE:** none

## Out of Scope

- Moving the static site to Bunny, custom domain, settings migration (step 3).
- Deleting the Supabase cloud project, undeploying the old function, revoking
  the old Post credentials and removing Netlify's Supabase variables (manual
  follow-up after this merge — triage card with a deadline).
- Per-visitor rate limiting / Bunny Shield (step 3).
- Running Playwright in CI (triage card from step 1).
- Visual design changes.

## Design Notes

- One runtime-agnostic handler (`edge/address-lookup/handler.ts`,
  `(Request) → Response`, dependencies injected: env, fetch, clock, logger)
  is used by the Bunny entry (`main.ts`) and by a Vite dev-server plugin
  (loaded via `server.ssrLoadModule`). Bundled to one JS file by esbuild
  (`npm run build:edge`), SDK `@bunny.net/edgescript-sdk` pinned in the
  lockfile and bundled. Imports inside `edge/` are relative.
- Post query: parsed street → `street`, house number/appendix, typed postcode
  or the form's postcode or `63` prefix → `postcode4`, typed town → `city`;
  `postcodeFilterMode: DOMICILE`. Without a postcode Post returns ~100 Swiss
  results alphabetically, so the `63` prefix is required (probe 2026-10-21);
  if many results are cut off the user narrows by typing.
- Offered-locality rule lives once in `src/lib/municipality.ts`
  (`MAX_OUTSIDE_SHARE = 90`, `isOfferedLocality(postcode, town)`):
  `proposeMunicipality` treats non-offered localities as unknown (also in its
  postcode-only fallback); the service filters with the same function.
- Response contract `{ results: [{ street, houseNumber, houseNumberAddition,
  postcode, town }] }` replaces the old `QueryAutoComplete4Result` shape;
  React list keys come from street|houseNumber|postcode|town.
- Own origin comes from `new URL(request.url).origin`, never from forwarded
  headers. Production config carries no localhost origin.
- Token cache: single in-flight fetch shared by concurrent requests, cleared
  on failure; `AbortController` + `setTimeout` deadlines.
- Rate limit: fixed one-minute window per instance, total cap from a
  variable (default 600/min). Best effort: Bunny may run several instances.
- Deployment: `scripts/edge/deploy-address-lookup.mjs` (manual, reads
  `.env.local`, validates keys present): build, create script once (id +
  hostname recorded in `edge/address-lookup/bunny.json`), upsert
  secrets/variables, upload code, publish, smoke test (allowed Origin → 200,
  foreign → 403). Prints ids/hostnames/status only.
- `netlify.toml` holds only the proxy rule, commented as temporary until
  step 3. Order: deploy Bunny → check the PR deploy preview → merge.
  Rollback: republish the previous Bunny release, or revert `netlify.toml`.

## Affected Boundaries

- Browser → `/api/address` (same origin; Netlify proxy → Bunny; Vite dev
  middleware locally).
- Bunny script → Post OAuth token endpoint and APIM `/autocomplete`.
- Bunny Compute API (deploy script) ← `.env.local` `BUNNY_API_KEY`.
- Zug locality snapshot shared by browser validation and the service filter.

## Internal Plan Review

opus-plan-reviewer, severity high. Findings and resolution:
- 50 % rule silently excluded Sihlbrugg → asked the user; Sihlbrugg stays,
  threshold 90 %, per (postcode, town) (Decision 3).
- Per-client limit unreliable behind Netlify (forwarded IP spoofable) →
  total per-instance cap only (Decision 4), FR-01.10 reworded.
- Missing timeouts / single-flight failure handling → AC6 deadlines, design
  note on token cache.
- Logging could leak Post error text → AC5 fixed-message logging + test.
- Missed Supabase users (pdfGenerationService test, README, AGENTS.md,
  IMPROVEMENT_PLAN, SuggestionsList key, `STRID` type) → added to mini-plan.
- Credentials in bundle → AC3 post-build grep; dev plugin reads only
  `POST_APIM_*`, off under e2e (AC7).

## Internal Architecture Review

architecture-internal-reviewer: build option A (standalone Bunny script behind
the Netlify proxy), severity medium — rate-limit identity (resolved by
Decision 4) and origin wildcard breadth (resolved by the exact preview
pattern in AC5).

## External Plan Review

GLM: revise; GPT: revise. Both: rate-limit identity (→ Decision 4), strict
preview-origin pattern (→ AC5), timeouts and 401-retry bound (→ AC4/AC6),
safe logging (→ AC5), privacy text naming hosting providers (→ AC11),
deploy order and rollback (→ Design Notes). Rejected: parallel per-prefix
queries (630/631/633/634) — only if the AC1 probe fails.

## Architecture Review

GLM: approve; GPT: approve (option A). GLM suggested dropping the per-client
limit — adopted (Decision 4).
