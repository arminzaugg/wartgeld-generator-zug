import { AutocompleteRequest, ApiResponse } from '@/types/address';

export const createAutocompleteRequest = (overrides?: Partial<AutocompleteRequest>): AutocompleteRequest => ({
  request: {
    ONRP: 0,
    ZipCode: '',
    ZipAddition: '',
    TownName: '',
    STRID: 0,
    StreetName: '',
    HouseKey: 0,
    HouseNo: '',
    HouseNoAddition: '',
    ...overrides?.request,
  },
  zipOrderMode: 0,
  zipFilterMode: 0,
  ...overrides,
});

export const createApiResponse = (overrides?: Partial<ApiResponse>): ApiResponse => ({
  QueryAutoComplete4Result: {
    AutoCompleteResult: [{
      Canton: 'ZG',
      CountryCode: 'CH',
      HouseKey: '0',
      HouseNo: '1',
      HouseNoAddition: '',
      ONRP: '0',
      STRID: '1001',
      StreetName: 'Test Street',
      TownName: 'Zug',
      ZipAddition: '',
      ZipCode: '6300',
    }],
    ...overrides?.QueryAutoComplete4Result,
  },
});