# Iterate Spec: redesign-settings-info (part 3 of 3: settings, information, theme)

- **Run ID:** iterate-2026-10-22-redesign-settings-info
- **Type:** change
- **Complexity:** medium
- **Status:** draft, awaiting user approval

## Goal
Bring the settings and information pages into the "Papier & Tanne" design (`SettingsScreen.dc.html`,
`InfoScreen.dc.html`, `WgHeader.dc.html`). Both pages use the shared top bar. Add the setup hint (invoice page, settings
page, dot on "Einstellungen"), a German theme menu (Hell / Dunkel / System) that does not flash the wrong
theme on load, `lang="de"`, and toast icons. What is stored, how settings are saved, loaded from a file and
used on the PDF does not change.

User decisions (2026-10-22):
- **Info page:** use the new layout, but keep every fact and legal statement as today: the full privacy
  route (own address service, bunny.net with IP address, Netlify for the old address), the settings file
  staying on the device, the real contact address and the current disclaimer. No claim of a payment slip.
- **Setup hint:** count all three items as in the design. An item is missing when:
  - the sender block was never saved, is blank, or is still the example text;
  - the place of issue was never saved or is blank;
  - no signature is stored.
- **Wording:** use the design's wording, as decided for part 2.

## Acceptance Criteria
- [ ] AC1 (setup status): a pure function reports, from the *raw* stored settings (`getStoredSettings()`,
  never the default-filling `getSettings()`; the same raw values seed the settings fields), which of "Rechnungsstellerin",
  "Ort der Ausstellung" and "Unterschrift" are missing, using the rules above. A hook re-reads it when this
  tab saves or imports settings and when another tab changes them (`storage` event). Tests cover no
  settings, whitespace-only values and the stored example sender (external plan review #2).
  - `updateSettings` merges into the raw stored record instead of the default-filled one. Saving only a
    signature then no longer writes the example sender or "Kanton Zug" into storage. The stored format and
    the PDF fallbacks are unchanged; the existing unit test expectation for that case changes (internal
    architecture review #1).
- [ ] AC2 (invoice-page hint): while anything is missing, the invoice page shows, between the intro and the
  privacy note, a warning note:
  - Title "Noch N Angaben bis zur ersten Rechnung" ("Noch 1 Angabe …" for one).
  - One line naming the missing items.
  - A link styled as a button, "Zu den Einstellungen" (→ `/settings`).
  - Never shown when complete. Generating an invoice is never blocked.
- [ ] AC3 (header dot): while anything is missing, the "Einstellungen" link in the top bar shows an 8px dot in
  the warning colour. The dot sits next to the label on desktop and at the icon corner on phones.
  - The link's accessible name stays "Einstellungen". "Einrichtung unvollständig" is exposed as its
    description (`aria-describedby`).
- [ ] AC4 (settings page layout):
  - Shared top bar with "Einstellungen" marked current.
  - A "Zur Rechnung" back link (→ `/`), `h1` "Einstellungen" and the intro "Einmal erfassen, erscheint auf
    jeder Rechnung. Alles wird nur in diesem Browser gespeichert."
  - Then a status box:
    - Incomplete: warning box "Einrichtung: noch N Angaben bis zur ersten Rechnung" / "Danach können Sie
      direkt Rechnungen erstellen.", listing the three items, each marked done or open.
    - Complete: accent box "Alles eingerichtet. Ihre Rechnungen sind startklar."
  - Four sections, each a title and description column (280px from 1024px, stacked above) beside a card:
    "Rechnungsstellerin", "Ort & Datum", "Unterschrift", "Sichern & Laden".
- [ ] AC5 (sender card):
  - Textarea labelled "Absender" (visible label via `htmlFor`), with the design placeholder (one item per
    line) and the help line "Eine Angabe pro Zeile, in dieser Reihenfolge."
  - It starts with the *stored* sender block, empty when none is stored, instead of pre-filling the example
    text. The PDF still falls back to the example text when nothing is stored.
  - A card footer holds "Speichern". The toast "Gespeichert" stays.
- [ ] AC6 (place and date card):
  - "Ort der Ausstellung" (placeholder "z. B. Zug") starts with the stored place, empty when none (the PDF
    still falls back to "Kanton Zug").
  - "Rechnungsdatum (optional)" with "Heute verwenden" and the hint "Leer lassen, um jeweils das aktuelle
    Datum zu verwenden." (`aria-describedby` kept).
  - Footer "Speichern".
  - Both Speichern buttons save sender, place and date together, as today.
- [ ] AC7 (signature card):
  - The existing canvas sits in a 180px dashed field with a baseline and "×".
  - Ghost "Löschen" (trash icon) and primary "Unterschrift speichern".
  - The PNG upload stays ("Oder PNG-Datei hochladen", labelled input).
  - A saved-signature row shows the stored signature at 160×64 on white, with "Gespeicherte Unterschrift" /
    "Neu zeichnen und speichern, um sie zu ersetzen.", or "Noch keine Unterschrift gespeichert." when none.
  - Saving, clearing, uploading and their toasts behave as today.
  - No fixed `gray-*`, `blue-*` or `bg-white` utilities remain except the white signature background (a
    deliberate paper colour, also used on the PDF).
- [ ] AC8 (transfer card): "Sichern & Laden" keeps the whole `SettingsTransfer` behaviour and texts, restyled
  with tokens only.
  - `FIELD_LABELS` follow the new labels ("Absender", "Ort der Ausstellung"), so import messages match the
    page.
- [ ] AC9 (information page): shared top bar with "Information" current, then:
  - Overline "Über diese Anwendung" and `h1` "Wartgeld-Rechnungen für Hebammen im Kanton Zug.", with two intro
    paragraphs. The municipality is "vorgeschlagen" (proposed) from the postcode.
  - "Funktionen": three cards — Adresssuche der Post; Richtige Gemeinde; PDF zum Drucken ("Mit Absender und
    Unterschrift. Drucken oder speichern.").
  - "Verwendung": four numbered steps.
  - A primary-coloured "Datenschutz" block. Heading "Datenschutz: Ihre Patientinnendaten bleiben bei Ihnen."
    with two boxes:
    - "Bleibt in Ihrem Browser": patient data, sender, signature, PDF; settings in local storage; a settings
      file stays on the device.
    - "Geht an die Schweizerische Post": only the text typed into the address field (street, house number,
      postcode and town as far as typed), via our address service and bunny.net, which sees the IP address,
      plus Netlify for the old address. Nothing else; the service stores no addresses.
  - "Service-Disclaimer" with today's text.
  - "Kontakt" with "Armin Zaugg", the real `mailto:` link and "Fragen, Fehler oder Anregungen? Schreiben Sie
    uns."
  - Tokens only; no fixed colours, no hand-written SVG.
- [ ] AC10 (theme menu):
  - The top-bar trigger has the accessible name "Darstellung" and shows sun or moon for the shown theme (plus a
    chevron from 768px).
  - The menu has the label "Darstellung" and radio items "Hell" (sun), "Dunkel" (moon) and "System" (monitor),
    with the check on the right. Items are 44px high. The current choice is checked.
  - "System" follows the operating system, also when it changes while the app is open.
  - The choice is stored under `app-theme` as today.
- [ ] AC11 (no flash, language):
  - An inline script in `index.html` applies the stored theme (or the system theme) to `<html>` before the app
    loads. It uses the same storage key as `App.tsx` (unit test compares them).
  - Only the storage read sits in try/catch. When storage is unavailable or holds an unknown value, the script
    still resolves "system" via `prefers-color-scheme`.
  - `ThemeProvider` uses the same rule: only `light`/`dark`/`system` are accepted, anything else or a throwing
    read means "system" (external plan review #1).
  - `<html lang="de">`.
  - `index.html` still loads nothing from other hosts.
- [ ] AC12 (focus visibility): text contrast of a focused menu item is already fine (8:1 light, 10:1 dark).
  - The problem is the highlight itself: the accent highlight is only 1.2:1 (light) and 1.0:1 (dark) against
    the menu, so keyboard focus is barely visible.
  - Fix: focused menu items (all `DropdownMenu*Item`s) also get a 1.5px inset outline in `--primary`, which is
    at least 3:1 against the menu in both themes.
  - Verified with computed styles in the browser.
- [ ] AC13 (toasts): each toast shows a 32px round icon. Success uses an accent circle with a check;
  destructive uses a danger-soft circle with an alert icon. Toast texts and positions are unchanged. The destructive
  toast's surface changes from a filled red to the popover surface (`bg-popover`) so the red icon circle carries the
  signal; this is a shared touch to `ui/toast.tsx`, visible on the invoice page's error toast too.
- [ ] AC14 (no functional change):
  - The `presetStorage` JSON shape, `settingsFile` parsing/validation and the PDF are unchanged.
  - Only defaults are no longer written by a partial save, so an exported file can lack fields that were never
    saved. Import already treats missing fields as defaults (`presetStorage.unit.test.ts` and the
    `Settings.test.tsx` export expectation change accordingly).
  - Existing unit and Playwright specs pass with only selectors and labels updated (Light/Dark → Hell/Dunkel,
    "Angaben Rechnungsstellerin" → "Absender", "Ort Rechnungsstellerin" → "Ort der Ausstellung").
  - No sideways scrolling at 320px on either page.
  - Lint and build pass.

## Spec Impact
- **Classification:** modify
- **ADD:** none
- **MODIFY:**
  - FR-01.06 — (E) settings page sections and setup status / hint.
  - FR-01.07 — (E) signature card.
  - FR-01.08 — (E) information page layout with the unchanged privacy facts.
  - FR-01.09 — (E) German theme menu with System, no flash on load, `lang="de"`.
- **REMOVE:** none

## Known Limitations
- Both Speichern buttons save all three text settings (as today). So pressing either one also marks the place
  as set, even if it is left empty or at its example — blank still counts as missing.
- The hint reads `localStorage` only; a stored but corrupt signature still counts as present.
- Users who saved before this change may already have "Kanton Zug" stored by the old merge; for them the place
  counts as set (an explicit save and a leaked default cannot be told apart).
- The inline theme script needs its hash in `script-src` if a content-security policy is added later (none
  today; recorded in the ADR).
- The header's theme icon shows the resolved theme; before React mounts, the inline script sets only the class.
- With the settings page open in two tabs, the status box follows the other tab live while the fields keep
  the values they opened with; saving then overwrites the other tab's text settings (as before this change).
- When the browser refuses to store the text settings (storage full), saving shows no message (unchanged).
  For the signature, which can be a large uploaded image, a refused save now shows an error toast and the card
  keeps saying no signature is saved (doubt review).

## Out of Scope
- PDF layout, settings file format, address lookup.
- Moved-site notice (`MovedNotice`) wording.
- `--check` contrast (design decision pending).
- iOS save/print follow-up from part 2.

## Design Notes
- Status: `src/lib/setupStatus.ts` (`missingSetupItems(stored)`, labels) plus `src/hooks/useSetupStatus.ts`.
  The hook is built on `useSyncExternalStore` so all three places agree. It subscribes to the
  `SETTINGS_CHANGED_EVENT` window event (constant exported from `presetStorage.ts`, dispatched by
  `updateSettings` and `replaceSettings`) and to `storage`.
- Header: `AppHeader` reads the hook. The dot is `aria-hidden`; a hidden span with an id carries the
  description.
- Theme: `ThemeToggle` uses `DropdownMenuRadioGroup` with `value={theme}`. `ThemeProvider` adds a
  `matchMedia` change listener while the theme is `system`. `DropdownMenuRadioItem` (used nowhere else)
  moves its indicator to the right.
- Inline theme script: about 10 lines, reads `app-theme`. `light`/`dark` apply directly; otherwise it uses
  `prefers-color-scheme`.
- Toast icon: chosen in `Toaster` from `variant`; `Toast` itself keeps its API.
- The `theme.test.ts` fixed-colour guard is extended to the settings and info files.

## Internal Plan Review
`opus-plan-reviewer`: approve-with-changes, 17 findings. Each is dispositioned below and binding for the build.
1. **High, fixed.** Default place leaked by `updateSettings`: merge onto the raw stored record (option b, also
   architecture review #1).
2. **Medium, fixed.** `missingSetupItems` is built on `getStoredSettings()`, which already drops
   `DEFAULT_SENDER_INFO`. Blank means empty after `trim()`. Tests: example text stored, whitespace, `{broken`
   JSON, empty-string signature.
3. **Medium, fixed.** `useSyncExternalStore` gets a stable snapshot (a joined key string, not a new array).
   `storage` events are filtered to `key === 'form-settings' || key === null`. A test checks that listeners
   are removed on unmount.
4. **Medium, fixed.** `SETTINGS_CHANGED_EVENT` is dispatched only after a successful `setItem`. A test checks
   it is not dispatched when `setItem` throws.
5. **Medium, fixed.** The settings status box uses the hook, so it flips after saving a signature without a
   remount (unit test). It shows saved values, not unsaved typing.
6. **Medium, fixed.** E2E selectors: `button "Darstellung"`, `menuitemradio "Hell"/"Dunkel"`, plus an
   `aria-checked` assert.
7. **Medium, fixed.** The setup note appears in every fresh e2e context. The full suite runs, the note wraps at
   320px, and new specs use `{ exact: true }` for the header "Einstellungen" link.
8. **Medium, fixed.** Inline theme script:
   - (a) A classic `<script>` in `<head>` before the module.
   - (b) The same value rule in `ThemeProvider`, with try/catch.
   - (c) CSP hash noted in the ADR.
   - (d) A jsdom test runs the script body against `light`/`dark`/`system`/garbage/throwing storage.
   - (e) The e2e observes the class with the app script blocked.
9. **Medium, fixed.** The Info Datenschutz block is a `<section aria-labelledby>`. All five legal assertions
   are kept, plus the `mailto:` href, the unchanged disclaimer, "vorgeschlagen", and no
   "Einzahlungsschein"/"QR-Rechnung".
10. **Medium, fixed.** The dot uses `bg-warning-foreground` (visible in both themes) and `relative` on the phone
    link. `aria-describedby` and its span are rendered only while something is missing.
11. **Low, fixed.** The fixed-colour guard is extended to Settings, Info, SignaturePad, SettingsTransfer,
    SettingsSection, SetupNotice and toaster. The only allowance is the signature's white paper, marked with a
    comment. Info uses lucide `Mail`.
12. **Low, fixed / confirmed.**
    - German `alt` "Gespeicherte Unterschrift" and a labelled upload input.
    - "Löschen" still clears the stored signature as today (AC7 "behave as today"). The button sits with the
      drawing, and its toast "Unterschrift gelöscht" states the effect.
13. **Low, fixed.** The date row wraps (`flex-wrap`). The 320px e2e checks `scrollWidth` on both pages.
14. **Low, fixed.**
    - Item names everywhere are the setup labels "Rechnungsstellerin", "Ort der Ausstellung" and
      "Unterschrift", joined as "A, B und C".
    - Singular "noch 1 Angabe" applies on both pages.
    - Wording helpers live in `setupStatus.ts`, with tests for N = 1, 2 and 3.
15. **Low, fixed.** The `FIELD_LABELS` ripple into unit and e2e expectations is updated. The e2e Speichern click
    uses `exact: true`.
16. **Low, confirmed.**
    - Default toasts get the accent check, as in the design; neutral confirmations are success-like
      acknowledgements.
    - The icon is `aria-hidden`, and the icon and text share one inner flex.
17. **Low, fixed.** The trigger icon keeps the CSS `dark:` swap, so it follows the class (including before
    mount). The `matchMedia` listener is removed on cleanup.

## Internal Architecture Review
`architecture-internal-reviewer`: build-with-changes, option A.
- #1: fixed (see Plan Review #1).
- #2: fixed (AC11).
- #3: disclosed (CSP hash, Known Limitations and ADR).
- #4: fixed (`useSyncExternalStore`, exported event constant).
- #5: accepted (already a Known Limitation).

## Architecture Review (external)
`openai`: approve option A, no findings (glm unavailable). The external plan review (`openai` revise) asked
for two changes, both integrated: storage-failure resolution in the theme script, and raw values for status
and fields.

## Confidence Calibration
- **Overall: high** for the new Settings and Info layouts, the setup status and the theme menu; **medium** for
  how the system-theme switch and the no-flash script behave on real phones (only emulated in Chromium).
- Evidence: 364 unit tests (setup rules incl. whitespace, example sender, corrupt and non-object storage;
  hook updates from this tab, other tabs and unmount; inline theme script run with throwing storage and garbage
  values; refused signature save), Playwright 25/25 on dev and on the built site (setup flow end to end, System
  following emulated OS changes, no flash with app scripts blocked, menu focus outline, 320px widths incl. the
  signature status row), lint/typecheck/build clean, screenshots checked light/dark/390px.
- Reviews: spec PASS; code PASS (4 low fixed, 2 info accepted); external codex revise → 320px signature row
  fixed; doubt 0 high/1 medium/3 low → 2 fixed, 2 recorded (Known Limitations).
- Residual risk: Firefox/Safari not run; the "×" mark on the white signature field is faint in dark mode
  (cosmetic); a stored "Kanton Zug" from older versions counts as a set place.

## Verification (medium+)
- **Surface:** web
- **Runner command:** `npx playwright test`
- **Evidence path:** `test-results/e2e-results.json`
