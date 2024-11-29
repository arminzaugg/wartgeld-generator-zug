import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FormFields } from '../FormFields';
import { municipalities } from '@/config/addresses';

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

    expect(screen.getByLabelText('Vorname')).toBeInTheDocument();
    expect(screen.getByLabelText('Nachname')).toBeInTheDocument();
    expect(screen.getByLabelText('Strasse')).toBeInTheDocument();
    expect(screen.getByLabelText('Postleitzahl')).toBeInTheDocument();
    expect(screen.getByLabelText('Ort')).toBeInTheDocument();
    expect(screen.getByLabelText('Datum der Geburt')).toBeInTheDocument();
    expect(screen.getByLabelText('Wahl der Gemeinde')).toBeInTheDocument();
  });

  it('handles text input changes', () => {
    render(<FormFields values={mockValues} onChange={mockOnChange} />);

    const vornameInput = screen.getByLabelText('Vorname');
    fireEvent.change(vornameInput, { target: { value: 'John' } });

    expect(mockOnChange).toHaveBeenCalledWith('vorname', 'John');
  });

  it('handles checkbox changes', () => {
    render(<FormFields values={mockValues} onChange={mockOnChange} />);

    const geburtsBetreuungCheckbox = screen.getByLabelText(/Betreuung der Gebärenden/);
    fireEvent.click(geburtsBetreuungCheckbox);

    expect(mockOnChange).toHaveBeenCalledWith('betreuungGeburt', true);
  });

  it('displays all municipalities in dropdown', () => {
    render(<FormFields values={mockValues} onChange={mockOnChange} />);

    const gemeindeSelect = screen.getByLabelText('Wahl der Gemeinde');
    fireEvent.click(gemeindeSelect);

    municipalities.forEach(municipality => {
      expect(screen.getByText(municipality)).toBeInTheDocument();
    });
  });
});