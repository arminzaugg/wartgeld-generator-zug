# Conventions — nidea-invoice

## Linter / Formatter

- **Linter**: eslint-flat
- **Formatter**: _none detected_
- **TypeScript strict**: no
- **.editorconfig**: _none_

## Project-specific rules

TypeScript in strict mode (tsconfig.app.json) with React 18 function components and hooks; the `@/` import alias maps to `src/`. ESLint 9 flat config with react-hooks and react-refresh plugins, run with `--max-warnings 0`; two rules are relaxed only for the vendored shadcn files under `src/components/ui/`. No formatter config is checked in; existing code uses double quotes in components and mostly single quotes in services and lib. All user-facing text is German (Swiss spelling, e.g. 'ss' instead of 'ß'); code identifiers are English except domain fields that mirror the invoice (vorname, nachname, plz, ort, geburtsdatum, rechnungsDatum). Supabase access is confined to `src/services` and `src/lib`; components never call Supabase directly. Errors are surfaced to the user with the shared toast (`use-toast`) in German. Tests use Vitest with jsdom and Testing Library, live next to the code in `__tests__/` folders, and use factories in `src/lib/__tests__/factories`; edge-function logic that needs testing is extracted into pure modules (request.ts, sort.ts) with sibling tests. Commits follow Conventional Commits (feat/fix/refactor/chore/docs). CI must stay green on lint, build and tests before merge.

## Commit messages

- Use Conventional Commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`
- Scopes should reflect module boundaries (e.g., `feat(auth): ...`)

## Files

- Keep files under 300 lines; split larger modules.
- Tests live alongside implementation with `.test.*` / `_test.*` suffix OR in a `tests/` directory — whichever is consistent with the rest of the codebase.

## Convention Updates

- **iterate-2026-10-22-redesign-papier-tanne** (2026-10-22): Convention — colours only via the "Papier & Tanne" tokens in `src/index.css` (channels as `hsl(var(--x))`, rgba tokens as `var(--x)`), fields share `ui/field-styles.ts`, fonts are bundled (`@fontsource`), and `index.html` loads nothing from other hosts (guarded by `src/styles/__tests__/theme.test.ts`). → decision_log.md (ADR via Run-ID: iterate-2026-10-22-redesign-papier-tanne)
- **iterate-2026-10-22-redesign-invoice-page** (2026-10-22): Convention — the phone layout is decided once in `Index` (`useIsPhone`, breakpoint 767.98px = Tailwind `md`) and passed down as `isPhone`; a generated invoice is a snapshot (`GeneratedInvoice`) and any async result is checked against the `generation` counter before it is shown. In-page jumps use buttons + `focus()`, never `#` links (HashRouter). → decision_log.md (ADR via Run-ID: iterate-2026-10-22-redesign-invoice-page)
- **iterate-2026-10-22-redesign-settings-info** (2026-10-22): Convention — settings writes merge onto the raw stored record (no defaults) and fire `SETTINGS_CHANGED_EVENT` after a successful write; "what was really saved" reads `getStoredSettings()`/`useSetupStatus()`, never `getSettings()` (PDF defaults). The theme rule lives in `index.html` and `ThemeProvider` and must change together. → decision_log.md (ADR via Run-ID: iterate-2026-10-22-redesign-settings-info)

## Learnings

- (2026-10-21) iterate — Swiss Post town names equal the official locality names, but Post's canton field differs at the border (8836 Bennau = SZ): filter Zug addresses by the locality snapshot, not by Post's canton. [→ ADR iterate-2026-10-21-zug-municipality-data]
- (2026-10-21) iterate — Swiss Post APIM `/autocomplete` lists parcel points as streets (`PickMup …`, `MP …`) even with DOMICILE filtering; Bunny returns script hostnames with `https://` and presents `no-store` as `no-cache`. [→ ADR iterate-2026-10-21-bunny-post-proxy]
