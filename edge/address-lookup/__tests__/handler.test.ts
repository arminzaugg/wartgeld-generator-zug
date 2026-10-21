// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import { createAddressHandler, type LookupConfig } from '../handler';

const APP = 'https://app.example.ch';
const SELF = 'https://lookup.b-cdn.net';
const TOKEN_URL = 'https://post.test/OAuth/token';

const config: LookupConfig = {
  post: {
    tokenUrl: TOKEN_URL,
    baseUrl: 'https://post.test/address/v1',
    clientId: 'id',
    clientSecret: ['fake', 'credential'].join('-'),
    scope: 'ADDRESS',
  },
  allowedOrigins: [APP],
  previewSite: 'wartgeld-generator-zug',
  maxRequestsPerMinute: 100,
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const at = (street: string, houseNumber: string, postcode4: string, city: string) =>
  ({ street, houseNumber, houseNumberAppendix: '', postcode4, city, canton: 'ZG' });

const setup = (answer: () => Response | Promise<Response> = () => json({ result: [] }), overrides: Partial<LookupConfig> = {}) => {
  const fetch = vi.fn(async (url: string | URL | Request, _init?: RequestInit) =>
    String(url) === TOKEN_URL ? json({ access_token: 't', expires_in: 300 }) : answer());
  const log = vi.fn();
  const handle = createAddressHandler({ ...config, ...overrides }, {
    fetch: fetch as unknown as typeof globalThis.fetch, now: () => 0, log, lookupTimeoutMs: 50,
  });
  const postBodies = () => fetch.mock.calls
    .filter(([url]) => String(url).endsWith('/autocomplete'))
    .map(([, init]) => JSON.parse(String(init?.body)).completionFields);
  return { handle, fetch, log, postBodies };
};

const lookup = (body: unknown, { origin = APP, method = 'POST', headers = {} as Record<string, string> } = {}) =>
  new Request(`${SELF}/api/address`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(origin ? { Origin: origin } : {}), ...headers },
    body: method === 'POST' ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
  });

