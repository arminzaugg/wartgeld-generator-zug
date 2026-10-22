import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecipientSummary } from '../RecipientSummary';

// @covers FR-01.01
describe('RecipientSummary', () => {
  it('shows where the invoice goes once a municipality is chosen', () => {
    render(<RecipientSummary gemeindeBfs="1704" plz="6314" ort="Neuägeri" />);
    expect(screen.getByText('Rechnung geht an')).toBeInTheDocument();
    expect(screen.getByText('Gemeindeverwaltung Menzingen')).toBeInTheDocument();
    expect(screen.getByText('6314 Neuägeri')).toBeInTheDocument();
  });

  it('shows nothing while no municipality is chosen', () => {
    const { container } = render(<RecipientSummary gemeindeBfs="" plz="6314" ort="Neuägeri" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('puts nothing focusable between the municipality select and the services', () => {
    const { container } = render(<RecipientSummary gemeindeBfs="1701" plz="6319" ort="Allenwinden" />);
    expect(container.querySelector('a, button, input, select, [tabindex]')).toBeNull();
  });
});
