import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toaster } from '@/components/ui/toaster';
import { PdfActionButtons } from '../PdfActionButtons';
import { createMockPdfUrl } from '@/lib/__tests__/test-utils';

// @covers FR-01.04
describe('PdfActionButtons', () => {
  afterEach(() => vi.restoreAllMocks());

  it('offers no download while the mother\'s name is incomplete', () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    render(<PdfActionButtons pdfData={createMockPdfUrl()} fileName={null} />);

    const save = screen.getByRole('button', { name: 'Speichern' });
    fireEvent.click(save);

    expect(save).toBeDisabled();
    expect(click).not.toHaveBeenCalled();
  });

  it('tells the user to save instead when an iPhone can neither share nor open the invoice', async () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Mobile/15E148 Safari/604.1');
    Object.defineProperty(navigator, 'canShare', { value: () => true, configurable: true });
    Object.defineProperty(navigator, 'share', { value: () => Promise.reject(new DOMException('denied', 'NotAllowedError')), configurable: true });
    Object.assign(URL, { createObjectURL: vi.fn(() => 'blob:pdf'), revokeObjectURL: vi.fn() });
    vi.spyOn(window, 'open').mockReturnValue(null);
    render(<><PdfActionButtons pdfData={createMockPdfUrl()} fileName="Anna_Muster.pdf" /><Toaster /></>);

    fireEvent.click(screen.getByRole('button', { name: 'Drucken' }));

    expect(await screen.findByText('Drucken nicht möglich')).toBeInTheDocument();
    expect(screen.getByText(/«Speichern»/)).toBeInTheDocument();
    for (const key of ['canShare', 'share']) delete (navigator as unknown as Record<string, unknown>)[key];
  });
});
