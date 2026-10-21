import { describe, it, expect } from 'vitest';
import { parseAddressInput } from '../addressParser';

// @covers FR-01.02
describe('parseAddressInput', () => {
  it('splits street, house number with addition, postcode and town', () => {
    expect(parseAddressInput('Seestrasse 3a, 6300 Zug')).toEqual({
      streetName: 'Seestrasse', houseNumber: '3', addition: 'a', zipCode: '6300', city: 'Zug',
    });
  });

  it('reads a postcode typed after a comma before the town is typed', () => {
    expect(parseAddressInput('Bahnhofstr 1, 6300')).toEqual({
      streetName: 'Bahnhofstr', houseNumber: '1', addition: '', zipCode: '6300', city: '',
    });
  });

  it('keeps a four-digit number without a comma as the house number', () => {
    expect(parseAddressInput('Industriestrasse 1234')).toMatchObject({ houseNumber: '1234', zipCode: '' });
  });
});
