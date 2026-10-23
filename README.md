# Welcome to Wartgeld Generator Zug

This is a simple webapp to input form data and get a Wartgeld Rechnung for Kanton Zug. This page is dedicated to the hardworking midwifes in the Kanton Zug.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Loveable
- Swiss Post API

## How can I deploy this project?

The app runs on Bunny at **https://wartgeld.nidea.ch** (static files in a Bunny storage zone
behind a pull zone). Publish with:

```sh
npm run deploy:site   # build + secret check, upload (index.html last), purge, smoke test
```

It needs `BUNNY_API_KEY` in `.env.local`, refuses uncommitted changes and branches other than
`main` (`--from-branch` to override). Rollback: run `deploy:site` from the previous commit
(earlier assets are never deleted). The Bunny resources were set up once by hand; ids, edge
rules, the per-visitor limit and a re-create checklist are in
[docs/bunny-hosting.md](docs/bunny-hosting.md).

The old Netlify site (wartgeld-generator-zug.netlify.app) still works and shows a notice that
the app has moved; it is the fallback until it forwards to the new address.

## Future ideas

[x] use Swiss Post API to lookup addresses.

## Local development

Requires Node 22.12 or newer (`.nvmrc`).

```sh
npm ci
npm run dev        # http://localhost:8080
npm run lint       # ESLint, fails on warnings
npm run build      # typecheck + production build
npm test           # Vitest with coverage, fails below 80%
```

## Address lookup service (`/api/address`)

Address suggestions come from the Swiss Post APIM Address Query API through a small service
(`edge/address-lookup/`) that runs on Bunny Edge Scripting. The Post client id/secret live only
as Bunny secrets and in the git-ignored `.env.local` (`POST_APIM_*`); they never reach the browser.
The service answers only the site's own origins (wartgeld.nidea.ch, the old Netlify site and its
deploy previews, itself), caps requests per minute and never logs addresses. Bunny Shield limits
each visitor to 50 lookups per 10 seconds (see docs/bunny-hosting.md).

- **Locally:** `npm run dev` serves `/api/address` from the same code using `.env.local`.
  Without the `POST_APIM_*` values the lookup answers 503 and the app shows an error.
- **Live:** on wartgeld.nidea.ch an edge rule sends `/api/address` to the Bunny service; the old
  Netlify site forwards it there too (`netlify.toml`).

Deploy after changes (needs `BUNNY_API_KEY` and the `POST_APIM_*` values in `.env.local`):

```sh
npm run deploy:edge   # build, upload, set secrets/variables, publish, smoke test
```

One Bunny script serves production and all deploy previews, so a deploy changes the live
site at once. The script refuses uncommitted changes and branches other than `main`
(`npm run deploy:edge -- --from-branch` to check a PR's deploy preview before merging).
Rollback: run `deploy:edge` from the previous commit (variables such as the allowed origins
are set by the script, not stored per release); republishing the previous release in the Bunny
dashboard (Edge Scripting → wartgeld-address-lookup → Releases) restores only the code. Do not just remove the
`netlify.toml` rule: the app calls `/api/address`, so every lookup would fail.
