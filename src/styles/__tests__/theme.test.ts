import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "../../..");
const read = (file: string) => readFileSync(path.join(root, file), "utf8");

// Token sheet from .shipwright/designs/richtung-a-handoff.md ("Papier & Tanne"), light / dark.
const SHEET: Record<string, [string, string]> = {
  background: ["#F6F3EC", "#121513"],
  header: ["#FBF9F5", "#161A18"],
  card: ["#FFFFFF", "#1A1E1C"],
  popover: ["#FFFFFF", "#232825"],
  field: ["#FFFFFF", "#151917"],
  muted: ["#EFEBE2", "#0E110F"],
  foreground: ["#1E2320", "#ECE8DF"],
  "foreground-secondary": ["#4F5650", "#C4C7BE"],
  "muted-foreground": ["#5F665F", "#A2A79E"],
  border: ["#E3DDD1", "#2D332F"],
  input: ["#D8D1C3", "#3A413C"],
  check: ["#A9A397", "#5C635D"],
  primary: ["#1F5C4E", "#86C9B3"],
  "primary-hover": ["#184A3F", "#9DD5C2"],
  "primary-foreground": ["#FFFFFF", "#0E1F1A"],
  accent: ["#E3EEE8", "#1B2C26"],
  "accent-foreground": ["#1A4D41", "#B7E0D2"],
  selected: ["#F2F7F4", "#18261F"],
  destructive: ["#B42318", "#F2877A"],
  "destructive-soft": ["#FBEAE7", "#361C19"],
  "destructive-foreground": ["#8A1C13", "#FFC9C1"],
  "warning-soft": ["#FBF1DC", "#33291A"],
  "warning-foreground": ["#6E4700", "#EBC77F"],
  // Left open by the sheet; decided in the iterate spec (Design Notes).
  "card-foreground": ["#1E2320", "#ECE8DF"],
  "popover-foreground": ["#1E2320", "#ECE8DF"],
  secondary: ["#EFEBE2", "#0E110F"],
  "secondary-foreground": ["#1E2320", "#ECE8DF"],
};

const FULL_VALUES: Record<string, [string, string]> = {
  ring: ["rgba(31,92,78,.22)", "rgba(134,201,179,.28)"],
  "danger-ring": ["rgba(180,35,24,.14)", "rgba(242,135,122,.22)"],
  scrim: ["rgba(30,35,32,.4)", "rgba(0,0,0,.6)"],
};

const block = (css: string, selector: string) => {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`no ${selector} block in index.css`);
  return css.slice(start, css.indexOf("}", start));
};

const vars = (cssBlock: string) =>
  Object.fromEntries([...cssBlock.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(m => [m[1], m[2].trim()]));

// "H S% L%" → "#RRGGBB", the way the browser rounds hsl().
const channelsToHex = (channels: string) => {
  const m = channels.match(/^(-?[\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/);
  if (!m) return `not HSL channels: ${channels}`;
  const [h, s, l] = [Number(m[1]), Number(m[2]) / 100, Number(m[3]) / 100];
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))));
  };
  return "#" + [f(0), f(8), f(4)].map(v => v.toString(16).padStart(2, "0")).join("").toUpperCase();
};

const css = read("src/index.css");
const themes = [
  { name: "light", values: vars(block(css, ":root")), column: 0 },
  { name: "dark", values: vars(block(css, ".dark")), column: 1 },
] as const;

// @covers FR-01.09
describe("Papier & Tanne colour tokens", () => {
  for (const { name, values, column } of themes) {
    it(`${name} colour tokens equal the design token sheet`, () => {
      for (const [token, hexes] of Object.entries(SHEET)) {
        expect(channelsToHex(values[token] ?? "missing"), `--${token} (${name})`).toBe(hexes[column]);
      }
    });

    it(`${name} translucent tokens are full colour values from the sheet`, () => {
      for (const [token, value] of Object.entries(FULL_VALUES)) {
        expect(values[token]?.replace(/\s|(?<!\d)0(?=\.)/g, ""), `--${token} (${name})`).toBe(value[column]);
      }
    });
  }
});

