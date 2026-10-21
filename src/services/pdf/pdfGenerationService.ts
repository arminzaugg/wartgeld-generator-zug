import { generatePDF } from '@/lib/pdfGenerator';
import { getMunicipality, UnknownMunicipalityError } from '@/lib/municipality';
import type { FormValues } from '@/types/form';

export const pdfGenerationService = {
  /** Renders the invoice for the municipality chosen on the form; needs no network. */
  async generatePDF(formData: FormValues): Promise<string> {
    const bfs = Number(formData.gemeindeBfs);
    const municipality = getMunicipality(bfs);
    if (!municipality) throw new UnknownMunicipalityError(bfs);
    return generatePDF(formData, municipality.recipient);
  }
};
