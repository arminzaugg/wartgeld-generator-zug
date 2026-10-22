import { describe, it, expect, vi, afterEach } from 'vitest';
import { downloadPdf, pdfFileName } from '../pdfActions';
import { createMockPdfUrl } from './test-utils';

// @covers FR-01.04
describe('pdfActions', () => {
  afterEach(() => vi.restoreAllMocks());

  it('names the saved file after the mother', () => {
    expect(pdfFileName({ vorname: 'Anna', nachname: 'Muster' })).toBe('Anna_Muster.pdf');
  });

  it('gives no file name while a name is missing', () => {
    expect(pdfFileName({ vorname: 'Anna', nachname: '' })).toBeNull();
    expect(pdfFileName({ vorname: '', nachname: 'Muster' })).toBeNull();
  });

  it('downloads the PDF under the given file name', () => {
    // jsdom has no object URLs.
    Object.assign(URL, { createObjectURL: vi.fn(() => 'blob:pdf'), revokeObjectURL: vi.fn() });
    const clicked: string[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      clicked.push(this.download);
    });

    downloadPdf(createMockPdfUrl(), 'Anna_Muster.pdf');

    expect(clicked).toEqual(['Anna_Muster.pdf']);
  });
});
