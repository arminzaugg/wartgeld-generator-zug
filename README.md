[![Netlify Status](https://api.netlify.com/api/v1/badges/f9410406-bc69-4824-86c4-ecc236597275/deploy-status)](https://app.netlify.com/sites/wartgeld-generator-zug/deploys)

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

ATM we are running on Netflify using automatic builds and manual deploys.

## Future ideas

[x] use Swiss Post API to lookup addresses.

## Local development

```sh
npm ci
npm run dev        # http://localhost:8080
npm run lint       # ESLint, fails on warnings
npm run build      # typecheck + production build
npm test           # Vitest with coverage
```

## Address lookup service (`/api/address`)

Address suggestions come from the Swiss Post APIM Address Query API through a small service
(`edge/address-lookup/`) that runs on Bunny Edge Scripting. The Post client id/secret live only
as Bunny secrets and in the git-ignored `.env.local` (`POST_APIM_*`); they never reach the browser.
The service answers only the site's own origins (production, Netlify deploy previews, itself),
caps requests per minute and never logs addresses.

- **Locally:** `npm run dev` serves `/api/address` from the same code using `.env.local`.
  Without the `POST_APIM_*` values the lookup answers 503 and the app shows an error.
- **Live:** Netlify forwards `/api/address` to the Bunny service (`netlify.toml`) until the site
  itself moves to Bunny.

Deploy after changes (needs `BUNNY_API_KEY` and the `POST_APIM_*` values in `.env.local`):

```sh
npm run deploy:edge   # build, upload, set secrets/variables, publish, smoke test
```

Order for a change: deploy the service, check the PR deploy preview, then merge.
Rollback: republish the previous release in the Bunny dashboard
(Edge Scripting → wartgeld-address-lookup → Releases), or revert `netlify.toml`.
