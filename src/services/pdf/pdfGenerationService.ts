import { generatePDF } from '@/lib/pdfGenerator';
import { getAdministrationData } from '@/lib/administrationData';
import type { FormValues } from '@/types/form';

export const pdfGenerationService = {
  /** Looks up the responsible administration for the PLZ once and renders the invoice. */
  async generatePDF(formData: FormValues): Promise<string> {
    const administration = await getAdministrationData(formData.plz);
    return generatePDF(formData, administration);
  }
};
