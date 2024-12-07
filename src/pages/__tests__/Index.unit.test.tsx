import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Index from '../Index';
import { renderWithProviders, createMockFormData, mockSupabaseResponses } from '@/lib/__tests__/test-utils';
import { setupSupabaseMock } from '@/lib/__tests__/mocks/supabaseMock';

// Setup mocks
setupSupabaseMock();

vi.mock('@/lib/pdfGenerator', () => ({
  generatePDF: vi.fn().mockResolvedValue('mock-pdf-url')
}));

describe('Index Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the main form components', () => {
    renderWithProviders(<Index />);
    
    expect(screen.getByText('Hebammenwartgeld Kanton Zug')).toBeInTheDocument();
    expect(screen.getByLabelText('Vorname')).toBeInTheDocument();
    expect(screen.getByLabelText('Nachname')).toBeInTheDocument();
    expect(screen.getByLabelText(/Datum der Geburt/)).toBeInTheDocument();
  });

  it('handles form submission successfully', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Index />);

    // Fill in required fields
    await user.type(screen.getByLabelText('Vorname'), 'Max');
    await user.type(screen.getByLabelText('Nachname'), 'Mustermann');
    await user.type(screen.getByLabelText(/PLZ/), '6300');

    // Submit form
    const submitButton = screen.getByText('Rechnung Generieren');
    await user.click(submitButton);

    // Check for success message
    await waitFor(() => {
      expect(screen.getByText('Erfolgreich')).toBeInTheDocument();
    });
  });

  it('shows error message when required fields are missing', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Index />);

    // Submit form without filling required fields
    const submitButton = screen.getByText('Rechnung Generieren');
    await user.click(submitButton);

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText('Fehler')).toBeInTheDocument();
      expect(screen.getByText(/Bitte füllen Sie alle erforderlichen Felder aus/)).toBeInTheDocument();
    });
  });

  it('clears form data when reset button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Index />);

    // Fill in some data
    await user.type(screen.getByLabelText('Vorname'), 'Max');
    await user.type(screen.getByLabelText('Nachname'), 'Mustermann');

    // Click reset button
    const resetButton = screen.getByText('Formular zurücksetzen');
    await user.click(resetButton);

    // Verify fields are cleared
    expect(screen.getByLabelText('Vorname')).toHaveValue('');
    expect(screen.getByLabelText('Nachname')).toHaveValue('');

    // Check for reset confirmation message
    await waitFor(() => {
      expect(screen.getByText('Formular zurückgesetzt')).toBeInTheDocument();
    });
  });
});