# Improvement plan: findings 1–5

Branch: `claude/adoring-allen-imnhi9`, with one commit per step so each can be reviewed and reverted on its own.
Steps are ordered so tooling is fixed first. Every later step can then be checked with `npm run lint && npm test && npm run build`.

---

## Step A: Tooling and CI (finding 3)

Goal: lint, tests and build are green locally and enforced in CI.

1. **Lint script:** change `"lint"` in `package.json` to `eslint .` (ESLint 9 flat config rejects `--ext`).
2. **Lint errors (13) and warnings (11):**
   - Replace `any` in `addressService.ts`, `StreetLookup*`, `supabaseMock.ts` and the factories with proper types (`StreetSummary`, a small `PostAutocompleteItem` type).
   - Replace the `require()` in a test with an `import`.
   - Remove the 3 unused `eslint-disable` directives.
   - Fix the `react-hooks/exhaustive-deps` warnings in `StreetLookup` properly (wrap `onAddressChange` in `useCallback` in `Index.tsx`, add the deps).
   - The shadcn `ui/*` files (`react-refresh/only-export-components`, `no-empty-object-type`) are vendored code. Relax these two rules for `src/components/ui/**` in `eslint.config.js` rather than editing the files.
3. **Failing tests (3):**
   - `Index.unit.test.tsx` / `Index.integration.test.tsx` look for the heading "Hebammenwartgeld Kanton Zug", but the page renders "Wartgeld Generator". Update the tests to the real heading, and merge the two near-identical files into one.
   - `presetStorage.unit.test.ts` › "preserves existing signature" is a **real bug**: `saveSenderInfo(info, ort)` wipes the stored signature. Fix `saveSenderInfo` so that `signature === undefined` keeps the existing one and `null` clears it. `SignaturePad` already passes `null` to clear, so change `Settings.handleSaveSignature` to pass `null` through instead of `signature || undefined`.
4. **CI (`.github/workflows/test.yml`):**
   - Add `npm run lint` and `npm run build` steps before tests. `build` runs `tsc` too.
   - Drop the redundant `actions/cache@v3` step, since `setup-node` already caches npm.
   - Only run on `push` to `main` plus `pull_request`, so pushes to a PR branch don't trigger duplicate runs.
5. **Repo hygiene:**
   - `git rm -r --cached coverage/` and add `coverage/` to `.gitignore`.
   - Delete `bun.lockb`. CI and Netlify use npm, so `package-lock.json` stays.
   - Move test-only packages (`vitest`, `@vitest/coverage-v8`, `@testing-library/*`, `@types/jest`, `jsdom`, `@vitejs/plugin-react`) to `devDependencies`.
   - Rename the package to `wartgeld-generator-zug`.

After this, make "Run Tests" a required check on `main` in GitHub branch protection. That's a manual setting.

---

## Step B: Dead-code cleanup (finding 4)

Remove after confirming no imports with `grep`, then run lint, tests and build:

| Remove | Reason |
|---|---|
| `src/components/StreetLookup/StreetLookup.tsx`, `StreetLookup/index.tsx` (empty), `StreetLookup/StreetSuggestionsList.tsx`, `StreetLookup/HouseNumbersList.tsx` | Duplicate of `src/components/StreetLookup.tsx`, which is the one in use. Keep `StreetInput` and `SuggestionsList`. |
| `src/components/AddressFields.tsx`, `src/components/FormFields.tsx`, `FormFields.test.tsx` | Replaced by `src/features/form/components/*`. Move any useful assertions from `FormFields.test.tsx` into a `FormContainer` test first. |
| `src/components/ZipLookup.tsx`, `src/hooks/useZipAutocomplete.ts`, `addressService.lookupZip`, `addressService.getPlzMapping` | Unused |
| `src/lib/mockData/*` | Unused |
| Preset API in `presetStorage.ts` (`Preset`, `savePreset`, `getPresets`, `deletePreset`) and its tests | Unused. Keep the settings functions. |
| `hasViewedSettings` in `Index.tsx` | Read but never used |
| 32 unused `src/components/ui/*` files (accordion, alert-dialog, aspect-ratio, avatar, badge, breadcrumb, calendar, carousel, chart, collapsible, command, context-menu, dialog, drawer, form, hover-card, input-otp, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, select, separator, sheet, skeleton, slider, switch, table, tabs, toggle, toggle-group) | Never imported outside `ui/` |
| Their npm deps (the matching `@radix-ui/*`, `recharts`, `embla-carousel-react`, `vaul`, `input-otp`, `cmdk`, `react-day-picker`, `react-resizable-panels`, `react-hook-form`, `@hookform/resolvers`, `zod`, `@supabase/auth-*`, `@tanstack/react-query` if the `QueryClientProvider` is removed too, `sonner` if only one toaster is kept) | Remove only what `npx depcheck` confirms is unused after the file deletions |

Also:
- Extract the duplicated base64 → Blob code in `FormActions.tsx` into a `dataUriToBlob()` helper in `src/lib/pdf.ts`.
- Keep a single toast system (`use-toast` + `<Toaster />`) and drop `<Sonner />`, which isn't used by any caller.
- Lazy-load `jspdf` with `await import('jspdf')` inside `generatePDF` to get the main bundle under 500 kB.

**Stretch:** turn on `strict: true` in `tsconfig.app.json` and fix the ~9 errors. This is its own commit, and I'll drop it if it grows.

---

## Step C: Correctness (finding 2 + edge-function sort bug)

