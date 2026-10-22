# design-sync notes

- This repo is an app, not a published library: there is no `dist/` or `.d.ts` tree.
  `.design-sync/entry.ts` re-exports `src/components/ui/*` plus selected lucide icons,
  and is the converter's `entry`. Add a new ui component there AND in `componentSrcMap`.
- Props contracts are hand-written in `cfg.dtsPropsFor` (auto-extraction needs a
  `.d.ts` tree). When a ui component's props/variants change, update its entry.
- Styling is Tailwind 3. Run `cfg.buildCmd` before every build: it compiles
  `src/index.css` through `.design-sync/tailwind.config.ts` (app config + previews as
  content + a safelist of layout/type utilities) into `.design-sync/.cache/ds.css`,
  which is `cfg.cssEntry`. The safelist is the class vocabulary that `conventions.md`
  promises to the design agent; keep the two in sync.
- `guidelinesGlob` is `[]` on purpose: the default glob picked up
  `docs/IMPROVEMENT_PLAN.md`, an internal planning doc.
- Render check: playwright 1.64.1 is installed into `.ds-sync/` to match the
  cached `chromium-1248`. The repo itself has no playwright dependency.
- Overlays: DropdownMenu and Tooltip previews use `defaultOpen` with `cardMode: single`.
  Toast previews restyle `ToastViewport` to `static` so the toast stays in the card.

## Known render warns

- Undefined vars `--radix-toast-swipe-end-x`, `--radix-toast-swipe-move-x`,
  `--tw-shadow-color` ("1 missing, below threshold"): set at runtime by Radix/Tailwind.
- ToastClose is invisible in the Toast card: it is hover-only by design.

## Re-sync risks

- `dtsPropsFor` is a hand copy of the source props, so it goes stale silently if
  `button.tsx` etc. change variants.
- The icon list in `entry.ts` and in `conventions.md` must match.
- The secondary colour is hard-coded `#64748b` and primary `#2563eb` in
  `tailwind.config.ts` (not CSS vars). A redesign that changes the theme changes the
  bundle CSS, and the next sync re-uploads it.
