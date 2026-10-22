import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorSummary } from '../ErrorSummary';

const fields = (
  <>
    <input id="vorname" aria-label="Vorname" />
    <input id="nachname" aria-label="Nachname" />
    <input id="address-input" aria-label="Adresse" />
  </>
);

// @covers FR-01.01
describe('ErrorSummary', () => {
  it('counts a single problem in the singular', () => {
    render(<ErrorSummary errors={{ vorname: 'Mindestens 2 Zeichen erforderlich' }} />);
    expect(screen.getByRole('heading', { name: 'Bitte prüfen Sie 1 Angabe' })).toBeInTheDocument();
  });

  it('lists problems in field order, each with its field name', () => {
    render(<ErrorSummary errors={{ nachname: 'Mindestens 2 Zeichen erforderlich', vorname: 'Mindestens 2 Zeichen erforderlich' }} />);
    expect(screen.getByRole('heading', { name: 'Bitte prüfen Sie 2 Angaben' })).toBeInTheDocument();
    expect(screen.getAllByRole('button').map(b => b.textContent)).toEqual([
      'Vorname: Mindestens 2 Zeichen erforderlich',
      'Nachname: Mindestens 2 Zeichen erforderlich',
    ]);
  });

  it('moves focus to the field without changing the address bar', () => {
    render(<>{fields}<ErrorSummary errors={{ nachname: 'Mindestens 2 Zeichen erforderlich' }} /></>);
    const before = window.location.href;

    fireEvent.click(screen.getByRole('button', { name: /Nachname/ }));

    expect(screen.getByLabelText('Nachname')).toHaveFocus();
    expect(window.location.href).toBe(before);
  });

  it('sends postcode problems to the address field', () => {
    render(<>{fields}<ErrorSummary errors={{ plz: 'PLZ fehlt' }} /></>);
    fireEvent.click(screen.getByRole('button', { name: /Adresse: PLZ fehlt/ }));
    expect(screen.getByLabelText('Adresse')).toHaveFocus();
  });

  it('shows nothing without errors', () => {
    const { container } = render(<ErrorSummary errors={{}} />);
    expect(container).toBeEmptyDOMElement();
  });
});