1. **Generate the PDF once per submit:**
   - `FormContainer.handleSubmit` currently calls `pdfGenerationService.generatePDF(values)`, throws the result away, then `Index.handleGeneratePDF` generates it again.
   - Change `onSubmit` to `onSubmit: () => Promise<void>`: `FormContainer` validates, sets `isSubmitting`, and `await`s `onSubmit()`. `Index` does the one generation and owns the error toast. This also removes the duplicate toast code.
2. **Fetch administration data once:** `pdfGenerationService` fetches `getAdministrationData(plz)` and then `generatePDF` fetches it again. Pass the fetched `administration` into `generatePDF(data, administration)` and drop the second lookup and the unused `gemeinde` field.
3. **Merge `pdfUrl` and `pdfData`** in `Index.tsx`. They are always the same value, so keep one state.
4. **Edge-function sort:** fix the comparator at `supabase/functions/address-lookup/index.ts:129` (`!exactMatchA && exactMatchB`). Also remove the conflicting client-side re-sort in `addressService.lookupStreet`, which sorts *longer* names first. The server order is the one we want.
5. **Tests:**
   - A `FormContainer` test asserting `generatePDF` is called exactly once per submit.
   - A test that `generatePDF` doesn't call `getAdministrationData`.
   - A unit test for the extracted sort comparator. Move it to a small pure module so Vitest can import it.

---

## Step D: UX fixes (finding 5)

1. **PLZ validation:**
   - In `formValidationService.validateForm`, require `plz` as 4 digits (`/^\d{4}$/`) with the error "Bitte wählen Sie eine Adresse aus der Liste (PLZ fehlt)".
   - In `pdfGenerationService`, catch the "No municipality found for PLZ" case from `getAdministrationData`. Make it a typed error (`UnknownPlzError`) so `Index` shows "Für PLZ 1234 ist keine Gemeinde im Kanton Zug hinterlegt" instead of the generic message.
   - Add tests for both.
2. **Settings date field:**
   - Today `selectedDate` is never used, and the PDF always prints today's date.
   - **Proposed:** wire it up. Store `rechnungsDatum` in settings (empty = today), show "leer = heute" as a hint, and use it in `pdfGenerator` for the "Ort, Datum" line.
   - The alternative is to delete the field (see open questions).
3. **German-only UI text:** "Validation Error" → "Ungültige Eingaben", "Error" → "Fehler", "Success" / "Settings saved successfully" → "Gespeichert" / "Einstellungen wurden gespeichert". A `grep` over `toast(` finds every call.
4. Small cleanup: the Settings labels use `text-gray-700`, which is unreadable in dark mode. Use the shadcn `<Label>` instead.

---

## Step E: Secure the `address-lookup` edge function (finding 1)

Today anyone can call `https://kdyultegduvfggjovban.supabase.co/functions/v1/address-lookup` and spend the Swiss Post quota.

1. **Validate input:**
   - Reject non-POST requests, bodies over ~1 KB, a `searchTerm` that isn't a 2–100 char string, and a `type` outside `street|zip|city`.
   - Return 400 with a generic message.
2. **Restrict origins:**
   - Replace `Access-Control-Allow-Origin: *` with an allowlist read from an env var `ALLOWED_ORIGINS` (e.g. `https://wartgeld-generator-zug.netlify.app,http://localhost:8080`).
   - Echo the origin only if it's allowed, and reject other `Origin`s with 403.
   - This stops other websites from using the endpoint from a browser. It doesn't stop `curl`, so rate limiting is still needed.
3. **Rate limiting:**
   - Add a table `address_lookup_rate_limit(ip text, window_start timestamptz, count int)` plus a `security definer` SQL function `check_rate_limit(ip, max, window)` that increments atomically.
   - Allow about 60 requests per IP per minute (IP from `x-forwarded-for`), and return 429 above that.
   - This goes in as a migration in `supabase/migrations/`.
4. **JWT:**
   - Set `verify_jwt = true`. `supabase.functions.invoke` already sends the anon key, so the frontend keeps working.
   - The anon key is public, so this only blocks unauthenticated drive-by calls. Steps 2 and 3 do the real work.
5. **Logging:** remove the `console.log` calls that dump request and response bodies (addresses). Log only the status, result count and duration.
6. **Performance side-fix:** the function loads allowed ZIP codes and Post credentials from the DB on every request. Cache both in module scope with a short TTL of about 10 minutes.

**Deploy:** I can't deploy from this session because there's no Supabase CLI login. After merge, run `supabase db push`, `supabase secrets set ALLOWED_ORIGINS=...`, then `supabase functions deploy address-lookup`. I'll put the exact commands in the PR description.

---

## Open questions

1. **Production URL(s)** for the CORS allowlist: is it only `https://wartgeld-generator-zug.netlify.app`, or is there a custom domain?
2. **Settings date field:** wire it up (my recommendation) or remove it?
3. **Rate limit:** is about 60 lookups/minute per IP OK? A midwife typing an address makes about 5–15 requests.
4. **Strict TypeScript** (the stretch goal in Step B): include it in this branch or leave it for later?

## Verification per step

- `npm run lint && npm test && npm run build` is green after every commit.
- Manual check with the `run` skill (Playwright against `npm run dev`): fill in the form, generate the PDF, confirm one generation in the network log, and check Print and Save.
- For step E: `curl` from a foreign Origin → 403, 100 rapid calls → 429, normal app usage still works. This can only be checked after deploy.
