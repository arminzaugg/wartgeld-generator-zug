export interface AutocompleteRequest {
  request: {
    ONRP: number;
    ZipCode: string;
    ZipAddition: string;
    TownName: string;
    STRID: number;
    StreetName: string;
    HouseKey: number;
    HouseNo: string;
    HouseNoAddition: string;
  };
  zipOrderMode: number;
  zipFilterMode: number;
}

export interface ZipSummary {
  zip: string;
  city18: string;
  city27: string;
  city39: string;
}

export interface StreetSummary {
  STRID: number;
  streetName: string;
  zipCode: string;
  city: string;
  houseNumbers?: HouseNumber[];
}

export interface HouseNumber {
  number: string;
  addition?: string;
}

export interface ApiResponse {
  QueryAutoComplete4Result: {
    AutoCompleteResult: Array<{
      Canton: string;
      CountryCode: string;
      HouseKey: string;
      HouseNo: string;
      HouseNoAddition: string;
      ONRP: string;
      STRID: string;
      StreetName: string;
      TownName: string;
      ZipAddition: string;
      ZipCode: string;
    }>;
  };
}

export interface AddressSearchParams {
  zipCity?: string;
  type?: 'DOMICILE' | 'POSTBOX' | 'PICK_POST' | 'MY_POST_24' | 'POST_OFFICE';
  limit?: number;
}

export interface StreetSearchParams {
  streetName: string;
  zipCode?: string;
  limit?: number;
}