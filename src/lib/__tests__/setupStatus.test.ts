import { describe, it, expect } from 'vitest';
import { missingSetupItems, joinItems, remainingLabel } from '../setupStatus';

// @covers FR-01.06
describe('missingSetupItems', () => {
  it('lists all three items when nothing is saved', () => {
    expect(missingSetupItems({})).toEqual(['Rechnungsstellerin', 'Ort der Ausstellung', 'Unterschrift']);
  });

  it('lists nothing once sender, place and signature are saved', () => {
    expect(missingSetupItems({ senderInfo: 'Anna', ortRechnungssteller: 'Zug', signature: 'data:image/png;base64,AA' })).toEqual([]);
  });

  it('counts whitespace-only text and an empty signature as missing', () => {
    expect(missingSetupItems({ senderInfo: '  \n ', ortRechnungssteller: ' ', signature: '' }))
      .toEqual(['Rechnungsstellerin', 'Ort der Ausstellung', 'Unterschrift']);
  });

  it('ignores the fixed invoice date, which is optional', () => {
    expect(missingSetupItems({ senderInfo: 'Anna', ortRechnungssteller: 'Zug', signature: 'x', rechnungsDatum: '' })).toEqual([]);
  });
});

// @covers FR-01.06
describe('setup wording', () => {
  it('joins one, two or three items in German', () => {
    expect(joinItems(['Unterschrift'])).toBe('Unterschrift');
    expect(joinItems(['Ort der Ausstellung', 'Unterschrift'])).toBe('Ort der Ausstellung und Unterschrift');
    expect(joinItems(['Rechnungsstellerin', 'Ort der Ausstellung', 'Unterschrift']))
      .toBe('Rechnungsstellerin, Ort der Ausstellung und Unterschrift');
  });

  it('uses the singular for one remaining item', () => {
    expect(remainingLabel(1)).toBe('1 Angabe');
    expect(remainingLabel(2)).toBe('2 Angaben');
    expect(remainingLabel(3)).toBe('3 Angaben');
  });
});
