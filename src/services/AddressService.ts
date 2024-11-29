import { IAddressRepository } from '@/repositories/interfaces/IAddressRepository';
import { StreetSummary } from '@/types/address';

export class AddressService {
  constructor(private addressRepository: IAddressRepository) {}

  async lookupStreet(query: string): Promise<StreetSummary[]> {
    return this.addressRepository.lookupStreet(query);
  }

  async getPlzMapping(plz: string): Promise<{ gemeinde: string } | null> {
    return this.addressRepository.getPlzMapping(plz);
  }
}