import { describe, it, expect, vi } from 'vitest';
import { generatePDF } from '../pdfGenerator';
import { createFormValues } from './factories/formFactory';

// Mock the administration data fetch
vi.mock('../administrationData', () => ({
  getAdministrationData: vi.fn().mockResolvedValue({
    title: 'Test Administration',
    name: 'Test Name',
    address: 'Test Address',
    city: 'Test City'
  })
}));

// Mock the settings
vi.mock('../presetStorage', () => ({
  getSettings: () => ({
    senderInfo: 'Test Sender\nTest Address',
    ortRechnungssteller: 'Test Ort',
    signature: null
  })
}));

describe('pdfGenerator', () => {
  const mockFormData = createFormValues({
    vorname: 'John',
    nachname: 'Doe',
    address: 'Test Street 1',
    plz: '1234',
    ort: 'Test City',
    geburtsdatum: '2024-01-01',
    gemeinde: 'Zug',
    betreuungGeburt: true,
    betreuungWochenbett: false,
  });

  it('generates PDF with form data', async () => {
    const result = await generatePDF(mockFormData);
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
    expect(result.startsWith('data:application/pdf;base64,')).toBe(true);
  });
});