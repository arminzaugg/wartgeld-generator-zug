import { IAdministrationRepository } from '@/repositories/interfaces/IAdministrationRepository';
import { FormData } from '@/types/form';
import { generatePDF } from '@/lib/pdfGenerator';

export class InvoiceService {
  constructor(private administrationRepository: IAdministrationRepository) {}

  async generateInvoice(formData: FormData): Promise<string> {
    const administrationData = await this.administrationRepository.getAdministrationData(formData.gemeinde);
    return generatePDF({
      ...formData,
      ...administrationData
    });
  }
}