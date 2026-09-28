export const MAX_BODY_BYTES = 1024;

const SEARCH_TYPES = ['street', 'zip', 'city'] as const;
export type SearchType = typeof SEARCH_TYPES[number];

export interface LookupRequest {
  type?: SearchType;
  searchTerm: string;
  zipCode?: string;
}

export type ParseResult =
  | { ok: true; value: LookupRequest }
  | { ok: false; error: string };

/** Validates the JSON body sent by the web app; anything unexpected is rejected. */
export const parseLookupRequest = (body: unknown): ParseResult => {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: 'Invalid request body' };
  }
  const { type, searchTerm, zipCode } = body as Record<string, unknown>;

  if (typeof searchTerm !== 'string' || searchTerm.trim().length < 2 || searchTerm.length > 100) {
    return { ok: false, error: 'searchTerm must be 2-100 characters' };
  }
  if (type !== undefined && !SEARCH_TYPES.includes(type as SearchType)) {
    return { ok: false, error: 'Invalid search type' };
  }
  if (zipCode !== undefined && zipCode !== null && zipCode !== '' &&
      (typeof zipCode !== 'string' || !/^\d{4}$/.test(zipCode))) {
    return { ok: false, error: 'zipCode must be 4 digits' };
  }

  return {
    ok: true,
    value: {
      type: type as SearchType | undefined,
      searchTerm: searchTerm.trim(),
      zipCode: typeof zipCode === 'string' && zipCode !== '' ? zipCode : undefined,
    },
  };
};

/** Parses a comma-separated origin allowlist, e.g. from the ALLOWED_ORIGINS secret. */
export const parseAllowedOrigins = (value: string | undefined): string[] =>
  (value ?? '').split(',').map(origin => origin.trim().replace(/\/$/, '')).filter(Boolean);

/** CORS headers for an allowed origin, or null when the origin may not call this function. */
export const corsHeadersFor = (origin: string | null, allowedOrigins: string[]): Record<string, string> | null => {
  if (!origin || !allowedOrigins.includes(origin)) return null;
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
};

/** First address in X-Forwarded-For (set by the Supabase edge proxy). */
export const clientIp = (forwardedFor: string | null): string =>
  forwardedFor?.split(',')[0]?.trim() || 'unknown';
