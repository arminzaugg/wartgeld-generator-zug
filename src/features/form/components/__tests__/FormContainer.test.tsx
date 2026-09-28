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
});
