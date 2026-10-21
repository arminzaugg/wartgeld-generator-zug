import { describe, it, expect } from 'vitest';
import { applyAddressChange } from '../addressChange';
import { createFormValues } from '@/lib/__tests__/factories/formFactory';

const empty = createFormValues({ address: '', plz: '', ort: '', gemeindeBfs: '' });

// @covers FR-01.01
describe('applyAddressChange', () => {
  it('proposes the municipality when an address is picked', () => {
    const next = applyAddressChange(empty, 'Dorfstrasse 1, 6319 Allenwinden', '6319', 'Allenwinden');
    expect(next).toMatchObject({ plz: '6319', ort: 'Allenwinden', gemeindeBfs: '1701' });
  });

  it('leaves the municipality empty for a split locality', () => {
    const next = applyAddressChange(empty, 'Hauptstrasse 1, 6314 Neuägeri', '6314', 'Neuägeri');
    expect(next.gemeindeBfs).toBe('');
  });

  it('keeps a hand-picked municipality while postcode and town stay the same', () => {
    const picked = { ...applyAddressChange(empty, 'Hauptstrasse, 6314 Neuägeri', '6314', 'Neuägeri'), gemeindeBfs: '1704' };
    const next = applyAddressChange(picked, 'Hauptstrasse 12, 6314 Neuägeri', '6314', 'Neuägeri');
    expect(next).toMatchObject({ address: 'Hauptstrasse 12, 6314 Neuägeri', gemeindeBfs: '1704' });
  });

  it('keeps a hand-picked municipality when the postcode differs only by spaces', () => {
    const picked = { ...applyAddressChange(empty, 'Hauptstrasse, 6314 Neuägeri', '6314', 'Neuägeri'), gemeindeBfs: '1704' };
    const next = applyAddressChange(picked, 'Hauptstrasse 12, 6314 Neuägeri', ' 6314 ', 'Neuägeri');
    expect(next).toMatchObject({ plz: '6314', gemeindeBfs: '1704' });
  });

  it('replaces a hand-picked municipality when a different locality is picked', () => {
    const picked = { ...applyAddressChange(empty, 'Hauptstrasse, 6314 Neuägeri', '6314', 'Neuägeri'), gemeindeBfs: '1704' };
    const next = applyAddressChange(picked, 'Baarerstrasse 1, 6300 Zug', '6300', 'Zug');
    expect(next).toMatchObject({ plz: '6300', ort: 'Zug', gemeindeBfs: '1711' });
  });

  it('clears postcode, town and municipality when the address is typed instead of picked', () => {
    const picked = applyAddressChange(empty, 'Baarerstrasse 1, 6300 Zug', '6300', 'Zug');
    expect(applyAddressChange(picked, 'Irgendwo 5', undefined, undefined))
      .toMatchObject({ address: 'Irgendwo 5', plz: '', ort: '', gemeindeBfs: '' });
  });
});
