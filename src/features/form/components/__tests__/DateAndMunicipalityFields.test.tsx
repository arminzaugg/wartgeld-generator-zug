import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { DateAndMunicipalityFields } from '../DateAndMunicipalityFields';

const renderFields = (plz: string, ort: string, gemeindeBfs = '', onChange = vi.fn()) => {
  render(
    <DateAndMunicipalityFields
      values={{ geburtsdatum: '', plz, ort, gemeindeBfs }}
      onChange={onChange}
    />
  );
  return { onChange, select: screen.getByLabelText('Zuständige Gemeinde') as HTMLSelectElement };
};

const SHARED = /gehört zu mehreren Gemeinden/;
const OUTSIDE = /teilweise ausserhalb des Kantons Zug/;

// @covers FR-01.01
describe('DateAndMunicipalityFields — municipality', () => {
  it('shows the proposed municipality without a hint for 6300 Zug', () => {
    const { select } = renderFields('6300', 'Zug', '1711');
    expect(select.value).toBe('1711');
    expect(screen.queryByText(SHARED)).not.toBeInTheDocument();
    expect(screen.queryByText(OUTSIDE)).not.toBeInTheDocument();
  });

  it('lists the locality\'s municipalities first and hints for 6314 Neuägeri', () => {
    const { select } = renderFields('6314', 'Neuägeri');
    expect(select.value).toBe('');
    const group = within(select).getByRole('group', { name: 'Gemeinden dieser Ortschaft' });
    expect(within(group).getAllByRole('option').map(o => o.textContent))
      .toEqual(['Unterägeri', 'Menzingen', 'Baar', 'Zug']);
    expect(screen.getByText(SHARED)).toBeInTheDocument();
  });

  it('keeps the shared hint visible after a municipality is chosen', () => {
    renderFields('6314', 'Neuägeri', '1704');
    expect(screen.getByText(SHARED)).toBeInTheDocument();
  });

  it('warns for 6340 Sihlbrugg that the locality lies partly outside canton Zug', () => {
    renderFields('6340', 'Sihlbrugg');
    expect(screen.getByText(OUTSIDE)).toBeInTheDocument();
  });

  it('reports the chosen municipality to the form', () => {
    const { select, onChange } = renderFields('6314', 'Neuägeri');
    fireEvent.change(select, { target: { value: '1704' } });
    expect(onChange).toHaveBeenCalledWith('gemeindeBfs', '1704');
  });

  it('is disabled until an address is picked', () => {
    const { select } = renderFields('', '');
    expect(select).toBeDisabled();
  });

  it('is disabled and explains why for a postcode outside canton Zug', () => {
    const { select } = renderFields('8001', 'Zürich');
    expect(select).toBeDisabled();
    expect(screen.getByText('Diese PLZ liegt nicht im Kanton Zug')).toBeInTheDocument();
  });
});

// @covers FR-01.01
describe('DateAndMunicipalityFields — birth date', () => {
  it('marks the birth date as invalid when it has an error', () => {
    render(
      <DateAndMunicipalityFields
        values={{ geburtsdatum: '', plz: '', ort: '', gemeindeBfs: '' }}
        errors={{ geburtsdatum: 'Bitte geben Sie das Geburtsdatum ein' }}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByLabelText('Datum der Geburt')).toHaveAttribute('aria-invalid', 'true');
  });
});
