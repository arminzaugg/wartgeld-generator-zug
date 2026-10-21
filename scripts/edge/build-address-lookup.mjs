// Bundles the Bunny edge script (edge/address-lookup/main.ts) into one file.
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../..', import.meta.url));
export const OUTFILE = `${root}dist-edge/address-lookup.js`;

export const buildAddressLookup = () => build({
  absWorkingDir: root,
  entryPoints: ['edge/address-lookup/main.ts'],
  outfile: OUTFILE,
  bundle: true,
  format: 'esm',
  platform: 'neutral',
  target: 'es2022',
  // The SDK's Deno build matches the Bunny runtime and has no dependencies.
  conditions: ['deno', 'import'],
  mainFields: ['module', 'main'],
  external: ['node:*'],
  tsconfig: 'tsconfig.edge.json',
  logLevel: 'warning',
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await buildAddressLookup();
  console.log(`built ${OUTFILE}`);
}
