import { IAddressRepository } from '../interfaces/IAddressRepository';
import { StreetSummary } from '@/types/address';
import { createStreetSummary } from '@/lib/__tests__/factories/addressFactory';

export class MockAddressRepository implements IAddressRepository {
  private mockStreets: StreetSummary[] = [createStreetSummary()];
  private mockPlzMapping = { gemeinde: 'Test Gemeinde' };

  async lookupStreet(query: string): Promise<StreetSummary[]> {
    return this.mockStreets;
  }

  async getPlzMapping(plz: string): Promise<{ gemeinde: string } | null> {
    return this.mockPlzMapping;
  }

  setMockStreets(streets: StreetSummary[]) {
    this.mockStreets = streets;
  }

  setMockPlzMapping(mapping: { gemeinde: string } | null) {
    this.mockPlzMapping = mapping;
  }
}