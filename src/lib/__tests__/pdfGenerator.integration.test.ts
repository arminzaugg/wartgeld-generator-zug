import { describe, it, expect, vi } from 'vitest';
import { generatePDF } from '../pdfGenerator';
import type { MunicipalityRecipient } from '@/data/types';
import { createFormValues } from './factories/formFactory';

vi.mock('../presetStorage', () => ({
  getSettings: () => ({
    senderInfo: 'Test Sender\nTest Address',
    ortRechnungssteller: 'Test Ort',
    signature: undefined,
    rechnungsDatum: '2025-03-01'
  })
}));

const administration: MunicipalityRecipient = {
  title: 'Test Administration',
  department: 'Test Name',
  address: 'Test Address',
  city: '6300 Zug',
};

const decode = (dataUri: string) => atob(dataUri.split(',')[1]);

// @covers FR-01.03
describe('pdfGenerator', () => {
  it('renders the given administration and form data', async () => {
    const result = await generatePDF(
      createFormValues({ vorname: 'Anna', nachname: 'Muster', betreuungGeburt: true }),
      administration
    );

    expect(result).toMatch(/^data:application\/pdf/);
    const pdf = decode(result);
    expect(pdf).toContain('Test Administration');
    expect(pdf).toContain('Anna Muster');
    expect(pdf).toContain('Test Ort, 01.03.2025');
    expect(pdf).toContain('01.01.2024'); // birth date from the factory
  });
});
