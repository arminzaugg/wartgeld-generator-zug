import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Settings from '../Settings';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Settings Page', () => {
  beforeEach(() => {
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });
  });

  it('renders settings form', () => {
    render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Rechnungsstellerin/i)).toBeInTheDocument();
    expect(screen.getByText(/Ort & Datum/i)).toBeInTheDocument();
    expect(screen.getByText(/Unterschrift/i)).toBeInTheDocument();
  });

  it('saves settings when form is submitted', () => {
    render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>
    );
    
    const textarea = screen.getByPlaceholderText(/Martina Mustermann/i);
    fireEvent.change(textarea, { target: { value: 'Test User\nTest Address' } });
    
    const saveButton = screen.getByText('Speichern');
    fireEvent.click(saveButton);
    
    expect(localStorage.setItem).toHaveBeenCalled();
  });
});