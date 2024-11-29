import { generatePDF as pdfGenerator } from '@/lib/pdfGenerator';
import { getAdministrationData } from '@/lib/administrationData';

interface FormData {
  vorname: string;
  nachname: string;
  address: string;
  plz: string;
  ort: string;
  geburtsdatum: string;
  betreuungGeburt: boolean;
  betreuungWochenbett: boolean;
}

export const pdfGenerationService = {
  async generatePDF(formData: FormData): Promise<string> {
    try {
      const administrationData = await getAdministrationData(formData.ort);
      return await pdfGenerator({
        ...formData,
        gemeinde: administrationData.municipality
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('PDF generation failed');
    }
  }
};