import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import Index from '../Index';
import { renderWithProviders } from '@/lib/__tests__/test-utils';

// Mock PDF generator
vi.mock('@/lib/pdfGenerator', () => ({
  generatePDF: vi.fn(() => 'mock-pdf-url')
}));

// Mock address service
vi.mock('@/services/api/addressService', () => ({
  addressService: {
    getPlzMapping: vi.fn().mockResolvedValue({ gemeinde: 'Test Gemeinde' })
  }
}));

describe('Index Page', () => {
  it('renders the main heading', () => {
    renderWithProviders(<Index />);
    expect(screen.getByText('Hebammenwartgeld Kanton Zug')).toBeInTheDocument();
  });

  it('shows preview placeholder when no PDF is generated', () => {
    renderWithProviders(<Index />);
    expect(screen.getByText('Bitte füllen Sie das Formular aus')).toBeInTheDocument();
  });
});