// @covers FR-01.09
describe("Tailwind colour wiring", () => {
  const config = read("tailwind.config.ts");

  it("contains no hard-coded hex colour", () => {
    expect(config.match(/#[0-9a-f]{3,8}\b/gi)).toBeNull();
  });

  it("resolves primary and secondary through their tokens", () => {
    expect(config).toMatch(/primary:\s*{\s*DEFAULT:\s*"hsl\(var\(--primary\)\)"/);
    expect(config).toMatch(/secondary:\s*{\s*DEFAULT:\s*"hsl\(var\(--secondary\)\)"/);
  });

  it("uses full-value tokens directly, never inside hsl()", () => {
    expect(config).toContain('ring: "var(--ring)"');
    expect(config).toContain('"danger-ring": "var(--danger-ring)"');
    expect(config).toContain('scrim: "var(--scrim)"');
    expect(config).not.toMatch(/hsl\(var\(--(ring|danger-ring|scrim)\)\)/);
  });
});

// @covers FR-01.08
describe("nothing is loaded from other hosts", () => {
  const html = read("index.html");

  it("index.html loads no script, stylesheet or font from another host", () => {
    expect(html).not.toMatch(/<script[^>]+src=["'](https?:)?\/\//i);
    expect(html).not.toMatch(/<link[^>]+href=["'](https?:)?\/\//i);
    expect(html).not.toMatch(/gpteng|GPT Engineer/i);
  });

  it("the brand fonts are bundled with the app", () => {
    const main = read("src/main.tsx");
    for (const face of [
      "@fontsource/newsreader/latin-500.css",
      "@fontsource/newsreader/latin-500-italic.css",
      "@fontsource/instrument-sans/latin-400.css",
      "@fontsource/instrument-sans/latin-500.css",
      "@fontsource/instrument-sans/latin-600.css",
    ]) {
      expect(main, face).toContain(`import "${face}"`);
    }
  });
});

// @covers FR-01.09
describe("headings", () => {
  // Newsreader ships in weight 500 only; a bold class would make the browser fake a bold face.
  // A heading that switches to the sans face (which ships 600) may be semibold.
  it("no serif page or form heading asks for a bold weight", () => {
    const files = [
      "src/pages/Index.tsx", "src/pages/Info.tsx", "src/pages/Settings.tsx", "src/features/form/components/FormContainer.tsx",
      "src/components/SettingsSection.tsx",
    ];
    for (const file of files) {
      expect(read(file).match(/<h[12](?![^>]*font-sans)[^>]*font-(bold|semibold)/g), file).toBeNull();
    }
  });
});

// @covers FR-01.09
describe("focus indicators", () => {
  // --ring is a faint 22% halo; a 2px ring-ring outline built on it is not a visible focus indicator.
  it("no component builds its focus outline from the translucent ring colour", () => {
    const files = (readdirSync(path.join(root, "src"), { recursive: true }) as string[])
      .filter(f => /\.tsx?$/.test(f))
      .map(f => path.join("src", f));
    const offenders = files.filter(f => !f.includes("__tests__") && /ring-ring\b/.test(read(f)));
    expect(offenders).toEqual([]);
  });
});

// @covers FR-01.01
describe("invoice page colours", () => {
  // Fixed palette utilities ignore the theme (and dark mode); the invoice page uses tokens only.
  it("no invoice-page component uses a fixed grey, red, blue, yellow or white colour", () => {
    const dirs = ["src/features/form/components", "src/components/StreetLookup"];
    const files = [
      "src/pages/Index.tsx", "src/components/StreetLookup.tsx", "src/components/AppHeader.tsx", "src/components/PrivacyNote.tsx",
      "src/components/PreviewPanel.tsx", "src/components/PdfSheet.tsx", "src/components/PdfActionButtons.tsx",
      ...dirs.flatMap(dir => readdirSync(path.join(root, dir)).filter(f => f.endsWith(".tsx")).map(f => `${dir}/${f}`)),
    ];
    const fixed = /\b(?:text|bg|border|ring|fill|stroke)-(?:(?:gray|red|blue|yellow|slate)-\d{2,3}|white|black)\b/g;
    for (const file of files) {
      expect(read(file).match(fixed), file).toBeNull();
    }
  });
});

// @covers FR-01.06 FR-01.07 FR-01.08
describe("settings and information page colours", () => {
  // The signature field and its preview stay white like the paper; each such line carries a comment saying so.
  it("no settings or information component uses a fixed colour", () => {
    const files = [
      "src/pages/Settings.tsx", "src/pages/Info.tsx", "src/components/SignaturePad.tsx", "src/components/SettingsTransfer.tsx",
      "src/components/SettingsSection.tsx", "src/components/SetupNotice.tsx", "src/components/ui/toaster.tsx",
      "src/components/ThemeToggle.tsx",
    ];
    const fixed = /\b(?:text|bg|border|ring|fill|stroke)-(?:(?:gray|red|blue|yellow|slate|green|amber)-\d{2,3}|white|black)\b/g;
    for (const file of files) {
      const source = file === "src/components/SignaturePad.tsx" ? read(file).replace(/\bbg-white\b/g, "") : read(file);
      expect(source.match(fixed), file).toBeNull();
    }
  });

  it("the information page draws no icon by hand", () => {
    expect(read("src/pages/Info.tsx")).not.toMatch(/<svg/);
  });
});
