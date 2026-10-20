# Architecture — nidea-invoice
<!-- shipwright:architecture v=2 last-sync=49c0ddaa837e1a13c067188022b8db4f627aa448 -->

## System Overview

```
┌────────────────────────────── Browser (Netlify static SPA) ──────────────────────────────┐
│                                                                                          │
│  ┌──────────────┐   ┌──────────────────┐   ┌──────────────┐                              │
│  │  #/  Index   │   │ #/settings       │   │  #/info      │      HashRouter (App.tsx)    │
│  │  invoice form│   │ issuer details,  │   │  about,      │                              │
│  │  + preview   │   │ date, signature  │   │  privacy     │                              │
│  └──────┬───────┘   └────────┬─────────┘   └──────────────┘                              │
│         │                    │                                                           │
│  ┌──────▼───────────────┐    │       ┌──────────────────────────┐                        │
│  │ features/form/*      │    │       │ lib/presetStorage        │                        │
│  │ FormContainer        │    └──────▶│ getSettings/updateSettings│──▶ localStorage       │
│  │ StreetLookup         │            └────────────▲─────────────┘   (form-settings,      │
│  └──┬────────────┬──────┘                         │                  app-theme)          │
│     │            │ submit (validated)             │                                      │
│     │ typing     ▼                                │                                      │
│     │   ┌────────────────────────┐   ┌────────────┴───────────┐                          │
│     │   │ services/pdf           │──▶│ lib/pdfGenerator       │──▶ PDF data URI          │
│     │   │ pdfGenerationService   │   │ (jsPDF, lazy-loaded)   │    preview/print/save    │
│     │   └──────────┬─────────────┘   └────────────────────────┘                          │
│     │              │ getAdministrationData(plz)                                          │
│     ▼              ▼                                                                     │
│  ┌──────────────────────────────────────────────┐                                        │
│  │ integrations/supabase/client (anon key)      │                                        │
│  └──────┬───────────────────────────┬───────────┘                                        │
└─────────┼───────────────────────────┼────────────────────────────────────────────────────┘
          │ functions.invoke          │ REST select
          ▼                           ▼
┌──────────────────────────── Supabase project ────────────────────────────────────────────┐
│                                                                                          │
│  ┌───────────────────────────────────┐      ┌──────────────────────────────────────┐     │
│  │ Edge function: address-lookup     │      │ Postgres                             │     │
│  │  1. origin allow-list (403)       │      │  plz_mappings                        │     │
│  │  2. body validation (400/413)     │─────▶│  administration_addresses            │     │
│  │  3. rate limit per IP + global    │ rpc  │  cantons, canton_zip_codes           │     │
│  │     (429)                         │      │  api_credentials                     │     │
│  │  4. filter to Zug PLZ, rank       │      │  check_rate_limit() + rate table     │     │
│  └───────────────┬───────────────────┘      └──────────────────────────────────────┘     │
└──────────────────┼───────────────────────────────────────────────────────────────────────┘
                   │ HTTPS Basic auth
                   ▼
        ┌──────────────────────────────────┐
        │ Swiss Post autocomplete4 API     │
        └──────────────────────────────────┘
```

## Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | react, react-dom, vite | — |
| Backend | — | — |
| Database | @supabase/supabase-js | — |
| Auth | — | — |
| Runtime | typescript | — |

## Layers Detected

- **data**: `supabase`
- **docs**: `docs`
- **domain**: `src/lib`, `src/services`
- **presentation**: `src/components`, `src/pages`


## Key Architecture Decisions

See `decision_log.md` for detailed ADRs. Profile-level decisions (stack, auth pattern, DB strategy, folder structure) are defined by the stack profile (`generic`).

## Data Flow

The product is a static React single-page app (Vite build, hash-based routing with three pages: form, settings, info) served from Netlify. All patient data lives only in React state for the current invoice; issuer settings (sender block, place, fixed invoice date, signature image) and the theme preference live in the browser's localStorage. The invoice PDF is rendered entirely in the browser with jsPDF, which is loaded on demand.

Two things reach Supabase. (1) Address suggestions: the StreetLookup component, via a TanStack Query hook and addressService, invokes the `address-lookup` edge function with the anon key. The Deno function checks the origin allow-list, validates the request body, applies per-IP and global fixed-window rate limits through the `check_rate_limit` SQL function, loads the Zug postcode list and the Swiss Post credentials from the database (cached per instance for 10 minutes), calls the Swiss Post autocomplete4 API, filters results to Zug postcodes and ranks them by street-name match. (2) Invoice recipient: on submit, pdfGenerationService resolves the postcode through the `plz_mappings` table to a municipality and its administration postcode, then reads that municipality's row from `administration_addresses`, and passes it into the PDF renderer. An unknown postcode raises a typed UnknownPlzError shown to the user.

Layering: pages (src/pages) compose feature components (src/features/form, src/components), which call domain services (src/services, src/lib) that are the only code touching Supabase or localStorage. shadcn/ui primitives live in src/components/ui and are treated as vendored code. CI (GitHub Actions) runs lint, typecheck+build and Vitest with coverage on every PR and on main.

## See also

_Existing user-facing documentation discovered by /shipwright-adopt._

- [`README.md`](../../README.md)
