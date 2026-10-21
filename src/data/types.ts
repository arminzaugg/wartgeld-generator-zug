/** One municipality's share (% of addresses) of a locality. */
export interface LocalityMunicipality {
  bfs: number;
  share: number;
}

/** A locality (postcode + place name) with at least one address in canton Zug. */
export interface ZugLocality {
  postcode: string;
  locality: string;
  /** The postcode's main locality (Zusatzziffer 00). */
  main: boolean;
  /** Zug municipalities, largest share first. */
  municipalities: readonly LocalityMunicipality[];
  /** % of the locality's addresses in other cantons. */
  outsideShare: number;
}

/** Recipient block printed on the invoice. */
export interface MunicipalityRecipient {
  title: string;
  department: string;
  address: string;
  city: string;
}

export interface Municipality {
  /** Swiss federal municipality number (BFS-Nr). */
  bfs: number;
  name: string;
  recipient: MunicipalityRecipient;
}
