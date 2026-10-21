import { isOfferedLocality } from '../../src/lib/municipality';
import { parseAddressInput } from '../../src/utils/addressParser';
import { createPostClient, PostError, type CompletionFields, type PostAddress, type PostConfig } from './postClient';
import { createRateLimiter } from './rateLimit';
import { corsHeadersFor, isAllowedOrigin, MAX_BODY_BYTES, parseLookupRequest } from './request';
import { compareStreets } from './sort';

export interface LookupConfig {
  /** null when the Swiss Post credentials are missing: every lookup answers 503. */
  post: PostConfig | null;
  allowedOrigins: string[];
  previewSite?: string;
  maxRequestsPerMinute: number;
}

export interface HandlerDeps {
  fetch: typeof fetch;
  now: () => number;
  /** Receives fixed messages with counts, status and duration only. */
  log: (line: string) => void;
  lookupTimeoutMs?: number;
}

/** The contract between this service and the web app (`/api/address`). */
export interface AddressSuggestion {
  street: string;
  houseNumber: string;
  houseNumberAddition: string;
  postcode: string;
  town: string;
}

const MAX_RESULTS = 10;
/** Swiss Post lists parcel pickup points (PickMup) and parcel machines (MP …) as streets. */
const PICKUP_POINT = /^(PickMup|MP)\s/;
/** Without a postcode Swiss Post returns ~100 Swiss-wide results in town order; all Zug postcodes start with 63. */
const ZUG_POSTCODE_PREFIX = '63';

const toFields = (searchTerm: string, knownZip?: string): CompletionFields => {
  const { streetName, houseNumber, addition, zipCode, city } = parseAddressInput(searchTerm);
  const fields: CompletionFields = {
    street: streetName,
    houseNumber,
    houseNumberAppendix: addition,
    postcode4: zipCode || knownZip || ZUG_POSTCODE_PREFIX,
    city,
  };
  return Object.fromEntries(Object.entries(fields).filter(([, v]) => v)) as CompletionFields;
};

const key = (a: AddressSuggestion) => [a.street, a.houseNumber, a.houseNumberAddition, a.postcode, a.town].join('|');

const toSuggestions = (results: PostAddress[], fields: CompletionFields): AddressSuggestion[] => {
  const exact = (a: AddressSuggestion) => Boolean(fields.houseNumber) && a.houseNumber === fields.houseNumber
    && (!fields.houseNumberAppendix || a.houseNumberAddition.toLowerCase() === fields.houseNumberAppendix.toLowerCase());
  return results
    .map(r => ({
      street: r.street?.trim() ?? '',
      houseNumber: r.houseNumber ?? '',
      houseNumberAddition: r.houseNumberAppendix ?? '',
      postcode: r.postcode4 ?? '',
      town: r.city ?? '',
    }))
    .filter(a => a.street && !PICKUP_POINT.test(a.street) && isOfferedLocality(a.postcode, a.town))
    // Several buildings can share one address; show it once.
    .filter((a, i, all) => all.findIndex(b => key(b) === key(a)) === i)
    .sort(compareStreets(fields.street ?? ''))
    .sort((a, b) => Number(exact(b)) - Number(exact(a)))
    .slice(0, MAX_RESULTS);
};

export const createAddressHandler = (config: LookupConfig, deps: HandlerDeps) => {
  const { fetch, now, log, lookupTimeoutMs = 8_000 } = deps;
  const post = config.post && createPostClient(config.post, { fetch, now });
  const withinLimit = createRateLimiter(config.maxRequestsPerMinute, now);

  return async (request: Request): Promise<Response> => {
    const origin = request.headers.get('origin');
    const allowed = isAllowedOrigin(origin, {
      allowed: config.allowedOrigins,
      previewSite: config.previewSite,
      ownOrigin: new URL(request.url).origin,
    });
    const cors = allowed && origin ? corsHeadersFor(origin) : {};
    const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
      status,
      headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });

    if (!allowed) return reply({ error: 'Origin not allowed' }, 403);
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: { ...cors, 'Cache-Control': 'no-store' } });
    }
    if (request.method !== 'POST') return reply({ error: 'Method not allowed' }, 405);
    if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) {
      return reply({ error: 'Request too large' }, 413);
    }

    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) return reply({ error: 'Request too large' }, 413);
    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return reply({ error: 'Invalid JSON' }, 400);
    }
    const parsed = parseLookupRequest(body);
    if (!parsed.ok) return reply({ error: parsed.error }, 400);

    if (!post) return reply({ error: 'Address lookup not configured' }, 503);
    if (!withinLimit()) {
      log('address-lookup rate limit reached');
      return reply({ error: 'Too many requests' }, 429);
    }

    const startedAt = now();
    const fields = toFields(parsed.value.searchTerm, parsed.value.zipCode);
    const deadline = new AbortController();
    const timer = setTimeout(() => deadline.abort(), lookupTimeoutMs);
    try {
      const results = await post.autocomplete(fields, deadline.signal);
      const suggestions = toSuggestions(results, fields);
      // No request or response content in the logs: they contain addresses.
      log(`address-lookup ok: ${suggestions.length}/${results.length} results in ${now() - startedAt} ms`);
      return reply({ results: suggestions });
    } catch (error) {
      log(`address-lookup failed: ${error instanceof PostError ? error.message : 'network'} after ${now() - startedAt} ms`);
      return reply({ error: 'Address lookup failed' }, 502);
    } finally {
      clearTimeout(timer);
    }
  };
};
