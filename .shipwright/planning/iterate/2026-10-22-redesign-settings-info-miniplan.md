# Mini-Plan: redesign-settings-info

| File | Change |
|---|---|
| `src/lib/setupStatus.ts` (new) | `SETUP_ITEMS`, `missingSetupItems(stored)` |
| `src/hooks/useSetupStatus.ts` (new) | re-reads on `settings-changed` + `storage` |
| `src/lib/presetStorage.ts` | dispatch `settings-changed` after `updateSettings` / `replaceSettings` (format unchanged) |
| `src/lib/settingsFile.ts` | `FIELD_LABELS` text only |
| `src/components/SetupNotice.tsx` (new) | invoice-page warning note |
| `src/components/AppHeader.tsx` | setup dot + description |
| `src/components/ThemeToggle.tsx` | German radio menu, "Darstellung" |
| `src/components/ThemeProvider.tsx` | follow OS while `system` |
| `src/components/ui/dropdown-menu.tsx` | RadioItem indicator right, label overline style |
| `src/components/ui/toaster.tsx` | icon circle by variant |
| `src/pages/Settings.tsx` | layout, sections, status box; stored values in fields |
| `src/components/SettingsSection.tsx` (new) | title column + card shell |
| `src/components/SignaturePad.tsx` | restyle, same behaviour |
| `src/components/SettingsTransfer.tsx` | token restyle only |
| `src/pages/Info.tsx` | new layout, facts unchanged |
| `src/pages/Index.tsx` | mount `SetupNotice` |
| `index.html` | `lang="de"`, inline theme script |
| tests | setupStatus, useSetupStatus, SetupNotice, AppHeader dot, ThemeToggle, Settings/Info rewrites, theme guard, index.html script key; e2e `settings-info.spec.ts` (setup flow, theme menu + System, no flash, 320px), selector updates |

## Alternative considered
Per-card saving (each Speichern saves only its card), so "place set" needs explicit action. Rejected: it changes save behaviour, and unsaved edits in the other card would silently not be stored.
