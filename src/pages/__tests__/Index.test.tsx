import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Index from '../Index';
import * as pdfGenerator from '@/lib/pdfGenerator';
import { addressService } from '@/services/api/addressService';
import { createFormValues } from '@/lib/__tests__/factories/formFactory';

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
    
    const testFormData = createFormValues({
      vorname: 'John',
      nachname: 'Doe',
      plz: '6300'
    });
    
    // Fill in required fields
    fireEvent.change(screen.getByLabelText('Vorname'), { target: { value: testFormData.vorname } });
    fireEvent.change(screen.getByLabelText('Nachname'), { target: { value: testFormData.nachname } });
    fireEvent.change(screen.getByLabelText('Postleitzahl'), { target: { value: testFormData.plz } });
    
    // Submit form
    const submitButton = screen.getByText('Rechnung Generieren');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(addressService.getPlzMapping).toHaveBeenCalledWith(testFormData.plz);
      expect(pdfGenerator.generatePDF).toHaveBeenCalled();
    });
  });

  it('handles form reset', () => {
    renderComponent();
    
    const testFormData = createFormValues();
    
    // Fill in a field
    const vornameInput = screen.getByLabelText('Vorname');
    fireEvent.change(vornameInput, { target: { value: testFormData.vorname } });
    
    // Reset form
    const resetButton = screen.getByText('Formular Zurücksetzen');
    fireEvent.click(resetButton);
    
    expect(vornameInput).toHaveValue('');
  });
});