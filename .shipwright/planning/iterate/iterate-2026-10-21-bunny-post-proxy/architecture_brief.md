# Architecture Brief: bunny-post-proxy

## The problem

The invoice app suggests addresses while the midwife types. Today the browser
calls a Supabase edge function, which reads old Swiss Post credentials from a
database table and calls Post's legacy `autocomplete4` interface. Post shuts
that interface down by 2027-09-30; its replacement (APIM Address Query) needs an
OAuth client secret that must never reach the browser. The owner is dropping
Supabase and Netlify for Bunny (static hosting + edge scripts) to stay under
€2/month. One active user, a few invoices a month.

## What already exists here

- Supabase edge function `address-lookup`: origin allow-list, body validation,
  per-IP and global rate limits backed by a Postgres function, Zug postcode
  filter from a table, street-name ranking.
- Since step 1 the app ships the official Zug locality snapshot
  (`src/data/zugLocalities.generated.ts`) and decides the municipality in the
  browser; Supabase is only used for the address lookup.
- Live site on Netlify; Bunny account being set up (step 3 moves the static
  site).

## What would newly, permanently exist

A small TypeScript service (~200 lines) deployed as a Bunny standalone Edge
Script: validates the request, gets/caches a Post OAuth token, calls APIM
autocomplete limited to `63xx` postcodes, keeps only localities that are mostly
in Zug (from the shipped snapshot), ranks and returns ≤ 10 results. Secrets live
as Bunny script secrets. A build script (esbuild) and a manual deploy script
(Bunny Compute API, key in the git-ignored `.env.local`). The same handler runs
inside the Vite dev server for local work. Until step 3, Netlify forwards
`/api/address` to the script via `netlify.toml`. The maintainer redeploys the
script by running one npm command.

## Options on the table

- **A:** Standalone Bunny Edge Script now, reached through a Netlify proxy rule
  (later attached to the Bunny pull zone in step 3).
- **B:** Keep the Supabase edge function, only migrating it to APIM (keeps the
  database and a second provider).
- **C:** Netlify Function (serverless) as the proxy, move it to Bunny later.
- **D:** Do nothing until step 3 and switch everything at once.
