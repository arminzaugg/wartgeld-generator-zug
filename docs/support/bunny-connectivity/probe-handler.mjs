// Temporary, credential-free connectivity probe. Never deployed to the production script.
const TARGETS = [
  { name: 'post-token', url: 'https://api.post.ch/OAuth/token', method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=client_credentials' },
  { name: 'post-autocomplete', url: 'https://eirene.apis.post.ch/location/address/query/v1/autocomplete', method: 'POST',
    headers: { 'Content-Type': 'application/json' }, body: '{}' },
  { name: 'control', url: 'https://bunny.net/', method: 'GET' },
];

export const createProbeHandler = ({ key, expiresAt, fetch, timeoutMs = 12_000 }) => {
  let used = false;
  const reply = (data, status) => new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
  });
  return async request => {
    if (new URL(request.url).pathname !== '/probe') return reply({}, 404);
    if (request.method !== 'POST') return reply({}, 405);
    if (!key || key.length < 32 || !Number.isFinite(expiresAt)) return reply({}, 503);
    if (Date.now() > expiresAt) return reply({}, 410);
    if (request.headers.get('X-Diagnostic-Key') !== key) return reply({}, 403);
    if (used) return reply({}, 429);
    used = true; // at most one run per instance; expiry/key also bound other instances.
    const probe = async target => {
      const started = Date.now();
      const controller = new AbortController();
      let timer;
      const deadline = new Promise((_, reject) => {
        timer = setTimeout(() => { controller.abort(); reject(new Error('deadline')); }, timeoutMs);
      });
      try {
        const response = await Promise.race([
          fetch(target.url, { method: target.method, headers: target.headers, body: target.body,
            signal: controller.signal, redirect: 'manual' }), deadline,
        ]);
        // Do not read or log upstream content; invalid/no credentials are intentional.
        response.body?.cancel().catch(() => {});
        return { target: target.name, status: response.status, elapsed_ms: Date.now() - started };
      } catch {
        return { target: target.name, error: controller.signal.aborted ? 'timeout' : 'network', elapsed_ms: Date.now() - started };
      } finally {
        clearTimeout(timer);
      }
    };
    return reply({ credential_free: true, probes: await Promise.all(TARGETS.map(probe)) }, 200);
  };
};
