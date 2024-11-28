import { render, screen } from '@testing-library/react';
import { FormContainer } from '@/features/form/components/FormContainer';

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

  it('renders without crashing', () => {
    render(
      <FormContainer
        values={mockValues}
        onChange={() => {}}
        onAddressChange={() => {}}
        onClear={() => {}}
      />
    );
  });
});