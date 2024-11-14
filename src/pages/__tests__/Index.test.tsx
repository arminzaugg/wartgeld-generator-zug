import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Index from '../Index';
import { describe, it, expect, vi } from 'vitest';

describe('Index Page', () => {
  it('renders form and preview sections', () => {
    render(
      <BrowserRouter>
        <Index />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Hebammenwartgeld Kanton Zug/i)).toBeInTheDocument();
    expect(screen.getByText(/Angaben/i)).toBeInTheDocument();
    expect(screen.getByText(/Vorschau/i)).toBeInTheDocument();
  });

  it('generates PDF when form is filled and submitted', async () => {
    render(
      <BrowserRouter>
        <Index />
      </BrowserRouter>
    );
    
    // Fill form
    fireEvent.change(screen.getByLabelText(/Vorname/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/Nachname/i), { target: { value: 'Doe' } });
    
    // Click generate button
    const generateButton = screen.getByText(/Rechnung Generieren/i);
    fireEvent.click(generateButton);
    
    // Check if preview is updated
    expect(screen.queryByText(/Bitte füllen Sie das Formular aus/i)).not.toBeInTheDocument();
  });
});