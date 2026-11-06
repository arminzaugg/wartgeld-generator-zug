import { beforeEach, describe, expect, it } from 'vitest';
import { jsPDF } from 'jspdf';
import { MUNICIPALITIES } from '@/data/municipalities';
import { generatePDF } from '../pdfGenerator';
import { SETTINGS_KEY } from '../presetStorage';
import { createFormValues } from './factories/formFactory';

const PT_PER_MM = 72 / 25.4;
const decode = (uri: string) => atob(uri.split(',')[1]);
const metrics = new jsPDF();

// Read actual rendered text and font sizes, not layout constants from production.
const textBounds = (pdf: string) => {
  const blocks = [...pdf.matchAll(
    /BT\s*\/F(\d+) ([\d.]+) Tf[\s\S]*?([\d.]+) ([\d.]+) Td\s*\((.*?)\) Tj\s*ET/g,
  )];
  expect(blocks.length, 'every text operator must have parsed bounds; fail closed on new PDF syntax')
    .toBe([...pdf.matchAll(/\) Tj\b/g)].length);
  return blocks.map(([, font, size, x, y, raw]) => {
    const text = raw.replace(/\\([\\()])/g, '$1');
    metrics.setFont('helvetica', font === '2' ? 'bold' : 'normal');
    metrics.setFontSize(Number(size));
    const left = Number(x) / PT_PER_MM;
    const baseline = 297 - Number(y) / PT_PER_MM;
    // Conservative bounds: a full em above and 1/4 em below the baseline.
    const em = Number(size) / PT_PER_MM;
    return { text, left, right: left + metrics.getTextWidth(text), top: baseline - em, bottom: baseline + em / 4 };
  });
};

// @covers FR-01.03
// @covers FR-01.06
describe('A4 invoice inside the measured C5 right-window envelope', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({
      senderInfo: 'Hebamme Muster\nMusterstrasse 1\n6300 Zug',
      ortRechnungssteller: 'Zug', rechnungsDatum: '2026-11-06',
    }));
  });

  it.each(MUNICIPALITIES)('keeps every $name address line 5 mm inside the window at every extreme sheet position', async ({ recipient }) => {
    const pdf = decode(await generatePDF(createFormValues(), recipient));
    const bounds = textBounds(pdf);
    const expected = [recipient.title, recipient.department, recipient.address, recipient.city].filter(Boolean);
    const address = bounds.filter(b => b.left > 110 && b.top < 90);
    expect(address.map(b => b.text), 'all recipient lines printed intact').toEqual(expected);
    expect(pdf.match(/\/Type \/Page\b/g), 'one page').toHaveLength(1);
    const media = pdf.match(/\/MediaBox \[0 0 ([\d.]+) ([\d.]+)\]/)!;
    expect(Number(media[1]) / PT_PER_MM, 'A4 width, no scaling').toBeCloseTo(210, 1);
    expect(Number(media[2]) / PT_PER_MM, 'A4 height, no scaling').toBeCloseTo(297, 1);
    for (const dx of [0, 229 - 210]) {
      for (const dy of [0, 162 - 297 / 2]) {
        for (const b of address) {
          expect(b.left + dx, `${b.text}: left clearance`).toBeGreaterThanOrEqual(120 + 5 - 0.01);
          expect(b.right + dx, `${b.text}: right clearance`).toBeLessThanOrEqual(220 - 5 + 0.01);
          expect(b.top + dy, `${b.text}: top clearance`).toBeGreaterThanOrEqual(52 + 5 - 0.01);
          expect(b.bottom + dy, `${b.text}: bottom clearance`).toBeLessThanOrEqual(97 - 5 + 0.01);
        }
      }
    }
  });

  it('keeps an extensively wrapped sender above the invoice title without losing text', async () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ senderInfo: Array(9).fill('M'.repeat(25)).join('\n') }));
    const bounds = textBounds(decode(await generatePDF(createFormValues(), MUNICIPALITIES[10].recipient)));
    const sender = bounds.filter(b => /^M+$/.test(b.text));
    const title = bounds.find(b => b.text === 'Rechnung: Hebammenwartgeld')!;
    expect(sender.map(b => b.text).join(''), 'all sender characters kept').toBe('M'.repeat(225));
    for (const b of sender) {
      expect(b.bottom, 'sender does not overlap title').toBeLessThan(title.top - 5);
      expect(b.right, 'sender remains left of every window position').toBeLessThan(101);
    }
  });

  it('keeps long sender lines, date and all other text outside every possible window position', async () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({
      senderInfo: ['Hebamme Muster', 'Praxis für Geburt und Wochenbett mit einer sehr langen Kontaktadresse',
        'Musterstrasse 1', '6300 Zug', 'Telefon 041 123 45 67',
        'kontakt@hebammenpraxis-muster-mit-einem-langen-namen.ch', 'CH93 0076 2011 6238 5295 7'].join('\n'),
      ortRechnungssteller: 'Zug', rechnungsDatum: '2026-11-06',
    }));
    const pdf = decode(await generatePDF(createFormValues(), MUNICIPALITIES[10].recipient));
    const bounds = textBounds(pdf);
    expect(bounds.length, 'parser sees sender, recipient and body').toBeGreaterThan(30);
    const others = bounds.filter(b => !(b.left > 110 && b.top < 90));
    for (const b of others) {
      // Union of window positions on paper as sheet moves inside the envelope.
      const overlaps = b.right > 120 - 19 && b.left < 220 && b.bottom > 52 - 13.5 && b.top < 97;
      expect(overlaps, `non-recipient text outside window: ${b.text}`).toBe(false);
    }
    const sender = bounds.filter(b => b.left < 30 && b.top < 97);
    expect(sender.flatMap(b => [...b.text.replace(/\s/g, '')]).join(''), 'sender preserved when wrapping')
      .toBe(('Hebamme MusterPraxis für Geburt und Wochenbett mit einer sehr langen KontaktadresseMusterstrasse 16300 ZugTelefon 041 123 45 67kontakt@hebammenpraxis-muster-mit-einem-langen-namen.chCH93 0076 2011 6238 5295 7').replace(/\s/g, ''));
  });
});
