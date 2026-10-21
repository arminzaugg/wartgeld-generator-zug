export interface ZipSummary {
  zip: string;
  city18: string;
  city27: string;
  city39: string;
}

export interface StreetSummary {
  streetName: string;
  zipCode: string;
  city: string;
  houseNumbers?: HouseNumber[];
}

export interface HouseNumber {
  number: string;
  addition?: string;
}

/** Answer of `/api/address` (see edge/address-lookup/handler.ts). */
export interface AddressLookupResponse {
  results?: Array<{
    street: string;
    houseNumber: string;
    houseNumberAddition: string;
    postcode: string;
    town: string;
  }>;
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