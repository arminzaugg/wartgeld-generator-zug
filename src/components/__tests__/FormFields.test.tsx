import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

  it('renders all form fields', () => {
    render(<FormFields values={mockValues} onChange={mockOnChange} />);
    
    expect(screen.getByLabelText('Vorname')).toBeDefined();
    expect(screen.getByLabelText('Nachname')).toBeDefined();
    expect(screen.getByLabelText('Strasse')).toBeDefined();
    expect(screen.getByLabelText('Postleitzahl')).toBeDefined();
    expect(screen.getByLabelText('Ort')).toBeDefined();
    expect(screen.getByLabelText('Datum der Geburt')).toBeDefined();
    expect(screen.getByLabelText('Wahl der Gemeinde')).toBeDefined();
  });

  it('calls onChange when input values change', () => {
    render(<FormFields values={mockValues} onChange={mockOnChange} />);
    
    const vornameInput = screen.getByLabelText('Vorname');
    fireEvent.change(vornameInput, { target: { value: 'John' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('vorname', 'John');
  });

  it('renders checkboxes for services', () => {
    render(<FormFields values={mockValues} onChange={mockOnChange} />);
    
    expect(screen.getByLabelText(/Betreuung der Gebärenden/)).toBeDefined();
    expect(screen.getByLabelText(/Pflege der Wöchnerin/)).toBeDefined();
  });
});