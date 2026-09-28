import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import Index from '../Index';
import { renderWithProviders } from '@/lib/__tests__/test-utils';

// Mock PDF generator
vi.mock('@/lib/pdfGenerator', () => ({
  generatePDF: vi.fn(() => 'mock-pdf-url')
}));

describe('Index', () => {
  beforeEach(() => localStorage.clear());

  it('renders the main heading', () => {
    renderWithProviders(<Index />);
    expect(screen.getByRole('heading', { name: 'Wartgeld Generator' })).toBeInTheDocument();
  });

  it('shows preview placeholder when no PDF is generated', () => {
    renderWithProviders(<Index />);
    expect(screen.getByText('Bitte füllen Sie das Formular aus')).toBeInTheDocument();
  });

  it('shows a notice when a fixed invoice date is configured', () => {
    localStorage.setItem('form-settings', JSON.stringify({ rechnungsDatum: '2025-03-01' }));
    renderWithProviders(<Index />);
    expect(screen.getByText(/Rechnungsdatum fest eingestellt auf 01\.03\.2025/)).toBeInTheDocument();
  });

  it('shows no notice when the invoice date is today', () => {
    renderWithProviders(<Index />);
    expect(screen.queryByText(/Rechnungsdatum fest eingestellt/)).not.toBeInTheDocument();
  });
});