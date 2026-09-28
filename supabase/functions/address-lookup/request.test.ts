import { describe, it, expect } from 'vitest';
import { clientIp, corsHeadersFor, parseAllowedOrigins, parseLookupRequest } from './request.ts';

describe('parseLookupRequest', () => {
  it('accepts the body sent by the web app', () => {
    expect(parseLookupRequest({ type: 'street', searchTerm: ' Dorfstr ', zipCode: '6300', limit: 10 }))
      .toEqual({ ok: true, value: { type: 'street', searchTerm: 'Dorfstr', zipCode: '6300' } });
    expect(parseLookupRequest({ type: 'street', searchTerm: 'Dorfstr' }))
      .toEqual({ ok: true, value: { type: 'street', searchTerm: 'Dorfstr', zipCode: undefined } });
  });

  it.each([
    ['non-object body', 'hello'],
    ['null body', null],
    ['missing searchTerm', { type: 'street' }],
    ['too short searchTerm', { searchTerm: 'a' }],
    ['too long searchTerm', { searchTerm: 'x'.repeat(101) }],
    ['non-string searchTerm', { searchTerm: 42 }],
    ['unknown type', { type: 'house', searchTerm: 'Dorf' }],
    ['malformed zipCode', { searchTerm: 'Dorf', zipCode: '63' }],
  ])('rejects %s', (_, body) => {
    expect(parseLookupRequest(body).ok).toBe(false);
  });
});

describe('corsHeadersFor', () => {
  const allowed = parseAllowedOrigins('https://app.example.ch/, http://localhost:8080');

  it('normalizes the allowlist', () => {
    expect(allowed).toEqual(['https://app.example.ch', 'http://localhost:8080']);
  });

  it('echoes an allowed origin', () => {
    expect(corsHeadersFor('https://app.example.ch', allowed)?.['Access-Control-Allow-Origin'])
      .toBe('https://app.example.ch');
  });

  it('rejects unknown or missing origins', () => {
    expect(corsHeadersFor('https://evil.example', allowed)).toBeNull();
    expect(corsHeadersFor(null, allowed)).toBeNull();
  });
});

describe('clientIp', () => {
  it('takes the first forwarded address', () => {
    expect(clientIp('203.0.113.7, 10.0.0.1')).toBe('203.0.113.7');
    expect(clientIp(null)).toBe('unknown');
  });
});
