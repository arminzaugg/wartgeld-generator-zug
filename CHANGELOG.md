# Changelog

## [1.5.0] - 2026-10-26

### Added

- Settings can be saved to a file and loaded again (Einstellungen sichern / laden), e.g. to move to the new address
- CI runs the Playwright end-to-end tests against the built site
- Invoice form: "Zuständige Gemeinde" selection, pre-filled from the official Swiss locality list and correctable by the midwife, with hints for localities shared between municipalities or partly outside canton Zug
- Setup hint on the invoice page and a dot on «Einstellungen» until sender, place and signature are saved

### Changed

- Address suggestions come from the new Swiss Post address API through the project's own service on bunny.net (`/api/address`); the Swiss Post credentials never reach the browser
- Border villages lying more than 90 % outside canton Zug (Bennau, Sattel, Rothenthurm, Mühlau) are no longer offered and cannot be invoiced; Sihlbrugg stays with its hint
- The privacy text names what is sent for address suggestions and via which hosting providers (Netlify, bunny.net)
- The app now lives at https://wartgeld.nidea.ch, hosted on bunny.net; the old Netlify address shows a notice pointing there
- Address suggestions are requested once the user pauses typing (250 ms) instead of on every keystroke
- The invoice recipient is taken from municipality data shipped with the app; generating an invoice no longer contacts any server
- All 12 requirements confirmed by the product owner
- Invoice page redesigned: form and live preview side by side on wide screens, the running CHF total and the receiving municipality shown before generating, a problem summary that jumps to each field, and on phones a fixed action bar with the finished invoice opening in a bottom panel
- New "Papier & Tanne" look: warm paper background, fir-green main action, a designed dark mode, Newsreader headings and Instrument Sans text; fields, buttons, cards and checkboxes restyled with clearer keyboard focus
- Settings page redesigned in sections with a setup status, empty fields with examples instead of placeholder values, and a clearer signature card; information page redesigned with the same privacy facts
- Appearance menu in German (Hell, Dunkel, System); «System» now follows the device while the app is open, the dark theme no longer flashes light on load, and keyboard focus in menus is clearly visible
- The automated build now uses the current versions of its GitHub Actions, still locked to exact, verified releases.
- The automated tests now actually fail when unit-test coverage drops below 80%, and the project states that it needs Node 22.12 or newer.

### Removed

- Supabase is no longer used by the app (client, edge function and database configuration removed)

### Fixed

- Address search no longer suggests parcel pickup points and finds addresses typed as "Street 1, 6300" before the town is entered
- Addresses in 6319 Allenwinden are invoiced to Baar instead of failing; typing over a picked address clears its postcode, town and municipality; house-number changes after picking now reach the invoice
- Printing on iPhone and iPad no longer gives an empty page: «Drucken» opens the share menu with the invoice, which offers «Drucken»

### Security

- Address lookups are limited per visitor IP at the Bunny edge, and the lookup service answers only its own path
- Removed a leftover third-party script (cdn.gpteng.co) and bundle the fonts with the app, so the browser contacts no outside host except the address lookup
- The test tooling was upgraded to vitest 5, which removes the last critical dependency warnings; the automated checks now run on Node 22.
- GitHub Actions workflows now reference exact, unchangeable versions of every action, and Dependabot waits 7 days before proposing a newly published dependency or action version.
- Upgraded the PDF library jsPDF from 3.0.1 to 4.2.1, closing 2 critical and 7 high known vulnerabilities and 20 in its DOMPurify dependency; invoices look exactly the same.
- The two remaining automated code-scan warnings were reviewed, confirmed harmless, and marked as such, so the scan now reports nothing.
- Updated vulnerable libraries within their current major versions (React Router 6.30.6, Vite 6.4.5, PostCSS, ESLint and build tooling), reducing known vulnerabilities from 40 to 13; the app behaves the same.


