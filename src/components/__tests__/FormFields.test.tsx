import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormContainer } from '@/features/form/components/FormContainer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

describe('FormContainer', () => {
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

  const queryClient = new QueryClient();

  it('renders without crashing', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <FormContainer
          values={mockValues}
          onChange={() => {}}
          onAddressChange={() => {}}
          onClear={() => {}}
        />
      </QueryClientProvider>
    );
  });
});