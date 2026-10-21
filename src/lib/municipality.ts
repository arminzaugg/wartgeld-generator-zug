import { MUNICIPALITIES } from "@/data/municipalities";
import { ZUG_LOCALITIES } from "@/data/zugLocalities.generated";
import type { Municipality, ZugLocality } from "@/data/types";

/** Share (%) of a locality's addresses at which its leading municipality is pre-selected. */
export const PRESELECT_SHARE = 80;
/** Share (%) from which another municipality or another canton is worth a hint. */
export const HINT_SHARE = 5;

export interface MunicipalityProposal {
  /** The postcode has at least one locality in canton Zug. */
  known: boolean;
  /** Municipality to pre-select, or null when the midwife has to choose. */
  proposedBfs: number | null;
  /** Municipalities of the address's locality, most likely first. */
  candidates: Municipality[];
  /** The locality is split between several Zug municipalities. */
  sharedHint: boolean;
  /** A noticeable part of the locality lies outside canton Zug. */
  outsideHint: boolean;
}

/** The selected municipality has no invoice recipient (should be prevented by validation). */
export class UnknownMunicipalityError extends Error {
  constructor(public readonly bfs: number) {
    super(`No invoice recipient for municipality ${bfs}`);
    this.name = "UnknownMunicipalityError";
  }
}

/** Compares town names from Swiss Post with official locality names. */
export const normalizeTown = (town: string): string =>
  town.normalize("NFC").trim().toLocaleLowerCase("de-CH");

export const getMunicipality = (bfs: number): Municipality | undefined =>
  MUNICIPALITIES.find(m => m.bfs === bfs);

const toMunicipalities = (bfsNumbers: number[]): Municipality[] =>
  bfsNumbers.flatMap(bfs => getMunicipality(bfs) ?? []);

export const proposeMunicipality = (
  postcode: string,
  town: string,
  localities: readonly ZugLocality[] = ZUG_LOCALITIES,
): MunicipalityProposal => {
  const code = postcode.trim();
  const forPostcode = localities.filter(l => l.postcode === code);
  if (forPostcode.length === 0) {
    return { known: false, proposedBfs: null, candidates: [], sharedHint: false, outsideHint: false };
  }

  const wanted = normalizeTown(town);
  const matched = forPostcode.find(l => normalizeTown(l.locality) === wanted);
  if (matched) {
    const [leader] = matched.municipalities;
    return {
      known: true,
      proposedBfs: leader && leader.share >= PRESELECT_SHARE ? leader.bfs : null,
      candidates: toMunicipalities(matched.municipalities.map(m => m.bfs)),
      sharedHint: matched.municipalities.filter(m => m.share >= HINT_SHARE).length >= 2,
      outsideHint: matched.outsideShare >= HINT_SHARE,
    };
  }

  // Unknown town spelling: offer every municipality of the postcode, main
  // locality first. Shares belong to single localities and are not combined.
  const ordered = [...forPostcode].sort((a, b) => Number(b.main) - Number(a.main));
  const bfsNumbers = [...new Set(ordered.flatMap(l => l.municipalities.map(m => m.bfs)))];
  const onlyOne = bfsNumbers.length === 1
    && forPostcode.every(l => (l.municipalities[0]?.share ?? 0) >= PRESELECT_SHARE);
  return {
    known: true,
    proposedBfs: onlyOne ? bfsNumbers[0] : null,
    candidates: toMunicipalities(bfsNumbers),
    sharedHint: bfsNumbers.length > 1,
    outsideHint: forPostcode.some(l => l.outsideShare >= HINT_SHARE),
  };
};
