import { describe, it, expect, vi, afterEach } from 'vitest';
import { addressService } from '../addressService';

const respond = (body: unknown, status = 200) =>
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(body), { status }));

afterEach(() => vi.restoreAllMocks());

// @covers FR-01.02
describe('addressService.lookupStreet', () => {
  it('asks the own-origin lookup service and maps its suggestions', async () => {
    const fetch = respond({ results: [
      { street: 'Bahnhofstrasse', houseNumber: '1', houseNumberAddition: 'a', postcode: '6300', town: 'Zug' },
      { street: 'Dorfstrasse', houseNumber: '', houseNumberAddition: '', postcode: '6313', town: 'Menzingen' },
    ] });

    await expect(addressService.lookupStreet('Bahnhofstr 1a', '6300')).resolves.toEqual([
      { streetName: 'Bahnhofstrasse', zipCode: '6300', city: 'Zug', houseNumbers: [{ number: '1', addition: 'a' }] },
      { streetName: 'Dorfstrasse', zipCode: '6313', city: 'Menzingen', houseNumbers: undefined },
    ]);
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe('/api/address');
    expect(init).toMatchObject({ method: 'POST', headers: { 'Content-Type': 'application/json' } });
    expect(JSON.parse(String(init?.body))).toEqual({ searchTerm: 'Bahnhofstr 1a', zipCode: '6300' });
  });

  it('fails when the lookup service answers with an error', async () => {
    respond({ error: 'Address lookup failed' }, 502);
    await expect(addressService.lookupStreet('Bahnhofstr')).rejects.toThrow('Address lookup failed (502)');
  });

  it('does not ask for fewer than two characters', async () => {
    const fetch = respond({ results: [] });
    await expect(addressService.lookupStreet(' B ')).resolves.toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });
});
