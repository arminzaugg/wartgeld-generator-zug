import type { LookupConfig } from './handler';
import { parseAllowedOrigins } from './request';

const DEFAULT_ORIGINS = 'https://wartgeld.nidea.ch,https://wartgeld-generator-zug.netlify.app';
const DEFAULT_MAX_PER_MINUTE = 600;

/** Builds the service configuration from Bunny variables/secrets or `.env.local`. */
export const configFromEnv = (get: (name: string) => string | undefined): LookupConfig => {
  const [tokenUrl, baseUrl, clientId, clientSecret, scope] = [
    'POST_APIM_TOKEN_URL', 'POST_APIM_BASE_URL', 'POST_APIM_CLIENT_ID', 'POST_APIM_CLIENT_SECRET', 'POST_APIM_SCOPE',
  ].map(name => get(name)?.trim() ?? '');
  const complete = [tokenUrl, baseUrl, clientId, clientSecret, scope].every(Boolean);
  const cap = Number.parseInt(get('MAX_REQUESTS_PER_MINUTE') ?? '', 10);

  return {
    post: complete ? { tokenUrl, baseUrl, clientId, clientSecret, scope } : null,
    allowedOrigins: parseAllowedOrigins(get('ALLOWED_ORIGINS') || DEFAULT_ORIGINS),
    previewSite: get('PREVIEW_SITE')?.trim() || undefined,
    maxRequestsPerMinute: Number.isFinite(cap) && cap >= 0 ? cap : DEFAULT_MAX_PER_MINUTE,
  };
};
