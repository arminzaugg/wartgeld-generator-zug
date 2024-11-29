import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Index from '../Index';
import * as pdfGenerator from '@/lib/pdfGenerator';

vi.mock('@/lib/pdfGenerator', () => ({
  generatePDF: vi.fn(),
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
    expect(screen.getByText('Hebammenwartgeld Kanton Zug')).toBeDefined();
  });

  it('renders form fields', () => {
    renderComponent();
    expect(screen.getByLabelText('Vorname')).toBeDefined();
    expect(screen.getByLabelText('Nachname')).toBeDefined();
    expect(screen.getByText('Angaben')).toBeDefined();
  });

  it('shows preview placeholder when no PDF is generated', () => {
    renderComponent();
    expect(screen.getByText('Bitte füllen Sie das Formular aus')).toBeDefined();
  });

  it('handles form submission', async () => {
    renderComponent();
    
    // Fill in required fields
    fireEvent.change(screen.getByLabelText('Vorname'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('Nachname'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText('Datum der Geburt'), { target: { value: '2024-01-01' } });
    
    // Submit form
    const submitButton = screen.getByText('Rechnung Generieren');
    fireEvent.click(submitButton);

    await waitFor(() => {
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
    
    // Check if field was cleared
    expect(vornameInput).toHaveValue('');
  });
});