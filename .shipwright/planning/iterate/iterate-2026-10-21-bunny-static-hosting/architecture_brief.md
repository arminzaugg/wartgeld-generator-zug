# Architecture Brief: bunny-static-hosting

## The problem
The invoice app (one regular user, a midwife) is a static React site on Netlify; its address lookup already runs as a Bunny Edge Script that Netlify forwards to. Hosting should move to Bunny under the user's own domain (wartgeld.nidea.ch) within a budget under €2/month, the lookup needs a per-visitor limit, and browser tests should run in CI. Settings live in browser storage tied to the web address, so they must be carried over.

## What would newly, permanently exist
- A Bunny storage zone + pull zone for the site, a custom hostname/DNS record, edge rules (cache, headers, routing /api/address), a Shield zone with one per-IP rate-limit rule.
- A manual deploy script that creates/updates those resources idempotently and uploads the build.
- A settings export/import feature (JSON file) on the settings page.
- A Playwright step in the existing CI workflow.

## Options
1. Pull zone with storage-zone origin; an edge rule sends /api/address to the existing standalone address script.
2. Pull zone with storage-zone origin plus a middleware script that answers /api/address itself (same handler code as the standalone script).
3. Keep the site on Netlify, only point the custom domain at Netlify; add per-visitor limiting in the address script itself.
4. Make the standalone edge script serve the static files as well as /api/address (no storage zone).
