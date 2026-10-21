# Mini-Plan: bunny-post-proxy

- **Run ID:** iterate-2026-10-21-bunny-post-proxy
- **Spec:** `.shipwright/planning/iterate/2026-10-21-bunny-post-proxy.md`

## Files

| File | Change |
|---|---|
| `edge/address-lookup/handler.ts` | new — origin/method/size (Content-Length first)/JSON checks, rate limit, parse search term, Post query, Zug filter, ranking (exact house number first), `{ results }`, `no-store`; deps injected |
| `edge/address-lookup/request.ts` | moved from `supabase/functions/address-lookup/request.ts`; origin rule: configured list + exact deploy-preview pattern + own origin; missing Origin rejected; request = `{ searchTerm, zipCode? }` |
| `edge/address-lookup/postClient.ts` | new — OAuth token cache (single flight, cleared on failure, refresh 30 s before expiry, one 401 retry), token 3 s / overall 8 s deadlines |
| `edge/address-lookup/rateLimit.ts` | new — fixed one-minute window, total cap per instance |
| `edge/address-lookup/sort.ts` | moved from supabase, field names adapted |
| `edge/address-lookup/main.ts` | new — Bunny entry: `BunnySDK.net.http.serve(createAddressHandler(env from process.env))` |
| `edge/address-lookup/bunny.json` | new (after first deploy) — script id + hostname (not secret) |
| `edge/address-lookup/__tests__/*.test.ts` | new — handler (incl. console spy: no bodies logged), request (negative origins: suffix, multi-label, http, port, `null`), postClient, rateLimit, sort (fetch mocked at the Post boundary) |
| `scripts/edge/build-address-lookup.mjs` | new — esbuild bundle (SDK bundled from npm) → `dist-edge/address-lookup.js` |
| `scripts/edge/deploy-address-lookup.mjs` | new — manual deploy via Bunny Compute API + smoke test; reads `.env.local`, never prints secrets |
| `src/lib/municipality.ts` | `MAX_OUTSIDE_SHARE = 90`, `isOfferedLocality(postcode, town)`; proposals (incl. postcode-only fallback) ignore non-offered localities |
| `src/services/api/addressService.ts` | `fetch('/api/address')`, map `{ results }` → `StreetSummary` |
| `src/types/address.ts` | drop the autocomplete4 types and `STRID`, add the response type |
| `src/components/StreetLookup/SuggestionsList.tsx` | key from street\|houseNumber\|postcode\|town |
| `src/integrations/supabase/*`, `supabase/**` | delete |
| `package.json` / lock | remove `@supabase/supabase-js`; add `@bunny.net/edgescript-sdk`, `esbuild` (dev); `build:edge`, `deploy:edge` scripts |
| `vite.config.ts` | dev plugin mounting the handler at `/api/address` via `ssrLoadModule` (`loadEnv`, `POST_APIM_*` only, off when `E2E=1`); drop supabase chunk |
| `vitest.config.ts` | include `edge/**/*.test.ts`, coverage includes `edge/**`, drop supabase |
| `playwright.config.ts` | web server with `E2E=1` |
| `netlify.toml` | new — only `/api/address` → Bunny 200 proxy, marked temporary |
| `src/pages/Info.tsx` | privacy text (Netlify + bunny.net → Swiss Post) |
| `e2e/municipality.spec.ts`, StreetLookup/addressService/pdfGenerationService tests | stub `/api/address` / fetch instead of the Supabase client |
| `src/__tests__/distNoSecrets.test.ts` (or build check) | `dist/` has no `POST_APIM` / `client_secret` / `supabase.co` |
| `README.md`, `AGENTS.md`, `docs/IMPROVEMENT_PLAN.md` | Supabase deploy notes → Bunny deploy/rollback notes |
| `.shipwright/planning/01-adopted/spec.md`, `CLAUDE.md`, `.gitignore` (`dist-edge/`) | FR-01.01/02/08/10 text + (E) criteria; WHAT/Stack lines |

## Work breakdown

1. **Offered-locality rule** — tests first: 8836 / 6417 / 6418 / 5642 →
   not offered, no proposal; 6340 Sihlbrugg offered with hint; 6340 Baar
   offered.
2. **Service core** — request validation (moved tests + strict origins),
   rate limiter, Post client (token reuse, expiry refresh, single flight,
   401 retry once, deadlines → 502), handler (filter, ranking, limit 10, 503
   without config, safe logging, no-store).
3. **Frontend** — addressService on `/api/address`; StreetLookup/pdf tests
   mock `fetch`; SuggestionsList key; e2e stub path; Supabase removal; Info
   text; dist secret check.
4. **Dev plugin** — Vite middleware; probe: real lookup via `npm run dev`
   with `.env.local` (AC1 incl. `Bahnhofstr 1` → 6300 Zug).
5. **Build + deploy tooling** — esbuild bundle; deploy script; first deploy
   (needs `BUNNY_API_KEY`); probe: real lookup against the Bunny hostname
   with an allowed / disallowed Origin.
6. **Netlify proxy** — `netlify.toml`; probe: PR deploy preview performs a
   real lookup through Netlify → Bunny → Post.
7. **Spec/docs** — FR rows + (E) criteria, CLAUDE.md, README/AGENTS,
   architecture note, Supabase-retirement triage card.

## Data model

No database. Supabase tables are no longer read by any code; the cloud project
is decommissioned manually afterwards.

## Test strategy

Vitest for service + frontend (fetch mocked at the Post / `/api/address`
boundary), Playwright for the browser journey (stubbed lookup, dev service
off), plus three empirical probes against real Post APIM (dev server, Bunny
direct, Netlify preview). Full suite + lint + typecheck + build + build:edge
at F0. CI gets no new step in this change (avoids a CI supply-chain change);
`build:edge` runs locally and in the deploy script.

## Alternative approach (rejected)

- **Bunny middleware script on the future pull zone, same origin only** — the
  natural end state for step 3, but today the site is on Netlify; a standalone
  script reachable through the Netlify proxy works now and can be attached to
  the pull zone later without code changes (the handler is the same).
- **Keep calling Post directly from the browser** — impossible: the OAuth
  client secret would ship to every visitor.
- **Per-visitor limit via Netlify signed proxy (X-Nf-Sign)** — works, but
  needs an extra Netlify secret and is thrown away in step 3 (user chose the
  total cap).
- **Bunny Shield rate limiting** — needs a pull zone; step 3.
