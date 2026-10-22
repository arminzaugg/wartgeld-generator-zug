import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { ServiceSelectionFields } from '../ServiceSelectionFields';

const renderServices = (betreuungGeburt = false, betreuungWochenbett = false) => {
  const onChange = vi.fn();
  render(<ServiceSelectionFields values={{ betreuungGeburt, betreuungWochenbett }} onChange={onChange} />);
  return onChange;
};

// @covers FR-01.01
describe('ServiceSelectionFields', () => {
  it('ticks a service when its row text is clicked', () => {
    const onChange = renderServices();
    fireEvent.click(screen.getByText('Betreuung der Gebärenden zuhause'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('betreuungGeburt', true);
  });

  it('ticks a service when its price is clicked', () => {
    const onChange = renderServices();
    const row = screen.getByText('Pflege der Wöchnerin zuhause').closest('label')!;
    fireEvent.click(within(row).getByText('CHF 400.00'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('betreuungWochenbett', true);
  });

  it('unticks a ticked service from its checkbox', () => {
    const onChange = renderServices(true);
    fireEvent.click(screen.getByRole('checkbox', { name: /Betreuung der Gebärenden/ }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('betreuungGeburt', false);
  });

  it.each([
    [false, false, 'CHF 0.00'],
    [true, false, 'CHF 400.00'],
    [true, true, 'CHF 800.00'],
  ])('shows the total for the ticked services (%s, %s → %s)', (geburt, wochenbett, total) => {
    renderServices(geburt, wochenbett);
    expect(screen.getByTestId('invoice-total')).toHaveTextContent(total);
  });
});
