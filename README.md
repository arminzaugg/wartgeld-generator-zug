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

## Supabase: `address-lookup` edge function

The function proxies the Swiss Post autocomplete API. It only answers requests from allowed origins,
requires the anon JWT (`verify_jwt = true`), and is rate limited per client IP and globally
(see `supabase/migrations/*_address_lookup_rate_limit.sql`).

Deploy after changes (requires the Supabase CLI and access to the project):

```sh
supabase link --project-ref kdyultegduvfggjovban
supabase db push                                    # creates the rate-limit table and function
supabase secrets set ALLOWED_ORIGINS="https://wartgeld-generator-zug.netlify.app,http://localhost:8080"
# optional: RATE_LIMIT_PER_MINUTE (default 60), RATE_LIMIT_GLOBAL_PER_HOUR (default 3000)
supabase functions deploy address-lookup
```

Deploy in this order: the function calls `check_rate_limit`, so the migration must exist first.
