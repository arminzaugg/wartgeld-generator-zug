# Wartgeld Generator Zug — UI conventions

Components are shadcn/ui on Radix, styled with Tailwind. Everything is on
`window.WartgeldUI`. The product UI is **German only** (Swiss spelling: "ss",
never "ß"; amounts as `CHF 400.00`).

## Setup and wrapping

- No global provider is needed. Most parts render as-is.
- `Tooltip` must sit inside `TooltipProvider`. `Toast` must sit inside
  `ToastProvider`, with a `ToastViewport` rendered as a sibling. Without them
  nothing shows.
- Compound parts are separate exports: `Card` + `CardHeader`/`CardTitle`/
  `CardDescription`/`CardContent`/`CardFooter`; `Alert` + `AlertTitle`/
  `AlertDescription`; `DropdownMenu` + `DropdownMenuTrigger`/`DropdownMenuContent`/
  `DropdownMenuItem`/`DropdownMenuLabel`/`DropdownMenuSeparator`/`DropdownMenuRadioGroup`/
  `DropdownMenuRadioItem`.
- Dark mode: add the class `dark` on a root element; the tokens switch.
- Icons (lucide) are on `window.WartgeldUI` too: `Info`, `Settings`, `ArrowLeft`,
  `Printer`, `Download`, `FileText`, `Calendar`, `MapPin`, `User`, `Trash2`,
  `Check`, `CheckCircle2`, `AlertCircle`, `Loader2`, `RefreshCw`, `Sun`, `Moon`, `X`.
  Size them with `h-4 w-4` (inline) or `h-5 w-5` (icon buttons).

## Styling idiom: Tailwind utilities, semantic tokens

Only the classes compiled into `styles.css` exist. Arbitrary values (`w-[37px]`)
and unlisted utilities will **not** resolve. Use:

| Family | Classes |
|---|---|
| Surface / text | `bg-background` `bg-card` `bg-muted` `text-foreground` `text-muted-foreground` `text-card-foreground` |
| Brand | `bg-primary` (blue #2563eb) `text-primary` `text-primary-foreground` `bg-secondary` (slate) |
| Danger / errors | `bg-destructive` `text-destructive`; field errors use `border-red-500` + `text-sm text-red-500` |
| Borders | `border` `border-t` `border-b` `border-input` `rounded-md` `rounded-lg` `shadow-sm` |
| Spacing | `p-*` `px-*` `py-*` `m-*` `gap-*` `space-y-*` `space-x-*` on the scale 0, 0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24 |
| Layout | `flex` `flex-col` `items-center` `justify-between` `grid` `grid-cols-1..12` (also `sm:` `md:` `lg:`) `container` `mx-auto` `max-w-md`…`max-w-6xl` `w-full` `min-h-screen` |
| Type | `text-xs`…`text-4xl` `font-medium` `font-semibold` `font-bold` `leading-none` `tracking-tight` |

Fonts are the system sans stack; there is no brand webfont.

## Where the truth lives

- `styles.css` → `_ds_bundle.css`: the compiled Tailwind and token CSS (`--primary`, `--border`, `--radius`…).
- `components/general/<Name>/<Name>.prompt.md` and `<Name>.d.ts`: per-component props and examples.
  `Button` variants: `default` `outline` `secondary` `destructive` `ghost` `link`; sizes `sm` `default` `lg` `icon`.

## Idiomatic example (a form section as the app builds it)

```jsx
const { Card, CardHeader, CardTitle, CardContent, Label, Input, Checkbox, Button } = window.WartgeldUI;

<Card className="w-full max-w-md">
  <CardHeader><CardTitle>Mutter</CardTitle></CardHeader>
  <CardContent className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2"><Label htmlFor="vorname">Vorname</Label><Input id="vorname" /></div>
      <div className="space-y-2"><Label htmlFor="nachname">Nachname</Label><Input id="nachname" /></div>
    </div>
    <div className="flex items-center space-x-2">
      <Checkbox id="geburt" />
      <Label htmlFor="geburt">Betreuung der Gebärenden zuhause (CHF 400)</Label>
    </div>
    <Button className="w-full h-11" type="submit">PDF erstellen</Button>
  </CardContent>
</Card>
```
