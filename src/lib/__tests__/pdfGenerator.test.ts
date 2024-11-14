import { generatePDF } from '../pdfGenerator';
import { describe, it, expect } from 'vitest';

describe('PDF Generator', () => {
  const mockFormData = {
    vorname: 'John',
    nachname: 'Doe',
    address: 'Test Street 1',
    plz: '6300',
    ort: 'Zug',
    geburtsdatum: '2024-01-01',
    gemeinde: 'Zug',
    betreuungGeburt: true,
    betreuungWochenbett: false,
  };

  it('generates PDF with correct data', () => {
    const result = generatePDF(mockFormData);
    
    expect(result).toContain('data:application/pdf;base64,');
    expect(typeof result).toBe('string');
  });
});