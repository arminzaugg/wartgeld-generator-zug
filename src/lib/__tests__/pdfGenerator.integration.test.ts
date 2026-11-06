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

const PT_PER_MM = 72 / 25.4;
const A4_HEIGHT_MM = 297;
const RECIPIENT_X_MM = 125;

/**
 * Baseline of each text line in the recipient column, in mm from the top edge
 * of the page. Filtering on the column keeps sender lines with the same text out.
 */
const recipientBaselines = (pdf: string): Map<string, number> => {
  const lines = new Map<string, number>();
  for (const [, x, y, text] of pdf.matchAll(/([\d.]+) ([\d.]+) Td\s*\((.*?)\) Tj/g)) {
    if (Math.abs(Number(x) / PT_PER_MM - RECIPIENT_X_MM) > 0.1) continue;
    lines.set(text, A4_HEIGHT_MM - Number(y) / PT_PER_MM);
  }
  return lines;
};

// Text bounds (not just baselines) at all extremes are checked in pdfEnvelope.
// Measured C5 window y=52–97, allowing 13.5 mm play and 5 mm clearance.
const WINDOW_BAND_MM = { top: 57, bottom: 78.5 };

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

  it('keeps all four recipient lines inside the envelope window band', async () => {
    const lines = recipientBaselines(decode(await generatePDF(createFormValues(), administration)));
    const recipient = ['Test Administration', 'Test Name', 'Test Address', '6300 Zug'];
    for (const text of recipient) {
      const baseline = lines.get(text);
      expect(baseline, `"${text}" is printed`).toBeDefined();
      expect(baseline!, `"${text}" baseline below window top`).toBeGreaterThanOrEqual(WINDOW_BAND_MM.top);
      expect(baseline!, `"${text}" baseline above window bottom`).toBeLessThanOrEqual(WINDOW_BAND_MM.bottom);
    }
  });

  it('closes the gap when the recipient has no department line', async () => {
    const lines = recipientBaselines(
      decode(await generatePDF(createFormValues(), { ...administration, department: '' }))
    );
    const title = lines.get('Test Administration')!;
    expect(lines.get('Test Address')! - title, 'address directly below title').toBeCloseTo(5, 1);
    expect(lines.get('6300 Zug')! - title, 'postcode line directly below address').toBeCloseTo(10, 1);
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
