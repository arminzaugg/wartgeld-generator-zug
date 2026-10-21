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

    fireEvent.click(screen.getByRole('button', { name: 'Rechnung Generieren' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(pdfGenerationService.generatePDF).not.toHaveBeenCalled();
  });

  it('does not submit invalid values', async () => {
    const { onSubmit } = renderForm(createFormValues({ vorname: '' }));

    fireEvent.click(screen.getByRole('button', { name: 'Rechnung Generieren' }));

    expect(await screen.findAllByText('Mindestens 2 Zeichen erforderlich')).not.toHaveLength(0);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('does not submit until the responsible municipality is chosen', async () => {
    const { onSubmit } = renderForm(createFormValues({ address: 'Hauptstrasse 1, 6314 Neuägeri', plz: '6314', ort: 'Neuägeri', gemeindeBfs: '' }));

    fireEvent.click(screen.getByRole('button', { name: 'Rechnung Generieren' }));

    expect(await screen.findAllByText('Bitte wählen Sie die zuständige Gemeinde')).not.toHaveLength(0);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('drops the municipality error once a different address is picked', async () => {
    const neuaegeri = createFormValues({ address: 'Hauptstrasse 1, 6314 Neuägeri', plz: '6314', ort: 'Neuägeri', gemeindeBfs: '' });
    const props = { onChange: vi.fn(), onAddressChange: vi.fn(), onClear: vi.fn(), onSubmit: vi.fn() };
    const { rerender } = renderWithProviders(<FormContainer values={neuaegeri} {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Rechnung Generieren' }));
    expect(await screen.findAllByText('Bitte wählen Sie die zuständige Gemeinde')).not.toHaveLength(0);

    const allenwinden = { ...neuaegeri, address: 'Dorfstrasse 1, 6319 Allenwinden', plz: '6319', ort: 'Allenwinden', gemeindeBfs: '1701' };
    rerender(<FormContainer values={allenwinden} {...props} />);

    expect(screen.queryByText('Bitte wählen Sie die zuständige Gemeinde')).toBeNull();
  });
});
