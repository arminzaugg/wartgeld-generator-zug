import { SupabaseAddressRepository } from '@/repositories/SupabaseAddressRepository';
import { SupabaseAdministrationRepository } from '@/repositories/SupabaseAdministrationRepository';
import { AddressService } from './AddressService';
import { InvoiceService } from './InvoiceService';

export class ServiceProvider {
  private static addressService: AddressService;
  private static invoiceService: InvoiceService;

  static getAddressService(): AddressService {
    if (!this.addressService) {
      const repository = new SupabaseAddressRepository();
      this.addressService = new AddressService(repository);
    }
    return this.addressService;
  }

  static getInvoiceService(): InvoiceService {
    if (!this.invoiceService) {
      const repository = new SupabaseAdministrationRepository();
      this.invoiceService = new InvoiceService(repository);
    }
    return this.invoiceService;
  }
}