// @covers FR-01.10
describe('address handler — request checks', () => {
  it.each([
    ['a foreign origin', 'https://evil.example'],
    ['a missing origin', ''],
  ])('refuses %s with 403 and no CORS grant', async (_, origin) => {
    const response = await setup().handle(lookup({ searchTerm: 'Bahnhof' }, { origin }));
    expect(response.status).toBe(403);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });

  it('accepts a deploy preview and its own origin', async () => {
    const { handle } = setup();
    for (const origin of ['https://deploy-preview-7--wartgeld-generator-zug.netlify.app', SELF]) {
      expect((await handle(lookup({ searchTerm: 'Bahnhof' }, { origin }))).status).toBe(200);
    }
  });

  it('answers a CORS preflight', async () => {
    const response = await setup().handle(new Request(`${SELF}/api/address`, { method: 'OPTIONS', headers: { Origin: APP } }));
    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(APP);
  });

  it('refuses other methods with 405', async () => {
    expect((await setup().handle(lookup(null, { method: 'GET' }))).status).toBe(405);
  });

  it('refuses a body over 1 KB with 413, by declared length or actual size', async () => {
    const { handle, fetch } = setup();
    expect((await handle(lookup({ searchTerm: 'ab' }, { headers: { 'Content-Length': '5000' } }))).status).toBe(413);
    expect((await handle(lookup({ searchTerm: 'ab', pad: 'x'.repeat(2000) }))).status).toBe(413);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('stops reading a streamed body without declared length as soon as it passes 1 KB', async () => {
    let pulled = 0;
    const body = new ReadableStream<Uint8Array>({
      pull(controller) {
        pulled += 1;
        controller.enqueue(new TextEncoder().encode('x'.repeat(512)));
      },
    });
    const request = new Request(`${SELF}/api/address`, {
      method: 'POST', headers: { Origin: APP }, body, duplex: 'half',
    } as RequestInit);
    const { handle, fetch } = setup();
    expect((await handle(request)).status).toBe(413);
    expect(pulled).toBeLessThan(10);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('refuses invalid JSON and invalid fields with 400', async () => {
    const { handle } = setup();
    expect((await handle(lookup('{not json'))).status).toBe(400);
    expect((await handle(lookup({ searchTerm: 'a' }))).status).toBe(400);
    expect((await handle(lookup({ searchTerm: 'Dorf', limit: 10 }))).status).toBe(400);
  });

  it('answers 503 when Swiss Post access is not configured', async () => {
    const response = await setup(undefined, { post: null }).handle(lookup({ searchTerm: 'Bahnhof' }));
    expect(response.status).toBe(503);
  });

  it('answers 429 once the per-minute cap is used up', async () => {
    const { handle } = setup(undefined, { maxRequestsPerMinute: 1 });
    expect((await handle(lookup({ searchTerm: 'Bahnhof' }))).status).toBe(200);
    expect((await handle(lookup({ searchTerm: 'Bahnhof' }))).status).toBe(429);
  });

  it('never lets responses be cached', async () => {
    const { handle } = setup();
    for (const request of [lookup({ searchTerm: 'Bahnhof' }), lookup({ searchTerm: 'a' }), lookup(null, { origin: 'https://evil.example' })]) {
      expect((await handle(request)).headers.get('Cache-Control')).toBe('no-store');
    }
  });
});

// @covers FR-01.02
describe('address handler — suggestions', () => {
  it('asks Swiss Post for Zug postcodes unless a postcode is known', async () => {
    const { handle, postBodies } = setup();
    await handle(lookup({ searchTerm: 'Bahnhofstr 1a' }));
    await handle(lookup({ searchTerm: 'Dorfstr', zipCode: '6313' }));
    await handle(lookup({ searchTerm: 'Dorfstr, 6340 Baar', zipCode: '6313' }));
    expect(postBodies()).toEqual([
      { street: 'Bahnhofstr', houseNumber: '1', houseNumberAppendix: 'a', postcode4: '63' },
      { street: 'Dorfstr', postcode4: '6313' },
      { street: 'Dorfstr', postcode4: '6340', city: 'Baar' },
    ]);
  });

  it('keeps only offered Zug localities, exact house numbers first, at most 10', async () => {
    const answer = [
      at('Bahnhofstrasse', '10', '6300', 'Zug'),
      at('Bahnhofstrasse', '1', '8001', 'Zürich'),
      at('Bahnhofstrasse', '1', '8836', 'Bennau'),
      at('Bahnhofstrasse', '1', '6340', 'Sihlbrugg'),
      at('', '1', '6300', 'Zug'),
      at('Bahnhofstrasse', '1', '6300', 'Zug'),
      ...Array.from({ length: 12 }, (_, i) => at('Bahnhofstrasse', String(20 + i), '6340', 'Baar')),
    ];
    const response = await setup(() => json({ result: answer })).handle(lookup({ searchTerm: 'Bahnhofstr 1' }));
    const { results } = await response.json();

    expect(results).toHaveLength(10);
    expect(results.slice(0, 2)).toEqual([
      { street: 'Bahnhofstrasse', houseNumber: '1', houseNumberAddition: '', postcode: '6340', town: 'Sihlbrugg' },
      { street: 'Bahnhofstrasse', houseNumber: '1', houseNumberAddition: '', postcode: '6300', town: 'Zug' },
    ]);
    expect(results.map((r: { town: string }) => r.town)).not.toContain('Bennau');
    expect(results.map((r: { postcode: string }) => r.postcode)).not.toContain('8001');
  });

  it('leaves out parcel pickup points, which are not home addresses', async () => {
    const answer = [at('PickMup Baar', '', '6340', 'Baar'), at('MP Dorfstrasse', '', '6340', 'Baar'), at('Dorfstrasse', '', '6340', 'Baar')];
    const response = await setup(() => json({ result: answer })).handle(lookup({ searchTerm: 'Dorf' }));
    expect((await response.json()).results.map((r: { street: string }) => r.street)).toEqual(['Dorfstrasse']);
  });

  it('shows an address only once when Swiss Post lists several buildings for it', async () => {
    const answer = [at('Seestrasse', '3', '6300', 'Zug'), at('Seestrasse', '3', '6300', 'Zug')];
    const response = await setup(() => json({ result: answer })).handle(lookup({ searchTerm: 'Seestrasse 3' }));
    expect((await response.json()).results).toHaveLength(1);
  });

  it('skips malformed entries from Swiss Post instead of failing the lookup', async () => {
    const answer = [null, { street: 42, city: 'Zug', postcode4: '6300' }, at('Dorfstrasse', '', '6340', 'Baar')];
    const response = await setup(() => json({ result: answer })).handle(lookup({ searchTerm: 'Dorf' }));
    expect(response.status).toBe(200);
    expect((await response.json()).results.map((r: { street: string }) => r.street)).toEqual(['Dorfstrasse']);
  });

  it('ranks closer street names first when no house number is typed', async () => {
    const answer = [at('Alte Dorfstrasse', '', '6300', 'Zug'), at('Dorfstrasse', '', '6313', 'Menzingen')];
    const response = await setup(() => json({ result: answer })).handle(lookup({ searchTerm: 'Dorf' }));
    expect((await response.json()).results.map((r: { street: string }) => r.street))
      .toEqual(['Dorfstrasse', 'Alte Dorfstrasse']);
  });
});

// @covers FR-01.10
describe('address handler — failures and logging', () => {
  it('answers 502 without address data when Swiss Post fails', async () => {
    const response = await setup(() => json({ detail: 'Bahnhofstrasse 1 Zug broke' }, 500)).handle(lookup({ searchTerm: 'Bahnhofstr 1' }));
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: 'Address lookup failed' });
  });

  it('answers 502 when Swiss Post does not answer in time', async () => {
    const response = await setup(() => new Promise<Response>(() => {})).handle(lookup({ searchTerm: 'Bahnhof' }));
    expect(response.status).toBe(502);
  });

  it('logs neither the search text nor Swiss Post answers', async () => {
    const ok = setup(() => json({ result: [at('Geheimweg', '7', '6300', 'Zug')] }));
    await ok.handle(lookup({ searchTerm: 'Geheimweg 7' }));
    const failing = setup(() => json({ detail: 'Geheimweg leaked' }, 500));
    await failing.handle(lookup({ searchTerm: 'Geheimweg 7' }));

    const lines = [...ok.log.mock.calls, ...failing.log.mock.calls].flat().join('\n');
    expect(lines).toMatch(/address-lookup ok: 1\/1 results/);
    expect(lines).toMatch(/address-lookup failed: status 500/);
    expect(lines).not.toMatch(/Geheimweg|leaked/);
  });
});
