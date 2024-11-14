import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormFields } from '../FormFields';

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

  it('renders checkboxes for services', () => {
    render(<FormFields values={mockValues} onChange={mockOnChange} />);
    
    expect(screen.getByLabelText(/Betreuung der Gebärenden/)).toBeDefined();
    expect(screen.getByLabelText(/Pflege der Wöchnerin/)).toBeDefined();
  });
});