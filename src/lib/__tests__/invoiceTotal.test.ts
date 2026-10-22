import { describe, it, expect, vi } from 'vitest';
import { invoiceTotal, formatChf } from '../invoiceTotal';
import { pdfGenerationService } from '@/services/pdf/pdfGenerationService';
import { createFormValues } from './factories/formFactory';

vi.mock('@/lib/presetStorage', () => ({
  getSettings: () => ({ senderInfo: 'Hebamme Test', ortRechnungssteller: 'Zug', signature: undefined, rechnungsDatum: '2026-10-21' }),
}));

const combos = [
  { betreuungGeburt: false, betreuungWochenbett: false, total: 0 },
  { betreuungGeburt: true, betreuungWochenbett: false, total: 400 },
  { betreuungGeburt: false, betreuungWochenbett: true, total: 400 },
  { betreuungGeburt: true, betreuungWochenbett: true, total: 800 },
];

// @covers FR-01.01
describe('invoiceTotal', () => {
  it.each(combos)('charges CHF 400 per ticked service (geburt=$betreuungGeburt, wochenbett=$betreuungWochenbett)', ({ total, ...ticks }) => {
    expect(invoiceTotal(ticks)).toBe(total);
  });

  it.each([[0, 'CHF 0.00'], [400, 'CHF 400.00'], [800, 'CHF 800.00']])('formats %i as %s', (amount, text) => {
    expect(formatChf(amount)).toBe(text);
  });

  it.each(combos)('shows the same total as the PDF invoice (geburt=$betreuungGeburt, wochenbett=$betreuungWochenbett)', async ({ total, ...ticks }) => {
    const pdf = atob((await pdfGenerationService.generatePDF(createFormValues(ticks))).split(',')[1]);
    expect(pdf, 'PDF total line').toContain(`(Fr.  ${total}.-)`);
    expect(invoiceTotal(ticks)).toBe(total);
  });
});
