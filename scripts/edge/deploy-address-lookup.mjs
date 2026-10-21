// Deploys the address lookup service to Bunny Edge Scripting (manual, run from a
// developer machine). Reads credentials from .env.local; prints ids, hostnames
// and status codes only — never a secret value.
//
//   npm run deploy:edge            build, upload, set secrets/variables, publish, smoke test
//
// Rollback: republish the previous release in the Bunny dashboard
// (Edge Scripting → wartgeld-address-lookup → Releases), or revert netlify.toml.
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildAddressLookup, OUTFILE } from './build-address-lookup.mjs';

const root = fileURLToPath(new URL('../..', import.meta.url));
const STATE_FILE = `${root}edge/address-lookup/bunny.json`;
const API = 'https://api.bunny.net';
const SCRIPT_NAME = 'wartgeld-address-lookup';
const SITE = 'https://wartgeld-generator-zug.netlify.app';

const SECRETS = ['POST_APIM_CLIENT_ID', 'POST_APIM_CLIENT_SECRET'];
const VARIABLES = {
  POST_APIM_TOKEN_URL: env => env.POST_APIM_TOKEN_URL,
  POST_APIM_BASE_URL: env => env.POST_APIM_BASE_URL,
  POST_APIM_SCOPE: env => env.POST_APIM_SCOPE,
  ALLOWED_ORIGINS: () => SITE,
  PREVIEW_SITE: () => 'wartgeld-generator-zug',
  MAX_REQUESTS_PER_MINUTE: () => '600',
};

const fail = message => {
  console.error(`deploy failed: ${message}`);
  process.exit(1);
};

const readEnv = () => {
  const env = {};
  for (const line of readFileSync(`${root}.env.local`, 'utf8').split('\n')) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, '');
  }
  const required = ['BUNNY_API_KEY', ...SECRETS, 'POST_APIM_TOKEN_URL', 'POST_APIM_BASE_URL', 'POST_APIM_SCOPE'];
  const missing = required.filter(name => !env[name]);
  if (missing.length) fail(`missing in .env.local: ${missing.join(', ')}`);
  return env;
};

const bunny = apiKey => async (method, path, body) => {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: { AccessKey: apiKey, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    // Bunny's error key only; the body could echo request data.
    const errorKey = await response.json().then(b => b?.ErrorKey ?? '', () => '');
    fail(`${method} ${path.replace(/\/\d+/g, '/{id}')} → HTTP ${response.status} ${errorKey}`);
  }
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

const hostnameOf = script =>
  script?.LinkedPullZones?.[0]?.DefaultHostname ?? script?.DefaultHostname ?? script?.SystemHostname;

const lookup = (hostname, origin) => fetch(`https://${hostname}/api/address`, {
  method: 'POST',
  headers: { Origin: origin, 'Content-Type': 'application/json' },
  body: JSON.stringify({ searchTerm: 'Bahnhofstr 1' }),
});

const smokeTest = async hostname => {
  for (let attempt = 1; attempt <= 12; attempt += 1) {
    const allowed = await lookup(hostname, SITE).catch(() => null);
    if (allowed?.status === 200) {
      const { results = [] } = await allowed.json();
      const foreign = await lookup(hostname, 'https://evil.example');
      console.log(`smoke test: allowed origin → 200 with ${results.length} results; foreign origin → ${foreign.status}`);
      if (results.length === 0 || foreign.status !== 403) fail('smoke test did not behave as expected');
      return;
    }
    console.log(`smoke test attempt ${attempt}: ${allowed ? `HTTP ${allowed.status}` : 'no answer'}, retrying`);
    await new Promise(resolve => setTimeout(resolve, 5_000));
  }
  fail('smoke test: the service did not answer 200');
};

const env = readEnv();
const call = bunny(env.BUNNY_API_KEY);

await buildAddressLookup();
const code = readFileSync(OUTFILE, 'utf8');
console.log(`built ${OUTFILE.slice(root.length)} (${code.length} bytes)`);

let state = existsSync(STATE_FILE) ? JSON.parse(readFileSync(STATE_FILE, 'utf8')) : null;
if (!state) {
  const created = await call('POST', '/compute/script', {
    Name: SCRIPT_NAME,
    Code: code,
    ScriptType: 1,
    CreateLinkedPullZone: true,
    LinkedPullZoneName: SCRIPT_NAME,
  });
  state = { scriptId: created.Id, hostname: hostnameOf(created) };
  if (!state.scriptId || !state.hostname) fail('Bunny did not return a script id and hostname');
  writeFileSync(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`);
  console.log(`created script ${state.scriptId} at ${state.hostname} (recorded in edge/address-lookup/bunny.json)`);
} else {
  await call('POST', `/compute/script/${state.scriptId}/code`, { Code: code });
  console.log(`uploaded code to script ${state.scriptId}`);
}

for (const name of SECRETS) {
  await call('PUT', `/compute/script/${state.scriptId}/secrets`, { Name: name, Secret: env[name] });
}
for (const [name, value] of Object.entries(VARIABLES)) {
  await call('PUT', `/compute/script/${state.scriptId}/variables`, { Name: name, Required: false, DefaultValue: value(env) });
}
console.log(`set ${SECRETS.length} secrets and ${Object.keys(VARIABLES).length} variables`);

const commit = execSync('git rev-parse --short HEAD', { cwd: root }).toString().trim();
await call('POST', `/compute/script/${state.scriptId}/publish`, { Note: `deploy ${commit}` });
console.log(`published release for ${commit}`);

await smokeTest(state.hostname);
