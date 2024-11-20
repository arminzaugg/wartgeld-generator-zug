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

export interface ZipSearchSummary {
  zips: ZipSummary[];
}

export interface AddressSearchParams {
  zipCity?: string;
  type?: 'DOMICILE' | 'POSTBOX' | 'PICK_POST' | 'MY_POST_24' | 'POST_OFFICE';
  limit?: number;
}