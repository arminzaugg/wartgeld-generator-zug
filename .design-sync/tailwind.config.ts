// Tailwind build for the Claude Design sync: the app's own config, plus the
// authored previews as content and a safelist of layout/typography utilities
// so designs built with these components have a usable class vocabulary.
import base from "../tailwind.config";
import type { Config } from "tailwindcss";

const space = "0|0.5|1|1.5|2|2.5|3|4|5|6|8|10|12|16|20|24";
const colors = "background|foreground|primary|primary-foreground|secondary|secondary-foreground|muted|muted-foreground|accent|accent-foreground|destructive|destructive-foreground|card|card-foreground|popover|popover-foreground|border|input|ring|white|transparent";

export default {
  ...base,
  content: ["./src/**/*.{ts,tsx}", "./.design-sync/previews/**/*.tsx"],
  safelist: [
    { pattern: new RegExp(`^-?(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|gap-x|gap-y|space-x|space-y)-(${space})$`) },
    { pattern: new RegExp(`^(bg|text|border)-(${colors})$`) },
    { pattern: /^(flex|inline-flex|grid|block|inline-block|hidden|flex-col|flex-row|flex-wrap|flex-1|shrink-0|grow|items-(start|center|end|baseline)|justify-(start|center|end|between)|self-(start|center|end))$/ },
    { pattern: /^grid-cols-(1|2|3|4|6|12)$/, variants: ["sm", "md", "lg"] },
    { pattern: /^col-span-(1|2|3|4|6|12|full)$/, variants: ["sm", "md", "lg"] },
    { pattern: /^(w|h|min-h|max-w)-(full|screen|auto|fit|4|5|6|8|10|12|16|xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl)$/ },
    { pattern: /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|left|center|right)$/, variants: ["sm", "md"] },
    { pattern: /^font-(normal|medium|semibold|bold|mono)$/ },
    { pattern: /^(leading|tracking)-(none|tight|snug|normal|relaxed|wide)$/ },
    { pattern: /^(rounded|rounded-(sm|md|lg|xl|full)|border|border-(t|b|l|r)|border-2|shadow|shadow-(sm|md|lg)|divide-y)$/ },
    { pattern: /^(container|mx-auto|relative|absolute|sticky|top-0|inset-0|overflow-hidden|overflow-auto|truncate|underline|uppercase|sr-only)$/ },
  ],
} satisfies Config;
