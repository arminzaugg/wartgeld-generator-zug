// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { configFromEnv } from '../config';

const POST_ENV = {
  POST_APIM_TOKEN_URL: 'https://post.test/OAuth/token',
  POST_APIM_BASE_URL: 'https://post.test/address/v1',
  POST_APIM_CLIENT_ID: 'id',
  POST_APIM_CLIENT_SECRET: ['fake', 'credential'].join('-'),
  POST_APIM_SCOPE: 'ADDRESS',
};
const from = (env: Record<string, string>) => configFromEnv(name => env[name]);

// @covers FR-01.10
describe('configFromEnv', () => {
  it('reads Swiss Post access, origins, preview site and cap', () => {
    expect(from({
      ...POST_ENV,
      ALLOWED_ORIGINS: 'https://a.example, https://b.example/',
      PREVIEW_SITE: 'wartgeld-generator-zug',
      MAX_REQUESTS_PER_MINUTE: '120',
    })).toEqual({
      post: {
        tokenUrl: POST_ENV.POST_APIM_TOKEN_URL,
        baseUrl: POST_ENV.POST_APIM_BASE_URL,
        clientId: 'id',
        clientSecret: POST_ENV.POST_APIM_CLIENT_SECRET,
        scope: 'ADDRESS',
      },
      allowedOrigins: ['https://a.example', 'https://b.example'],
      previewSite: 'wartgeld-generator-zug',
      maxRequestsPerMinute: 120,
    });
  });

  it('leaves Swiss Post unconfigured when any value is missing', () => {
    const { POST_APIM_SCOPE: _, ...incomplete } = POST_ENV;
    expect(from(incomplete).post).toBeNull();
  });

  it('defaults to the production site, no previews and 600 requests per minute', () => {
    expect(from({ MAX_REQUESTS_PER_MINUTE: 'lots' })).toMatchObject({
      allowedOrigins: ['https://wartgeld-generator-zug.netlify.app'],
      previewSite: undefined,
      maxRequestsPerMinute: 600,
    });
  });
});
