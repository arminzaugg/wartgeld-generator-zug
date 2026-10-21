// Fails the build when the shipped site contains credentials or old backend references.
// Prints file names and rule names only, never the matched values.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = join(root, 'dist');

const rules = [
  ['Swiss Post variable name', 'POST_APIM'],
  ['OAuth client secret field', 'client_secret'],
  ['Supabase URL', 'supabase.co'],
];

// Local runs also look for the actual secret values from .env.local.
const envFile = join(root, '.env.local');
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf8').split('\n')) {
    const match = line.match(/^\s*(POST_APIM_CLIENT_SECRET|POST_APIM_CLIENT_ID|BUNNY_API_KEY)\s*=\s*(.+?)\s*$/);
    const value = match?.[2].replace(/^["']|["']$/g, '');
    if (value && value.length >= 8) rules.push([`value of ${match[1]}`, value]);
  }
}

const files = dir => readdirSync(dir).flatMap(name => {
  const path = join(dir, name);
  return statSync(path).isDirectory() ? files(path) : [path];
});

const findings = files(dist).flatMap(file => {
  const text = readFileSync(file, 'latin1');
  return rules.filter(([, needle]) => text.includes(needle)).map(([rule]) => `${file.slice(root.length)}: ${rule}`);
});

if (findings.length) {
  console.error(`dist/ must not contain credentials:\n  ${findings.join('\n  ')}`);
  process.exit(1);
}
console.log(`dist/ checked: ${rules.length} rules, no credentials found`);
