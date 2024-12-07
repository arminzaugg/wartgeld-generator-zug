import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Index from '../Index';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/lib/pdfGenerator', () => ({
  generatePDF: vi.fn(() => 'mock-pdf-url')
}));

vi.mock('@/services/api/addressService', () => ({
  addressService: {
    getPlzMapping: vi.fn().mockResolvedValue({ gemeinde: 'Test Gemeinde' })
  }
}));

describe('Index', () => {
  const queryClient = new QueryClient();

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Index />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('renders the main heading', () => {
    renderComponent();
    expect(screen.getByText('Hebammenwartgeld Kanton Zug')).toBeInTheDocument();
  });

  it('shows preview placeholder when no PDF is generated', () => {
    renderComponent();
    expect(screen.getByText('Bitte füllen Sie das Formular aus')).toBeInTheDocument();
  });
});