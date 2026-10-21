// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import { createPostClient, PostError, type PostConfig } from '../postClient';

/** Fake credential, built at runtime so secret scanners don't flag the fixture. */
const FAKE_CREDENTIAL = ['fake', 'credential'].join('-');

const config: PostConfig = {
  tokenUrl: 'https://post.test/OAuth/token',
  baseUrl: 'https://post.test/address/v1',
  clientId: 'id-1',
  clientSecret: FAKE_CREDENTIAL,
  scope: 'ADDRESS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const ADDRESS = { street: 'Bahnhofstrasse', houseNumber: '1', postcode4: '6300', city: 'Zug', canton: 'ZG' };

/** Fake Swiss Post: hands out numbered tokens and answers autocomplete calls via `answer`. */
const fakePost = (answer: (token: string) => Response | Promise<Response> = () => json({ result: [ADDRESS] })) => {
  let issued = 0;
  const fetch = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    if (String(url) === config.tokenUrl) {
      issued += 1;
      return json({ access_token: `token-${issued}`, token_type: 'Bearer', expires_in: 300 });
    }
    const auth = new Headers(init?.headers).get('Authorization') ?? '';
    return answer(auth.replace('Bearer ', ''));
  });
  const calls = (url: string) => fetch.mock.calls.filter(([u]) => String(u) === url);
  return { fetch: fetch as unknown as typeof globalThis.fetch, calls };
};

const autocompleteUrl = `${config.baseUrl}/autocomplete`;

// @covers FR-01.02
describe('createPostClient — autocomplete', () => {
  it('gets a client-credentials token and queries domicile addresses with it', async () => {
    const post = fakePost();
    const client = createPostClient(config, { fetch: post.fetch, now: () => 0 });

    await expect(client.autocomplete({ street: 'Bahnhofstr', postcode4: '63' })).resolves.toEqual([ADDRESS]);

    const [[, tokenInit]] = post.calls(config.tokenUrl);
    expect(Object.fromEntries(new URLSearchParams(String(tokenInit?.body)))).toEqual({
      grant_type: 'client_credentials', client_id: 'id-1', client_secret: FAKE_CREDENTIAL, scope: 'ADDRESS',
    });
    const [[, init]] = post.calls(autocompleteUrl);
    expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer token-1');
    expect(JSON.parse(String(init?.body))).toEqual({
      completionFields: { street: 'Bahnhofstr', postcode4: '63' },
      postcodeOrderMode: 'NUMERIC_ASCENDING',
      postcodeFilterMode: 'DOMICILE',
    });
  });

  it('rejects a malformed answer', async () => {
    const post = fakePost(() => json({ unexpected: true }));
    const client = createPostClient(config, { fetch: post.fetch, now: () => 0 });
    await expect(client.autocomplete({ street: 'X' })).rejects.toMatchObject({ reason: 'format' });
  });

  it('rejects a failed answer with its status', async () => {
    const post = fakePost(() => json({ error: 'boom' }, 500));
    const client = createPostClient(config, { fetch: post.fetch, now: () => 0 });
    await expect(client.autocomplete({ street: 'X' })).rejects.toMatchObject({ reason: 'status', status: 500 });
  });

  it('gives up when Swiss Post does not answer before the caller aborts', async () => {
    const post = fakePost(() => new Promise<Response>(() => {}));
    const fetch = vi.fn((url: string | URL | Request, init?: RequestInit) =>
      String(url) === autocompleteUrl
        ? new Promise<Response>((_, reject) => init?.signal?.addEventListener('abort', () => reject(new Error('aborted'))))
        : post.fetch(url, init));
    const client = createPostClient(config, { fetch: fetch as typeof globalThis.fetch, now: () => 0 });
    const controller = new AbortController();
    const pending = client.autocomplete({ street: 'X' }, controller.signal);
    controller.abort();
    await expect(pending).rejects.toMatchObject({ reason: 'timeout' });
  });
});

// @covers FR-01.10
describe('createPostClient — token handling', () => {
  it('reuses the token until shortly before it expires', async () => {
    let now = 0;
    const post = fakePost();
    const client = createPostClient(config, { fetch: post.fetch, now: () => now });

    await client.autocomplete({ street: 'A' });
    now = 269_000;
    await client.autocomplete({ street: 'B' });
    expect(post.calls(config.tokenUrl)).toHaveLength(1);

    now = 271_000; // 300 s lifetime minus 30 s margin
    await client.autocomplete({ street: 'C' });
    expect(post.calls(config.tokenUrl)).toHaveLength(2);
  });

  it('shares one token request between concurrent lookups', async () => {
    const post = fakePost();
    const client = createPostClient(config, { fetch: post.fetch, now: () => 0 });
    await Promise.all([client.autocomplete({ street: 'A' }), client.autocomplete({ street: 'B' })]);
    expect(post.calls(config.tokenUrl)).toHaveLength(1);
  });

  it('retries once with a fresh token when Swiss Post answers 401', async () => {
    const post = fakePost(token => token === 'token-1' ? json({}, 401) : json({ result: [ADDRESS] }));
    const client = createPostClient(config, { fetch: post.fetch, now: () => 0 });
    await expect(client.autocomplete({ street: 'A' })).resolves.toEqual([ADDRESS]);
    expect(post.calls(config.tokenUrl)).toHaveLength(2);
  });

  it('fails after the second 401 without retrying again', async () => {
    const post = fakePost(() => json({}, 401));
    const client = createPostClient(config, { fetch: post.fetch, now: () => 0 });
    await expect(client.autocomplete({ street: 'A' })).rejects.toMatchObject({ reason: 'status', status: 401 });
    expect(post.calls(autocompleteUrl)).toHaveLength(2);
  });

  it('fails when no token is issued and asks again on the next lookup', async () => {
    let tokenStatus = 400;
    const fetch = vi.fn(async (url: string | URL | Request) =>
      String(url) === config.tokenUrl
        ? (tokenStatus === 200 ? json({ access_token: 't', expires_in: 300 }) : json({ error: 'invalid_client' }, tokenStatus))
        : json({ result: [] }));
    const client = createPostClient(config, { fetch: fetch as typeof globalThis.fetch, now: () => 0 });

    const failure = await client.autocomplete({ street: 'A' }).catch(e => e);
    expect(failure).toBeInstanceOf(PostError);
    expect(failure).toMatchObject({ reason: 'token', status: 400 });

    tokenStatus = 200;
    await expect(client.autocomplete({ street: 'A' })).resolves.toEqual([]);
  });

  it('gives up on a token request that takes too long', async () => {
    const fetch = vi.fn((_url: string | URL | Request, init?: RequestInit) =>
      new Promise<Response>((_, reject) => init?.signal?.addEventListener('abort', () => reject(new Error('aborted')))));
    const client = createPostClient(config, { fetch: fetch as typeof globalThis.fetch, now: () => 0, tokenTimeoutMs: 5 });
    await expect(client.autocomplete({ street: 'A' })).rejects.toMatchObject({ reason: 'timeout' });
  });
});
