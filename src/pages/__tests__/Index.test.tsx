import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Index from '../Index';

describe('Index', () => {
  const renderComponent = () => {
    render(
      <BrowserRouter>
        <Index />
      </BrowserRouter>
    );
  };

  it('renders the main heading', () => {
    renderComponent();
    expect(screen.getByText('Hebammenwartgeld Kanton Zug')).toBeDefined();
  });

  it('renders form fields', () => {
    renderComponent();
    expect(screen.getByLabelText('Vorname')).toBeDefined();
    expect(screen.getByLabelText('Nachname')).toBeDefined();
    expect(screen.getByText('Angaben')).toBeDefined();
  });

  it('shows preview placeholder when no PDF is generated', () => {
    renderComponent();
    expect(screen.getByText('Bitte füllen Sie das Formular aus')).toBeDefined();
  });

  it('renders generate button', () => {
    renderComponent();
    expect(screen.getByText('Rechnung Generieren')).toBeDefined();
  });
});