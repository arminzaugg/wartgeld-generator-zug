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
