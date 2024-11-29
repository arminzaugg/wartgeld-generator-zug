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

    // Test presence of all input fields
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

    const testCases = [
      { label: 'Vorname', value: 'John', field: 'vorname' },
      { label: 'Nachname', value: 'Doe', field: 'nachname' },
      { label: 'Strasse', value: 'Test Street', field: 'address' },
      { label: 'Postleitzahl', value: '1234', field: 'plz' },
      { label: 'Ort', value: 'Test City', field: 'ort' },
    ];

    testCases.forEach(({ label, value, field }) => {
      const input = screen.getByLabelText(label);
      fireEvent.change(input, { target: { value } });
      expect(mockOnChange).toHaveBeenCalledWith(field, value);
    });
  });

  it('handles date input changes', () => {
    render(<FormFields values={mockValues} onChange={mockOnChange} />);

    const dateInput = screen.getByLabelText('Datum der Geburt');
    const testDate = '2024-01-01';
    
    fireEvent.change(dateInput, { target: { value: testDate } });
    expect(mockOnChange).toHaveBeenCalledWith('geburtsdatum', testDate);
  });

  it('handles checkbox changes', () => {
    render(<FormFields values={mockValues} onChange={mockOnChange} />);

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

  it('displays all municipalities in dropdown', () => {
    render(<FormFields values={mockValues} onChange={mockOnChange} />);

    const gemeindeSelect = screen.getByLabelText('Wahl der Gemeinde');
    fireEvent.click(gemeindeSelect);

    municipalities.forEach(municipality => {
      expect(screen.getByText(municipality)).toBeInTheDocument();
    });
  });

  it('handles municipality selection', () => {
    render(<FormFields values={mockValues} onChange={mockOnChange} />);

    const gemeindeSelect = screen.getByLabelText('Wahl der Gemeinde');
    fireEvent.click(gemeindeSelect);
    
    const option = screen.getByText(municipalities[0]);
    fireEvent.click(option);
    
    expect(mockOnChange).toHaveBeenCalledWith('gemeinde', municipalities[0]);
  });
});