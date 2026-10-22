# Architecture Brief: redesign-settings-info (part 3: settings, information, theme)

## The problem
The settings and information pages still have the old stacked look with their own back buttons, while the
invoice page already uses the new design and shared top bar. New midwives also aren't told that the invoice
needs a sender block, a place and a signature first; the PDF silently uses example text ("Martina
Mustermann…") and "Kanton Zug" when nothing is saved. The theme menu is English (Light/Dark), has no
"System" choice, and dark-mode users see a light flash before the app loads.

## What already exists here
- Settings stored in localStorage (`form-settings`) via `src/lib/presetStorage.ts`, with defaults filled in
  for the PDF and a `getStoredSettings()` that already tells saved values from defaults.
- A settings file export/import (`SettingsTransfer`, `settingsFile.ts`), a canvas signature pad with PNG
  upload, a shared `AppHeader`, a `ThemeProvider` that already supports "system", and Radix dropdown menus.

## What would newly, permanently exist
- A derived "setup status" (which of sender, place, signature are missing) shown in three places (invoice
  page note, settings status box, header dot), kept current via a window event fired when settings are saved.
- An inline script in index.html that sets the theme class before the app loads (must stay in sync with
  the storage key used by the React provider).
- The settings fields show only *saved* values (empty with placeholder when nothing saved), instead of
  pre-filling the example text.

## Options on the table
- **A:** design as specified: setup status in three places, German radio theme menu with System, inline
  anti-flash script, settings fields start empty when nothing is saved.
- **B:** visual restyle only (pages, theme labels), no setup status and no anti-flash script.
- **C:** A, but compute setup status only on page load (no live event), accepting a stale dot until navigation.
