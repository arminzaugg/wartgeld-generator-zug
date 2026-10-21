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

/** One suggestion from `/api/address`; shared by the web app and edge/address-lookup/handler.ts. */
export interface AddressSuggestion {
  street: string;
  houseNumber: string;
  houseNumberAddition: string;
  postcode: string;
  town: string;
}

export interface AddressLookupResponse {
  results?: AddressSuggestion[];
}
