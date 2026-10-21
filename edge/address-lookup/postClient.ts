/** Swiss Post APIM Address Query v1 (OAuth client credentials + /autocomplete). */
export interface PostConfig {
  tokenUrl: string;
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  scope: string;
}

export interface CompletionFields {
  street?: string;
  houseNumber?: string;
  houseNumberAppendix?: string;
  postcode4?: string;
  city?: string;
}

export interface PostAddress {
  street?: string;
  houseNumber?: string;
  houseNumberAppendix?: string;
  postcode4?: string;
  city?: string;
}

export type PostFailure = 'token' | 'status' | 'timeout' | 'format';

/** Carries only a reason and a status code — never Swiss Post's answer text. */
export class PostError extends Error {
  constructor(public readonly reason: PostFailure, public readonly status?: number) {
    super(status ? `${reason} ${status}` : reason);
    this.name = 'PostError';
  }
}

interface PostClientDeps {
  fetch: typeof fetch;
  now: () => number;
  tokenTimeoutMs?: number;
}

interface Token {
  value: string;
  refreshAt: number;
  expiresAt: number;
}

/** Tokens are renewed this long before Swiss Post says they expire. */
const REFRESH_MARGIN_MS = 30_000;

/**
 * Runs `request` with a signal that aborts after `ms` or when `parent` aborts.
 * The abort also settles the returned promise, so a call that ignores its
 * signal cannot hold a lookup past the deadline.
 */
const withDeadline = async <T>(ms: number | undefined, parent: AbortSignal | undefined,
  request: (signal: AbortSignal) => Promise<T>): Promise<T> => {
  const controller = new AbortController();
  let onAbort = () => {};
  const aborted = new Promise<never>((_, reject) => {
    onAbort = () => reject(new PostError('timeout'));
  });
  aborted.catch(() => {}); // only observed through the race below
  const abort = () => {
    controller.abort();
    onAbort();
  };
  const timer = ms === undefined ? undefined : setTimeout(abort, ms);
  if (parent?.aborted) abort();
  parent?.addEventListener('abort', abort);
  try {
    if (controller.signal.aborted) throw new PostError('timeout');
    const work = request(controller.signal);
    // The request may still reject after losing the race; that is expected.
    work.catch(() => {});
    return await Promise.race([work, aborted]);
  } catch (error) {
    if (error instanceof PostError) throw error;
    if (controller.signal.aborted) throw new PostError('timeout');
    throw error;
  } finally {
    clearTimeout(timer);
    parent?.removeEventListener('abort', abort);
  }
};

/** Releases the connection of an answer whose body is not needed. */
const discard = (response: Response) => response.body?.cancel().catch(() => {});

export const createPostClient = (config: PostConfig, deps: PostClientDeps) => {
  const { fetch, now, tokenTimeoutMs = 3_000 } = deps;
  let token: Token | null = null;
  let pending: Promise<Token> | null = null;

  const requestToken = () => withDeadline(tokenTimeoutMs, undefined, async signal => {
    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: config.clientId,
        client_secret: config.clientSecret,
        scope: config.scope,
      }),
      signal,
    });
    if (!response.ok) {
      await discard(response);
      throw new PostError('token', response.status);
    }
    const body = await response.json().catch(() => null) as { access_token?: unknown; expires_in?: unknown } | null;
    if (typeof body?.access_token !== 'string' || typeof body.expires_in !== 'number') {
      throw new PostError('token');
    }
    const expiresAt = now() + body.expires_in * 1000;
    return { value: body.access_token, refreshAt: expiresAt - REFRESH_MARGIN_MS, expiresAt };
  });

  /**
   * One token request at a time; a failed request is forgotten so the next lookup asks again.
   * An early refresh that fails falls back to the old token while it is still valid.
   */
  const currentToken = async (): Promise<Token> => {
    if (token && now() < token.refreshAt) return token;
    pending ??= requestToken()
      .then(fresh => (token = fresh))
      .finally(() => { pending = null; });
    const previous = token;
    return pending.catch(error => {
      if (previous && previous === token && now() < previous.expiresAt) return previous;
      throw error;
    });
  };

  const query = (fields: CompletionFields, bearer: string, signal?: AbortSignal) =>
    withDeadline(undefined, signal, inner => fetch(`${config.baseUrl}/autocomplete`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${bearer}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        completionFields: fields,
        postcodeOrderMode: 'NUMERIC_ASCENDING',
        postcodeFilterMode: 'DOMICILE',
      }),
      signal: inner,
    }));

  return {
    async autocomplete(fields: CompletionFields, signal?: AbortSignal): Promise<PostAddress[]> {
      // A token request shared with other lookups keeps running; only this lookup stops waiting.
      const tokenWithin = () => withDeadline(undefined, signal, currentToken);
      let used = await tokenWithin();
      let response = await query(fields, used.value, signal);
      if (response.status === 401) {
        await discard(response);
        if (token === used) token = null;
        used = await tokenWithin();
        response = await query(fields, used.value, signal);
      }
      if (!response.ok) {
        await discard(response);
        throw new PostError('status', response.status);
      }

      const body = await withDeadline(undefined, signal, () => response.json().catch(() => null)) as { result?: unknown } | null;
      if (!Array.isArray(body?.result)) throw new PostError('format');
      return body.result as PostAddress[];
    },
  };
};
