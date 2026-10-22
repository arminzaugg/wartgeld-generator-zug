# Redesign handoff: Richtung A, "Papier & Tanne"

Source of truth: Claude Design project "Wartgeld Generator Zug"
(https://claude.ai/design/p/c5c682af-0879-4b6a-9a2c-03db6a805709), pulled 2026-10-22.

| Remote file | Content |
|---|---|
| `templates/wartgeld-tokens/WartgeldTokens.dc.html` | Token sheet (distilled below) |
| `templates/wartgeld-screens/WartgeldScreens.dc.html` | Overview of all screens and states, light + dark |
| `templates/wartgeld-screens/InvoiceDesktop.dc.html`, `InvoiceMobile.dc.html` | Invoice page, states: leer, autocomplete, fehler, generieren, bereit |
| `templates/wartgeld-screens/SettingsScreen.dc.html` | Settings, states: unvollstaendig, fertig (desktop + mobile) |
| `templates/wartgeld-screens/InfoScreen.dc.html` | Information page |
| `templates/wartgeld-screens/Wg*.dc.html` | Parts: WgHeader, WgField, WgService, WgPrivacy, WgPdf, WgSpecimens |
| `templates/wartgeld-directions/*` | The three explored directions (A chosen; B/C reference only) |

Fetch the screen files with `DesignSync get_file` when implementing each screen.

## Guardrails (from the brief)

- **No functional change**: same fields, validation rules, address lookup, PDF generation, print/download, settings storage, routes.
- German only, Swiss spelling. The PDF invoice layout is out of scope; the PDF stays white in dark mode.
- **Fonts must be self-hosted** (e.g. `@fontsource-variable/newsreader`, `@fontsource/instrument-sans`). The design references Google Fonts, but loading them would send visitors' IPs to Google. That contradicts the privacy promise that only street text leaves the browser.

## Tokens (`:root` / `.dark`)

The design ships hex values. Keep the shadcn variable names where they exist so components keep working, and add the new ones.

| Variable | Tailwind | Light | Dark | Use |
|---|---|---|---|---|
| `--background` (design `--bg`) | background | #F6F3EC | #121513 | Page (paper) |
| `--header` | header | #FBF9F5 | #161A18 | Header, mobile action bar |
| `--card` | card | #FFFFFF | #1A1E1C | Cards |
| `--popover` (design `--raised`) | popover | #FFFFFF | #232825 | Dropdown, suggestions, toast, sheet |
| `--field` | field | #FFFFFF | #151917 | Input/Textarea/outline button bg |
| `--muted` (design `--well`) | muted | #EFEBE2 | #0E110F | Preview well, skeleton, ghost hover |
| `--foreground` (design `--fg`) | foreground | #1E2320 | #ECE8DF | Main text |
| `--foreground-secondary` (`--fg-2`) | foreground-secondary | #4F5650 | #C4C7BE | Secondary text, ghost buttons |
| `--muted-foreground` | muted-foreground | #5F665F | #A2A79E | Help, placeholder, meta |
| `--border` | border | #E3DDD1 | #2D332F | Hairlines |
| `--input` | input | #D8D1C3 | #3A413C | Field border |
| `--check` | checkbox-border | #A9A397 | #5C635D | Empty checkbox border |
| `--primary` | primary | #1F5C4E | #86C9B3 | Fir green: main action, focus, selection |
| `--primary-hover` | primary-hover | #184A3F | #9DD5C2 | |
| `--primary-foreground` | primary-foreground | #FFFFFF | #0E1F1A | |
| `--accent` | accent | #E3EEE8 | #1B2C26 | Privacy band, badges, active suggestion |
| `--accent-foreground` | accent-foreground | #1A4D41 | #B7E0D2 | |
| `--selected` (`--sel`) | selected | #F2F7F4 | #18261F | Selected service row |
| `--ring` | ring | rgba(31,92,78,.22) | rgba(134,201,179,.28) | 4px focus halo |
| `--destructive` (`--danger`) | destructive | #B42318 | #F2877A | Error border/text |
| `--destructive-soft` | destructive-soft | #FBEAE7 | #361C19 | Error summary |
| `--destructive-foreground` | destructive-foreground | #8A1C13 | #FFC9C1 | Text on error surface |
| `--danger-ring` | — | rgba(180,35,24,.14) | rgba(242,135,122,.22) | Error focus halo |
| `--warning-soft` | warning-soft | #FBF1DC | #33291A | "Einrichtung unvollständig" |
| `--warning-foreground` | warning-foreground | #6E4700 | #EBC77F | |
| `--scrim` | scrim | rgba(30,35,32,.4) | rgba(0,0,0,.6) | Behind mobile sheet |

`--secondary` is unused in the design; the hard-coded `primary: #2563eb` / `secondary: #64748b`
in `tailwind.config.ts` must go, so `bg-primary` follows the token. WCAG AA was checked by the designers.

**Shadows** (light / dark):
- `--shadow-card`: `0 1px 2px rgba(30,35,32,.04),0 8px 24px -12px rgba(30,35,32,.10)` / `0 1px 0 rgba(255,255,255,.03) inset,0 8px 24px -12px rgba(0,0,0,.5)`
- `--shadow-pop`: `0 4px 8px -2px rgba(30,35,32,.06),0 20px 40px -12px rgba(30,35,32,.22)` / `0 1px 0 rgba(255,255,255,.04) inset,0 20px 40px -12px rgba(0,0,0,.7)`
- `--shadow-paper`: `0 1px 2px rgba(30,35,32,.08),0 20px 40px -16px rgba(30,35,32,.25)` / `0 20px 40px -16px rgba(0,0,0,.7)`
- `--shadow-btn`: `0 1px 0 rgba(255,255,255,.15) inset,0 2px 6px -2px rgba(31,92,78,.5)` / `0 2px 8px -2px rgba(134,201,179,.35)`

**Radius:** sm 6, md 10 (input, button), lg 12 (alert, toast, service row), xl 16 (cards, preview well), 2xl 24 (sheet, privacy panel), full (badge).

**Spacing:** 8-pt on the Tailwind scale: 2 label↔field, 3 between service rows, 4 field↔field, 6 groups / card stack, 8 card padding, 12 sections, 14 form↔preview, 20 desktop side margin.

## Typography

- `fontFamily.serif` = Newsreader 500 (+ italic), only for page titles, section titles and amounts (`tabular-nums`).
- `fontFamily.sans` = Instrument Sans 400/500/600, everything else. Replaces the system font.

| Role | Spec |
|---|---|
| display | Newsreader 52/56, -2%, Info hero only |
| h1 | Newsreader 40/44, -1.5%; mobile 30/34 |
| h2 | Newsreader 22/28; mobile 20/26 |
| amount-lg / amount | Newsreader 32 / 17, tabular-nums |
| lead | Instrument 400 17/27 |
| body | Instrument 400 16/24 (fields; 16px prevents iOS zoom) |
| ui | Instrument 500/600 15/20 (buttons) |
| label | Instrument 500 14/20 |
| help | Instrument 400 13/18, muted-foreground |
| overline | Instrument 600 12/16, +6%, uppercase |

## Focus and motion

- Fields: 1.5px `--primary` border + `0 0 0 4px var(--ring)`; error uses `--destructive` + `--danger-ring`.
- Buttons/checkbox: `0 0 0 2px var(--background), 0 0 0 4px var(--primary)` on `:focus-visible` only.
- Hover 150ms. Suggestions/dropdown: 180ms fade + 4px down, `cubic-bezier(.2,.8,.2,1)`.
- Generating: Loader2 spinning + "Rechnung wird erstellt …"; preview shows a skeleton sheet; finished PDF fades in 240ms; "PDF bereit" badge pops (scale .9→1).
- Mobile sheet: 320ms from bottom, scrim 200ms. `prefers-reduced-motion`: crossfades only.

## Layout

- Desktop ≥1024: max 1280px, 80px sides. Invoice: form `1fr` + preview 480px, gap 56px, preview `sticky top-24`.
- Settings: section title column 280px left, card right, gap 48px.
- Mobile <768: 20px sides. Fixed bottom action bar (total + "Rechnung generieren"). After generating, the PDF opens in a bottom sheet with Drucken / Speichern; no embedded preview on mobile.
- Targets ≥44px; fields 48px; mobile main buttons 52px.

## Component mapping

- **Button**: default = primary, h-12 px-6 rounded-md shadow-btn; outline = field bg + input border; ghost = foreground-secondary, hover muted. Busy: Loader2 + text, opacity .85, disabled. Mobile main action h-[52px].
- **Input**: h-12 px-4 text-base rounded-md bg-field border-input; optional icon left (MapPin) / right (Calendar); valid = Check right in primary; error = border-destructive + ring.
- **Label**: text-sm font-medium, 8px above the field; "(optional)" in muted-foreground.
- **Checkbox**: 22×22 rounded-sm, border `--check`, checked bg-primary, inside a clickable service row (whole row is the label, min-h 64, selected = `--selected`).
- **Card**: bg-card border rounded-xl p-8 (mobile p-5) shadow-card; CardTitle Newsreader h2; CardFooter for Save: border-t bg-background.
- **Alert**: three variants, no side bar: accent (privacy), warning (setup incomplete), destructive-soft (error summary with anchor links to fields).
- **Textarea**: sender block, min-h 200, leading-[26px], same border/focus as Input.
- **Toast**: bg-popover rounded-lg shadow-pop, 32px round icon circle (danger-soft / accent). Bottom right on desktop, top on mobile.
- **Tooltip**: mobile header icon buttons: bg-foreground text-background text-xs rounded-md.
- **DropdownMenu**: theme: RadioGroup Hell / Dunkel / System with icon + check right, items h-11, label in overline style.
- **ScrollArea**: address suggestions (max 5 visible), PDF in the mobile sheet.
- **Address suggestions**: existing logic. Match bold in foreground, rest foreground-secondary; active row bg-accent; footer "Adressdaten: Schweizerische Post" + keyboard hint. States: loading, list, no results.
- **Signature pad**: existing canvas. 1.5px dashed input border, h-[180px], baseline with "×". Saved signature as 160×64 preview on white.

## New additions

- **Sheet** (mobile PDF): shadcn `Sheet` (Radix Dialog), `side="bottom"`, radius 24 top, 40×5 handle. Needs `@radix-ui/react-dialog`.
- **Badge**: "PDF bereit", "Kanton Zug": h-7 px-3 rounded-full bg-accent text-accent-foreground.
- **Icons**: ShieldCheck, Landmark, SlidersHorizontal, Monitor, ChevronDown, ArrowRight, ArrowUpRight, RotateCcw, Lock; stroke 1.75.

## Decide in the iterate

- The settings "Einrichtung unvollständig" nudge and the CHF total / recipient-municipality display read data the app already has. They are display-only, but they are new UI logic, so confirm they're in scope.
- Mobile replaces the embedded PDF preview with a sheet. Print/download behaviour must stay identical.
