import { describe, it, expect, vi } from 'vitest';
import { generatePDF } from '../pdfGenerator';
import type { MunicipalityRecipient } from '@/data/types';
import { createFormValues } from './factories/formFactory';

const settings = vi.hoisted(() => ({
  senderInfo: 'Test Sender\nTest Address',
  ortRechnungssteller: 'Test Ort',
  signature: undefined as string | undefined,
  rechnungsDatum: '2025-03-01'
}));

vi.mock('../presetStorage', () => ({
  getSettings: () => settings
}));

// 1x1 PNG, the same data-URL shape the signature pad stores.
const SIGNATURE_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

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

  it('embeds no image when no signature is stored @FR-01.07', async () => {
    const pdf = decode(await generatePDF(createFormValues(), administration));
    expect(pdf, 'no image XObject without a stored signature').not.toContain('/Subtype /Image');
  });

  it('embeds the stored signature as an image @FR-01.07', async () => {
    settings.signature = SIGNATURE_PNG;
    try {
      const pdf = decode(await generatePDF(createFormValues(), administration));
      expect(pdf, 'signature image XObject in the PDF').toContain('/Subtype /Image');
    } finally {
      settings.signature = undefined;
    }
  });
});
