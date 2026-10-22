import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
});
