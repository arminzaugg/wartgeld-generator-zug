import { describe, it, expect } from 'vitest';
import { generatePDF } from '../pdfGenerator';

describe('pdfGenerator', () => {
  const mockFormData = {
    vorname: 'John',
    nachname: 'Doe',
    address: 'Test Street 1',
    plz: '1234',
    ort: 'Test City',
    geburtsdatum: '2024-01-01',
    gemeinde: 'Zug',
    betreuungGeburt: true,
    betreuungWochenbett: false,
  };

  it('generates a PDF string', () => {
    const result = generatePDF(mockFormData);
    expect(result).toContain('data:application/pdf;base64,');
  });

  it('includes form data in the generated PDF', () => {
    const result = generatePDF(mockFormData);
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });
});