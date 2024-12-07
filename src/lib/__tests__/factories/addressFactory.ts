import { StreetSummary, HouseNumber } from '@/types/address';

export const createHouseNumber = (overrides?: Partial<HouseNumber>): HouseNumber => ({
  number: '1',
  addition: undefined,
  ...overrides,
});

export const createStreetSummary = (overrides?: Partial<StreetSummary>): StreetSummary => ({
  STRID: 1001,
  streetName: 'Test Street',
  zipCode: '6300',
  city: 'Zug',
  houseNumbers: [createHouseNumber()],
  ...overrides,
});