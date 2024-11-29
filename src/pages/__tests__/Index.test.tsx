import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Index from '../Index';
import * as pdfGenerator from '@/lib/pdfGenerator';
import { addressService } from '@/services/api/addressService';

vi.mock('@/lib/pdfGenerator', () => ({
  generatePDF: vi.fn(() => 'mock-pdf-url')
}));

vi.mock('@/services/api/addressService', () => ({
  addressService: {
    getPlzMapping: vi.fn().mockResolvedValue({ gemeinde: 'Test Gemeinde' })
  }
}));

describe('Index', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    render(
      <BrowserRouter>
        <Index />
      </BrowserRouter>
    );
  };

  it('renders the main heading', () => {
    renderComponent();
    expect(screen.getByText('Hebammenwartgeld Kanton Zug')).toBeInTheDocument();
  });

  it('renders form fields', () => {
    renderComponent();
    expect(screen.getByLabelText('Vorname')).toBeInTheDocument();
    expect(screen.getByLabelText('Nachname')).toBeInTheDocument();
    expect(screen.getByText('Angaben')).toBeInTheDocument();
  });

  it('shows preview placeholder when no PDF is generated', () => {
    renderComponent();
    expect(screen.getByText('Bitte füllen Sie das Formular aus')).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    renderComponent();
    
    // Fill in required fields
    fireEvent.change(screen.getByLabelText('Vorname'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('Nachname'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText('Postleitzahl'), { target: { value: '6300' } });
    
    // Submit form
    const submitButton = screen.getByText('Rechnung Generieren');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(addressService.getPlzMapping).toHaveBeenCalledWith('6300');
      expect(pdfGenerator.generatePDF).toHaveBeenCalled();
    });
  });

  it('handles form reset', () => {
    renderComponent();
    
    // Fill in a field
    const vornameInput = screen.getByLabelText('Vorname');
    fireEvent.change(vornameInput, { target: { value: 'John' } });
    
    // Reset form
    const resetButton = screen.getByText('Formular Zurücksetzen');
    fireEvent.click(resetButton);
    
    expect(vornameInput).toHaveValue('');
  });
});