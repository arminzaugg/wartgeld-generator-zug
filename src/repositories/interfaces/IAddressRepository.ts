import { StreetSummary } from '@/types/address';

export interface IAddressRepository {
  lookupStreet(query: string): Promise<StreetSummary[]>;
  getPlzMapping(plz: string): Promise<{ gemeinde: string } | null>;
}