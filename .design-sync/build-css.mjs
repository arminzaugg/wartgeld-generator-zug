// CSS build for the Claude Design sync (cfg.buildCmd).
// 1. Splits the theme tokens (:root and .dark blocks) out of src/index.css into
//    a tiny local "tokens package" that cfg.tokensPkg points at, so they ship
//    as tokens/tokens.css.
// 2. Compiles Tailwind from index.css minus those blocks into cfg.cssEntry and
//    marks every --tw-* helper declaration with /* @kind other */ so it is not
//    taken for a theme token.
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const SRC = "src/index.css";
const CACHE = ".design-sync/.cache";
const TOKENS_DIR = `${CACHE}/tokens`;

const css = readFileSync(SRC, "utf8");
const blockRx = /^\s*(:root|\.dark)\s*\{[^}]*\}\s*$/gm;
const blocks = css.match(blockRx) ?? [];
if (blocks.length !== 2) throw new Error(`expected :root and .dark blocks in ${SRC}, found ${blocks.length}`);

const dedent = (b) => b.trim().replace(/^ {2,4}/gm, "  ").replace(/^ {2}(\}|:root|\.dark)/gm, "$1");
mkdirSync(TOKENS_DIR, { recursive: true });
writeFileSync(`${TOKENS_DIR}/package.json`, JSON.stringify({ name: "wartgeld-theme-tokens", version: "1.0.0", private: true }, null, 2) + "\n");
writeFileSync(
  `${TOKENS_DIR}/tokens.css`,
  `/* Theme tokens from ${SRC}. Colours are HSL channels: use as hsl(var(--primary)). */\n` +
    blocks.map(dedent).join("\n\n") + "\n",
);

const input = `${CACHE}/tailwind-input.css`;
writeFileSync(input, css.replace(blockRx, ""));
execFileSync(
  "npx",
  ["tailwindcss", "-c", ".design-sync/tailwind.config.ts", "-i", input, "-o", `${CACHE}/ds.css`, "--minify"],
  { stdio: ["ignore", "ignore", "inherit"] },
);

const out = readFileSync(`${CACHE}/ds.css`, "utf8");
const marked = out.replace(/(^|[{;])(--tw-[\w-]+\s*:)/g, "$1/* @kind other */$2");
writeFileSync(`${CACHE}/ds.css`, marked);
const leftover = marked.match(/(?<![\w-])--(?!tw-)[\w-]+\s*:/g) ?? [];
console.error(`  tokens.css: ${blocks.length} blocks; ds.css: non --tw vars left = ${leftover.length}`);
