// Publishes the built site to Bunny (manual, run from a developer machine). Reads
// BUNNY_API_KEY from .env.local; prints file counts, ids and status codes only.
//
//   npm run deploy:site                    from a clean main checkout
//   npm run deploy:site -- --from-branch   from a clean feature branch (before its PR merges)
//
// The Bunny resources (storage zone, pull zone, hostname, edge rules, Shield) were set
// up once by hand; see docs/bunny-hosting.md. Old assets are never deleted, so an open
// tab keeps working and deploying an earlier commit is the rollback.
import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { contentTypeFor, entryScriptOf, uploadOrder } from './siteFiles.mjs';

const root = fileURLToPath(new URL('../..', import.meta.url));
const dist = join(root, 'dist');
const state = JSON.parse(readFileSync(join(root, 'site/bunny-site.json'), 'utf8'));
const SITE = `https://${state.hostname}`;

const fail = message => {
  console.error(`deploy failed: ${message}`);
  process.exit(1);
};

const git = args => execSync(`git ${args}`, { cwd: root }).toString().trim();
if (git('status --porcelain --untracked-files=no')) fail('commit your changes first: the deploy must match a commit');
if (git('status --porcelain -- public src')) fail('untracked files under public/ or src/ would be shipped');
const branch = git('rev-parse --abbrev-ref HEAD');
if (branch !== 'main' && !process.argv.includes('--from-branch')) {
  fail(`on branch ${branch}: this publishes to production; pass --from-branch to do it anyway`);
}

const env = {};
for (const line of readFileSync(join(root, '.env.local'), 'utf8').split('\n')) {
  const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, '');
}
if (!env.BUNNY_API_KEY) fail('missing in .env.local: BUNNY_API_KEY');

const api = async (method, path) => {
  const response = await fetch(`https://api.bunny.net${path}`, {
    method,
    headers: { AccessKey: env.BUNNY_API_KEY, Accept: 'application/json' },
  });
  // Status only: an error body could echo request data.
  if (!response.ok) fail(`${method} ${path.replace(/\d+/g, '{id}').replace(/\?.*$/, '')} → HTTP ${response.status}`);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

// The build runs the secret check (scripts/check-dist-secrets.mjs) and stops on a finding.
execSync('npm run build', { cwd: root, stdio: 'inherit' });

const listFiles = dir => readdirSync(dir).flatMap(name => {
  const path = join(dir, name);
  return statSync(path).isDirectory() ? listFiles(path) : [relative(dist, path).split('\\').join('/')];
});
const files = uploadOrder(listFiles(dist));
const entryScript = entryScriptOf(readFileSync(join(dist, 'index.html'), 'utf8'));
if (!entryScript) fail('dist/index.html loads no /assets/*.js bundle');

// The zone password stays in memory; it is never printed or written to disk.
const zone = await api('GET', `/storagezone/${state.storageZoneId}`);
for (const file of files) {
  const response = await fetch(`https://${zone.StorageHostname}/${zone.Name}/${file}`, {
    method: 'PUT',
    headers: { AccessKey: zone.Password, 'Content-Type': contentTypeFor(file) },
    body: readFileSync(join(dist, file)),
  });
  if (response.status !== 201) fail(`upload of ${file} → HTTP ${response.status}`);
}
console.log(`uploaded ${files.length} files (index.html last)`);

for (const host of [state.hostname, state.cdnHostname]) {
  for (const path of ['/', '/index.html']) {
    await api('POST', `/purge?url=${encodeURIComponent(`https://${host}${path}`)}`);
  }
}
console.log('purged the cached start page');

const smokeTest = async () => {
  for (let attempt = 1; attempt <= 12; attempt += 1) {
    const page = await fetch(`${SITE}/`, { cache: 'no-store' }).catch(() => null);
    const html = page?.ok ? await page.text() : '';
    if (entryScriptOf(html) === entryScript) {
      const lookup = await fetch(`${SITE}/api/address`, {
        method: 'POST',
        headers: { Origin: SITE, 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchTerm: 'Bahnhofstr 1' }),
      });
      const { results = [] } = lookup.ok ? await lookup.json() : {};
      const foreign = await fetch(`${SITE}/api/address`, {
        method: 'POST',
        headers: { Origin: 'https://evil.example', 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchTerm: 'Bahnhofstr 1' }),
      });
      const cdn = await fetch(`https://${state.cdnHostname}/#/settings`, { redirect: 'manual' });
      console.log(`smoke test: page has the new bundle; lookup → ${lookup.status} with ${results.length} results; ` +
        `foreign origin → ${foreign.status}; ${state.cdnHostname} → ${cdn.status} ${cdn.headers.get('location') ?? ''}`);
      if (results.length === 0 || foreign.status !== 403 || cdn.status !== 301 || cdn.headers.get('location') !== `${SITE}/`) {
        fail('smoke test did not behave as expected');
      }
      return;
    }
    console.log(`smoke test attempt ${attempt}: ${page ? `HTTP ${page.status}` : 'no answer'}, old or no bundle, retrying`);
    await new Promise(resolve => setTimeout(resolve, 5_000));
  }
  fail('smoke test: the live page does not load the new bundle');
};
await smokeTest();
