# Mini-Plan: redesign-papier-tanne (part 1 — theme and fonts)

- **Run ID:** iterate-2026-10-22-redesign-papier-tanne
- **Spec:** `.shipwright/planning/iterate/2026-10-22-redesign-papier-tanne.md`

## 1. Files

| File | Change |
|---|---|
| `package.json` / lock | add `@fontsource/newsreader`, `@fontsource/instrument-sans` (5.3.0, OFL) |
| `src/main.tsx` | import Latin CSS: Newsreader 500 / 500-italic, Instrument Sans 400/500/600 |
| `src/index.css` | replace `:root` / `.dark` tokens with Papier & Tanne values (HSL channels, one decimal), add new tokens (field, foreground-secondary, check, primary-hover, selected, destructive-soft, warning-*, danger-ring, scrim, shadows); base layer: body `font-sans`, `h1, h2 { font-serif font-medium }` |
| `tailwind.config.ts` | channel colours via `hsl(var(--…))` (drop `#2563eb`/`#64748b`), `ring`/`danger-ring`/`scrim` via `var(--…)`, radius sm/md/lg/xl/2xl 6/10/12/16/24, `boxShadow` card/pop/paper/btn, `fontFamily` sans/serif with fallbacks |
| `index.html` | remove `cdn.gpteng.co` script and "GPT Engineer" description/author meta (replace with a real description) |
| `src/components/ui/button.tsx` | variants per mapping; `size.default` = h-12 px-6; focus-visible 2px bg + 4px primary (no `ring-ring`); destructive `text-white`; names unchanged |
| `src/components/ui/input.tsx`, `textarea.tsx` | h-12 px-4 text-base rounded-md bg-field border-input; focus border-primary + 4px ring; `aria-invalid` → destructive border + danger ring |
| `src/components/ui/checkbox.tsx` | 22×22, rounded-sm, border-check, checked bg-primary |
| `src/components/ui/card.tsx` | rounded-xl, shadow-card, CardTitle font-serif font-medium |
| `src/components/ui/alert.tsx` | rounded-lg, no side bar; add `accent` and `warning` variants, `destructive` = destructive-soft surface |
| `src/components/ui/toast.tsx` | bg-popover rounded-lg shadow-pop; destructive = destructive-soft |
| `src/components/ui/tooltip.tsx` | bg-foreground text-background text-xs rounded-md |
| `src/components/ui/dropdown-menu.tsx` | bg-popover shadow-pop rounded-lg, items h-11 |
| `src/features/form/components/FormActions.tsx` | drop the four `h-11` overrides (class-only) |
| `src/pages/Index.tsx`, `src/pages/Info.tsx` | drop `font-bold` on the `h1`, `font-semibold` on Info `h2`s (class-only) |
| `src/pages/Settings.tsx`, `src/features/form/components/FormContainer.tsx` | drop `font-bold`/`font-semibold` on `h1`/`h2` (class-only; found during build) |
| `src/styles/__tests__/theme.test.ts` | new — token sheet ↔ `index.css` exact (hex round-trip), open tokens as decided, config has no hex, channel vs `var()` forms, `index.html` has no external script/link |
| `e2e/theme.spec.ts` | new — AC1, AC2, AC4 (`document.fonts.check`), AC5, AC6 (start page contacts only the app origin) |
| `.shipwright/planning/01-adopted/spec.md` | FR-01.08 / FR-01.09 AC lines |

## 2. Work breakdown

1. **Tests first:** `theme.test.ts` and `e2e/theme.spec.ts`. All fail.
2. **Tokens:** generate HSL channels from the hex table (one-off script, one decimal), paste into `index.css`; update `tailwind.config.ts`. Token unit tests green.
3. **Fonts + head:** install packages, imports in `main.tsx`, `fontFamily`, base layer; clean `index.html`.
4. **Primitives:** restyle the `ui/*` files, keeping every export, prop and variant name; remove caller overrides.
5. **E2E:** full Playwright suite on the dev server; `npm run lint`, `npm run build` (includes typecheck), `npm run test`; bundle size check.
6. **Spec update** (FR-01.08 / FR-01.09) and finalization.

## 3. Component hierarchy
Unchanged — only class names inside the existing primitives and four callers. No new components.

## 4. Data model
None.

## 5. Test strategy
- Unit (Vitest): pure file reads (jsdom does not compute Tailwind CSS) — tokens, config, `index.html`.
- E2E (Playwright, Chromium): computed colours/fonts/sizes light + dark (dark persisted across reload, FR-01.09);
  fonts are same-origin, so `document.fonts.load` + `check` proves real loading; a request listener on the start
  page asserts every request goes to the app origin. Buttons read with the mouse moved away.
- Existing suites unchanged as the no-functional-change guard (AC7).
- Performance (touches_build): bundle/asset size after `npm run build` (fonts ≈ 100–150 KB woff2, lazy per face).

## 6. Alternative considered
**Load the fonts from Bunny Fonts** (`fonts.bunny.net` stylesheet link). No font files in the repo, but adds a
permanent outside host on every page view, a privacy-text obligation, a CSS-injection surface and a test
dependency on an outside server. **Rejected:** every reviewer recommended bundling and the user agreed (2026-10-22).

**Hex tokens instead of HSL channels** (`--primary: #1F5C4E`, colours as `var(--primary)`).
Simpler to read against the token sheet, but breaks Tailwind opacity modifiers (`bg-primary/90`,
`border-destructive/50`) used by the shadcn primitives. **Rejected.**
