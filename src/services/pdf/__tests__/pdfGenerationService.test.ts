import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { pdfGenerationService } from '../pdfGenerationService';
import { UnknownMunicipalityError } from '@/lib/municipality';
import { createFormValues } from '@/lib/__tests__/factories/formFactory';
import supabaseExport from '../../../../scripts/municipality-data/supabase-export-2026-10-21.json';

vi.mock('@/lib/presetStorage', () => ({
  getSettings: () => ({ senderInfo: 'Hebamme Test', ortRechnungssteller: 'Zug', signature: undefined, rechnungsDatum: '2026-10-21' }),
}));

const BFS: Record<string, string> = {
  Baar: '1701', Cham: '1702', Hünenberg: '1703', Menzingen: '1704', Neuheim: '1705', Oberägeri: '1706',
  Risch: '1707', Steinhausen: '1708', Unterägeri: '1709', Walchwil: '1710', Zug: '1711',
};
const decode = (dataUri: string) => atob(dataUri.split(',')[1]);

// @covers FR-01.03
describe('pdfGenerationService', () => {
  const fetchSpy = vi.fn();
  beforeEach(() => { vi.clearAllMocks(); vi.stubGlobal('fetch', fetchSpy); });
  afterEach(() => vi.unstubAllGlobals());

  it.each(supabaseExport.rows)('addresses the invoice for $municipality exactly as before', async (row) => {
    const pdf = decode(await pdfGenerationService.generatePDF(createFormValues({ gemeindeBfs: BFS[row.municipality] })));
    for (const line of [row.title, row.name, row.address, row.city].filter(Boolean)) {
      expect(pdf).toContain(`(${line})`);
    }
  });

  it('addresses a Neuägeri invoice to Menzingen when the midwife chose Menzingen', async () => {
    const pdf = decode(await pdfGenerationService.generatePDF(createFormValues({
      address: 'Hauptstrasse 1, 6314 Neuägeri', plz: '6314', ort: 'Neuägeri', gemeindeBfs: '1704',
    })));
    expect(pdf).toContain('(6313 Menzingen)');
    expect(pdf).not.toContain('Unterägeri)');
  });

  it('generates the invoice without contacting any server', async () => {
    await pdfGenerationService.generatePDF(createFormValues());
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('refuses to generate an invoice without a known municipality', async () => {
    await expect(pdfGenerationService.generatePDF(createFormValues({ gemeindeBfs: '' })))
      .rejects.toBeInstanceOf(UnknownMunicipalityError);
  });
});
