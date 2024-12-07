import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FormFields } from './FormFields';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createFormValues } from '@/lib/__tests__/factories/formFactory';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        order: () => ({
          data: [
            { gemeinde: 'Zug' },
            { gemeinde: 'Cham' },
            { gemeinde: 'Baar' }
          ],
          error: null
        })
      })
    })
  }
}));

describe('FormFields', () => {
  const mockValues = createFormValues();
  const mockOnChange = vi.fn();
  const queryClient = new QueryClient();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  const renderWithQueryClient = (component: React.ReactNode) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  it('renders all form fields', () => {
    renderWithQueryClient(<FormFields values={mockValues} onChange={mockOnChange} />);

    expect(screen.getByLabelText('Vorname')).toBeInTheDocument();
    expect(screen.getByLabelText('Nachname')).toBeInTheDocument();
    expect(screen.getByLabelText('Adresse')).toBeInTheDocument();
  });

  it('handles text input changes', () => {
    renderWithQueryClient(<FormFields values={mockValues} onChange={mockOnChange} />);

    const testCases = [
      { label: 'Vorname', value: 'John', field: 'vorname' },
      { label: 'Nachname', value: 'Doe', field: 'nachname' },
      { label: 'Strasse', value: 'Test Street', field: 'address' },
    ];

    testCases.forEach(({ label, value, field }) => {
      const input = screen.getByLabelText(label);
      fireEvent.change(input, { target: { value } });
      expect(mockOnChange).toHaveBeenCalledWith(field, value);
    });
  });

  it('handles date input changes', () => {
    renderWithQueryClient(<FormFields values={mockValues} onChange={mockOnChange} />);
    
    const dateInput = screen.getByLabelText('Datum der Geburt');
    const testDate = '2024-01-01';
    
    fireEvent.change(dateInput, { target: { value: testDate } });
    expect(mockOnChange).toHaveBeenCalledWith('geburtsdatum', testDate);
  });

  it('handles checkbox changes', () => {
    renderWithQueryClient(<FormFields values={mockValues} onChange={mockOnChange} />);

    const checkboxes = [
      { label: /Betreuung der Gebärenden/, field: 'betreuungGeburt' },
      { label: /Pflege der Wöchnerin/, field: 'betreuungWochenbett' },
    ];

    checkboxes.forEach(({ label, field }) => {
      const checkbox = screen.getByLabelText(label);
      fireEvent.click(checkbox);
      expect(mockOnChange).toHaveBeenCalledWith(field, true);
    });
  });
});