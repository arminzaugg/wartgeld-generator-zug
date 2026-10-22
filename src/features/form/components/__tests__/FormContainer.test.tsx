import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { FormContainer } from '../FormContainer';
import { renderWithProviders } from '@/lib/__tests__/test-utils';
import { createFormValues } from '@/lib/__tests__/factories/formFactory';
import { pdfGenerationService } from '@/services/pdf/pdfGenerationService';

vi.mock('@/services/pdf/pdfGenerationService', () => ({
  pdfGenerationService: { generatePDF: vi.fn() }
}));

const renderForm = (values = createFormValues(), onSubmit = vi.fn().mockResolvedValue(undefined)) => {
  renderWithProviders(
    <FormContainer
      values={values}
      onChange={vi.fn()}
      onAddressChange={vi.fn()}
      onClear={vi.fn()}
      onSubmit={onSubmit}
    />
  );
  return { onSubmit };
};

// @covers FR-01.01
describe('FormContainer', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls onSubmit exactly once and does not generate a PDF itself', async () => {
    const { onSubmit } = renderForm();

    fireEvent.click(screen.getByRole('button', { name: 'Rechnung generieren' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(pdfGenerationService.generatePDF).not.toHaveBeenCalled();
  });

  it('does not submit invalid values', async () => {
    const { onSubmit } = renderForm(createFormValues({ vorname: '' }));

    fireEvent.click(screen.getByRole('button', { name: 'Rechnung generieren' }));

    expect(await screen.findAllByText('Mindestens 2 Zeichen erforderlich')).not.toHaveLength(0);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('does not submit until the responsible municipality is chosen', async () => {
    const { onSubmit } = renderForm(createFormValues({ address: 'Hauptstrasse 1, 6314 Neuägeri', plz: '6314', ort: 'Neuägeri', gemeindeBfs: '' }));

    fireEvent.click(screen.getByRole('button', { name: 'Rechnung generieren' }));

    expect(await screen.findAllByText('Bitte wählen Sie die zuständige Gemeinde')).not.toHaveLength(0);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('drops the municipality error once a different address is picked', async () => {
    const neuaegeri = createFormValues({ address: 'Hauptstrasse 1, 6314 Neuägeri', plz: '6314', ort: 'Neuägeri', gemeindeBfs: '' });
    const props = { onChange: vi.fn(), onAddressChange: vi.fn(), onClear: vi.fn(), onSubmit: vi.fn() };
    const { rerender } = renderWithProviders(<FormContainer values={neuaegeri} {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Rechnung generieren' }));
    expect(await screen.findAllByText('Bitte wählen Sie die zuständige Gemeinde')).not.toHaveLength(0);

    const allenwinden = { ...neuaegeri, address: 'Dorfstrasse 1, 6319 Allenwinden', plz: '6319', ort: 'Allenwinden', gemeindeBfs: '1701' };
    rerender(<FormContainer values={allenwinden} {...props} />);

    expect(screen.queryByText('Bitte wählen Sie die zuständige Gemeinde')).toBeNull();
  });

  it('does not show the problem summary while the midwife is still typing', () => {
    renderForm(createFormValues({ vorname: '' }));

    fireEvent.change(screen.getByLabelText('Vorname'), { target: { value: 'A' } });

    expect(screen.queryByRole('heading', { name: /Bitte prüfen Sie/ })).toBeNull();
  });

  it('shows and focuses the problem summary after a failed submit', async () => {
    renderForm(createFormValues({ vorname: '' }));

    fireEvent.click(screen.getByRole('button', { name: 'Rechnung generieren' }));

    const heading = await screen.findByRole('heading', { name: 'Bitte prüfen Sie 1 Angabe' });
    expect(heading).toHaveFocus();
    expect(screen.getByLabelText('Vorname')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Vorname')).toHaveAccessibleDescription(/Mindestens 2 Zeichen erforderlich/);
  });

  it('shows an address problem under the address field', async () => {
    renderForm(createFormValues({ address: 'Seestrasse 1', plz: '', ort: '', gemeindeBfs: '' }));

    fireEvent.click(screen.getByRole('button', { name: 'Rechnung generieren' }));

    await screen.findByRole('heading', { name: /Bitte prüfen Sie/ });
    expect(screen.getByRole('combobox', { name: 'Adresse' })).toHaveAttribute('aria-invalid', 'true');
  });

  it('labels the address field "Adresse" and explains how to fill it', () => {
    renderForm();
    expect(screen.getByRole('combobox', { name: 'Adresse' })).toHaveAccessibleDescription(/PLZ und Ort übernehmen Sie aus der Liste der Post/);
    expect(screen.getByPlaceholderText('Strasse und Hausnummer')).toBeInTheDocument();
  });

  it('labels the birth date field "Geburtsdatum"', () => {
    renderForm();
    expect(screen.getByLabelText('Geburtsdatum')).toHaveAttribute('type', 'date');
  });

  it('offers a single generate button and shows the busy state while the invoice is made', () => {
    renderWithProviders(
      <FormContainer values={createFormValues()} onChange={vi.fn()} onAddressChange={vi.fn()} onClear={vi.fn()} onSubmit={vi.fn()} isSubmitting />
    );
    expect(screen.getByRole('button', { name: /Rechnung wird erstellt/ })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Rechnung generieren' })).toBeNull();
  });

  it('keeps reset available while the invoice is made, so a stalled generation never locks the form', () => {
    renderWithProviders(
      <FormContainer values={createFormValues()} onChange={vi.fn()} onAddressChange={vi.fn()} onClear={vi.fn()} onSubmit={vi.fn()} isSubmitting />
    );
    expect(screen.getByRole('button', { name: 'Zurücksetzen' })).toBeEnabled();
  });

  it('keeps reporting an address problem when the address is typed over without picking a suggestion', async () => {
    const zuerich = createFormValues({ address: 'Bahnhofstrasse 1, 8001 Zürich', plz: '8001', ort: 'Zürich', gemeindeBfs: '' });
    const props = { onChange: vi.fn(), onAddressChange: vi.fn(), onClear: vi.fn(), onSubmit: vi.fn() };
    const { rerender } = renderWithProviders(<FormContainer values={zuerich} {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Rechnung generieren' }));
    expect(await screen.findAllByText(/nicht im Kanton Zug/)).not.toHaveLength(0);

    rerender(<FormContainer values={{ ...zuerich, address: 'Bahnhofstr', plz: '', ort: '' }} {...props} />);

    expect(screen.getAllByText(/aus der Vorschlagsliste/), 'the new address problem replaces the old one').not.toHaveLength(0);
    expect(screen.getByRole('heading', { name: /Bitte prüfen Sie/ })).toBeInTheDocument();
  });

  it('drops "Adresse ist erforderlich" once an address is entered', async () => {
    const empty = createFormValues({ address: '', plz: '', ort: '', gemeindeBfs: '' });
    const props = { onChange: vi.fn(), onAddressChange: vi.fn(), onClear: vi.fn(), onSubmit: vi.fn() };
    const { rerender } = renderWithProviders(<FormContainer values={empty} {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Rechnung generieren' }));
    expect(await screen.findAllByText(/Adresse ist erforderlich/)).not.toHaveLength(0);

    rerender(<FormContainer values={createFormValues()} {...props} />);

    expect(screen.queryByText(/Adresse ist erforderlich/)).toBeNull();
  });

  it('hides the problem summary after a successful submit', async () => {
    const props = { onChange: vi.fn(), onAddressChange: vi.fn(), onClear: vi.fn(), onSubmit: vi.fn() };
    const { rerender } = renderWithProviders(<FormContainer values={createFormValues({ vorname: '' })} {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Rechnung generieren' }));
    await screen.findByRole('heading', { name: /Bitte prüfen Sie/ });

    rerender(<FormContainer values={createFormValues()} {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Rechnung generieren' }));

    await waitFor(() => expect(props.onSubmit).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole('heading', { name: /Bitte prüfen Sie/ })).toBeNull();
  });
});
