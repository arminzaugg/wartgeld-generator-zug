# ADR-002 — refactor: share PDF blob helper, split bundle, enable strict TypeScript

- **Status**: accepted (retroactive, llm-inferred)
- **Date**: 2026-10-20
- **Commit**: `7ac7ddc03da91f596cdb9bc61323572d3ce16e2f`

## Context

The initial JavaScript bundle was about 900 kB, above Vite's 500 kB chunk warning, because jsPDF, the secondary pages and all vendor code shipped in one chunk. Base64-to-Blob conversion for print and save was duplicated, and TypeScript ran in non-strict mode, hiding type errors.

## Decision

Load jsPDF and the Settings and Info pages on demand, split react/react-dom/react-router-dom and supabase-js into their own long-lived vendor chunks, extract a shared dataUriToBlob helper, and enable TypeScript strict mode.

## Consequences

Initial JS dropped to about 520 kB with no chunk over 500 kB, and vendor chunks cache across deploys. The first PDF generation and the first visit to Settings or Info incur an extra network fetch. New code must type-check under strict mode, which `npm run build` enforces in CI.
