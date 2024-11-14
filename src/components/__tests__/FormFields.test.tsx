import { render, screen, fireEvent } from '@testing-library/react';
import { FormFields } from '../FormFields';
import { describe, it, expect, vi } from 'vitest';

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

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders all form fields', () => {
    render(<FormFields values={mockValues} onChange={mockOnChange} />);
    
    expect(screen.getByLabelText(/Vorname/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nachname/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Strasse/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Postleitzahl/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ort/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Datum der Geburt/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Wahl der Gemeinde/i)).toBeInTheDocument();
  });

  it('handles text input changes', () => {
    render(<FormFields values={mockValues} onChange={mockOnChange} />);
    
    const vornameInput = screen.getByLabelText(/Vorname/i);
    fireEvent.change(vornameInput, { target: { value: 'John' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('vorname', 'John');
  });

  it('handles checkbox changes', () => {
    render(<FormFields values={mockValues} onChange={mockOnChange} />);
    
    const geburtsCheckbox = screen.getByLabelText(/Betreuung der Gebärenden/i);
    fireEvent.click(geburtsCheckbox);
    
    expect(mockOnChange).toHaveBeenCalledWith('betreuungGeburt', true);
  });
});