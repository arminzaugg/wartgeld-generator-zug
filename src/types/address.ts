export interface ZipSummary {
  zip: string;
  city18: string;
  city27: string;
  city39: string;
}

export interface ZipSearchSummary {
  zips: ZipSummary[];
}

export interface StreetSearchSummary {
  streets: string[];
}

export interface HouseSearchSummary {
  houses: string[];
}

export interface AddressSearchParams {
  zipCity?: string;
  type?: 'DOMICILE' | 'POSTBOX' | 'PICK_POST' | 'MY_POST_24' | 'POST_OFFICE';
  limit?: number;
}