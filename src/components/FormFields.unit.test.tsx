import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FormFields } from './FormFields';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

describe('FormFields', () => {
  const mockValues = {
    vorname: '',
    nachname: '',
    address: '',
    plz: '',
    ort: '',
    geburtsdatum: '',
    gemeinde: '',
    betreuungGeburt: false,
    betreuungWochenbett: false,
  };
  
  const mockOnChange = vi.fn();
  const queryClient = new QueryClient();

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <FormFields values={mockValues} onChange={mockOnChange} />
      </QueryClientProvider>
    );
  };

  it('renders basic form fields', () => {
    renderComponent();
    expect(screen.getByText('Angaben')).toBeInTheDocument();
    expect(screen.getByLabelText('Vorname')).toBeInTheDocument();
    expect(screen.getByLabelText('Nachname')).toBeInTheDocument();
  });
});