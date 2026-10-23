export const MAX_BODY_BYTES = 1024;

export interface LookupRequest {
  searchTerm: string;
  /** Postcode already known to the form; narrows the search when the text has none. */
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
  const { searchTerm, zipCode, ...unexpected } = body as Record<string, unknown>;
  if (Object.keys(unexpected).length > 0) {
    return { ok: false, error: 'Unexpected fields' };
  }

  if (typeof searchTerm !== 'string' || searchTerm.trim().length < 2 || searchTerm.length > 100) {
    return { ok: false, error: 'searchTerm must be 2-100 characters' };
  }
  if (zipCode !== undefined && zipCode !== null && zipCode !== '' &&
      (typeof zipCode !== 'string' || !/^\d{4}$/.test(zipCode))) {
    return { ok: false, error: 'zipCode must be 4 digits' };
  }

  return {
    ok: true,
    value: {
      searchTerm: searchTerm.trim(),
      zipCode: typeof zipCode === 'string' && zipCode !== '' ? zipCode : undefined,
    },
  };
};

/** Parses a comma-separated origin list, e.g. from the ALLOWED_ORIGINS variable. */
export const parseAllowedOrigins = (value: string | undefined): string[] =>
  (value ?? '').split(',').map(origin => origin.trim().replace(/\/$/, '')).filter(Boolean);

export interface OriginPolicy {
  allowed: string[];
  /** Netlify site name whose deploy previews may call the service. */
  previewSite?: string;
  /** The service's own origin, taken from the request URL (never from forwarded headers). */
  ownOrigin: string;
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Exact origin match only: no prefix, suffix, scheme or port variations. */
export const isAllowedOrigin = (origin: string | null, policy: OriginPolicy): boolean => {
  if (!origin) return false;
  if (origin === policy.ownOrigin || policy.allowed.includes(origin)) return true;
  if (!policy.previewSite) return false;
  // previewSite is deployment config (PREVIEW_SITE) and goes through escapeRegExp; lookalike origins are refused in __tests__/request.test.ts.
  // nosemgrep: javascript.lang.security.audit.detect-non-literal-regexp.detect-non-literal-regexp
  const preview = new RegExp(`^https://deploy-preview-\\d+--${escapeRegExp(policy.previewSite)}\\.netlify\\.app$`);
  return preview.test(origin);
};

export const corsHeadersFor = (origin: string): Record<string, string> => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
});
