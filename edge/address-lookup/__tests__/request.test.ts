// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { corsHeadersFor, isAllowedOrigin, parseAllowedOrigins, parseLookupRequest } from '../request';

// @covers FR-01.10
describe('parseLookupRequest', () => {
  it('accepts the body sent by the web app and trims the search term', () => {
    expect(parseLookupRequest({ searchTerm: ' Dorfstr ', zipCode: '6300' }))
      .toEqual({ ok: true, value: { searchTerm: 'Dorfstr', zipCode: '6300' } });
    expect(parseLookupRequest({ searchTerm: 'Dorfstr', zipCode: '' }))
      .toEqual({ ok: true, value: { searchTerm: 'Dorfstr', zipCode: undefined } });
  });

  it.each([
    ['non-object body', 'hello'],
    ['null body', null],
    ['missing searchTerm', {}],
    ['too short searchTerm', { searchTerm: 'a' }],
    ['too long searchTerm', { searchTerm: 'x'.repeat(101) }],
    ['non-string searchTerm', { searchTerm: 42 }],
    ['malformed zipCode', { searchTerm: 'Dorf', zipCode: '63' }],
    ['non-string zipCode', { searchTerm: 'Dorf', zipCode: 6300 }],
    ['unexpected field', { searchTerm: 'Dorf', limit: 10 }],
  ])('rejects %s', (_, body) => {
    expect(parseLookupRequest(body).ok).toBe(false);
  });
});

// @covers FR-01.10
describe('isAllowedOrigin', () => {
  const policy = {
    allowed: parseAllowedOrigins('https://app.example.ch/, https://other.example.ch'),
    previewSite: 'wartgeld-generator-zug',
    ownOrigin: 'https://lookup.b-cdn.net',
  };

  it('normalizes the configured list', () => {
    expect(policy.allowed).toEqual(['https://app.example.ch', 'https://other.example.ch']);
  });

  it('allows configured origins, deploy previews of the site and its own origin', () => {
    expect(isAllowedOrigin('https://app.example.ch', policy)).toBe(true);
    expect(isAllowedOrigin('https://deploy-preview-176--wartgeld-generator-zug.netlify.app', policy)).toBe(true);
    expect(isAllowedOrigin('https://lookup.b-cdn.net', policy)).toBe(true);
  });

  it.each([
    ['missing origin', null],
    ['opaque origin', 'null'],
    ['unknown site', 'https://evil.example'],
    ['preview of another site', 'https://deploy-preview-1--evil.netlify.app'],
    ['site name as prefix only', 'https://deploy-preview-1--wartgeld-generator-zug-evil.netlify.app'],
    ['extra label', 'https://x.deploy-preview-1--wartgeld-generator-zug.netlify.app'],
    ['suffix attack', 'https://deploy-preview-1--wartgeld-generator-zug.netlify.app.evil.example'],
    ['non-numeric preview', 'https://deploy-preview-abc--wartgeld-generator-zug.netlify.app'],
    ['branch deploy', 'https://main--wartgeld-generator-zug.netlify.app'],
    ['plain http', 'http://deploy-preview-1--wartgeld-generator-zug.netlify.app'],
    ['explicit port', 'https://deploy-preview-1--wartgeld-generator-zug.netlify.app:8443'],
    ['configured origin over http', 'http://app.example.ch'],
  ])('refuses the origin: %s', (_, origin) => {
    expect(isAllowedOrigin(origin, policy)).toBe(false);
  });

  it('allows no previews when no site name is configured', () => {
    expect(isAllowedOrigin('https://deploy-preview-1--wartgeld-generator-zug.netlify.app',
      { ...policy, previewSite: undefined })).toBe(false);
  });
});

// @covers FR-01.10
describe('corsHeadersFor', () => {
  it('echoes the origin and varies on it', () => {
    expect(corsHeadersFor('https://app.example.ch')).toMatchObject({
      'Access-Control-Allow-Origin': 'https://app.example.ch',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      Vary: 'Origin',
    });
  });
});
