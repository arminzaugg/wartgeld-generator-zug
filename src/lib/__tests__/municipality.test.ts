import { describe, it, expect } from 'vitest';
import {
  getMunicipality,
  normalizeTown,
  proposeMunicipality,
} from '../municipality';
import type { ZugLocality } from '@/data/types';

const BAAR = 1701, MENZINGEN = 1704, NEUHEIM = 1705, OBERAEGERI = 1706, UNTERAEGERI = 1709, ZUG = 1711;
const bfsOf = (p: ReturnType<typeof proposeMunicipality>) => p.candidates.map(m => m.bfs);

// @covers FR-01.01
describe('proposeMunicipality', () => {
  it('pre-selects Baar for 6319 Allenwinden without any hint', () => {
    expect(proposeMunicipality('6319', 'Allenwinden')).toMatchObject({
      known: true, proposedBfs: BAAR, sharedHint: false, outsideHint: false,
    });
  });

  it('pre-selects Zug for 6300 Zug although 0.48 % of it lies in Baar', () => {
    expect(proposeMunicipality('6300', 'Zug')).toMatchObject({
      proposedBfs: ZUG, sharedHint: false, outsideHint: false,
    });
  });

  it('leaves 6314 Neuägeri unselected and lists its four municipalities first', () => {
    const proposal = proposeMunicipality('6314', 'Neuägeri');
    expect(proposal).toMatchObject({ proposedBfs: null, sharedHint: true, outsideHint: false });
    expect(bfsOf(proposal)).toEqual([UNTERAEGERI, MENZINGEN, BAAR, ZUG]);
  });

  it('leaves 8836 Bennau unselected and warns that it lies mostly outside canton Zug', () => {
    expect(proposeMunicipality('8836', 'Bennau')).toMatchObject({
      known: true, proposedBfs: null, sharedHint: false, outsideHint: true,
    });
  });

  it('flags 6340 Sihlbrugg as partly outside canton Zug', () => {
    expect(proposeMunicipality('6340', 'Sihlbrugg')).toMatchObject({
      proposedBfs: null, outsideHint: true,
    });
  });

  it('matches the town regardless of case, surrounding spaces and Unicode composition', () => {
    const decomposed = 'Neuägeri'; // "ä" as a + combining diaeresis
    expect(normalizeTown(decomposed)).toBe(normalizeTown(' NEUÄGERI '));
    expect(proposeMunicipality('6314', decomposed).sharedHint).toBe(true);
  });

  it('ignores spaces around the postcode', () => {
    expect(proposeMunicipality(' 6319 ', 'Allenwinden').proposedBfs).toBe(1701);
  });

  it('combines all localities of the postcode when the town matches none, without pre-selecting', () => {
    const proposal = proposeMunicipality('6314', 'Ägerital');
    expect(proposal).toMatchObject({ known: true, proposedBfs: null, sharedHint: true });
    // Main locality Unterägeri first, then Neuägeri's other municipalities.
    expect(bfsOf(proposal)).toEqual([UNTERAEGERI, OBERAEGERI, MENZINGEN, BAAR, ZUG]);
  });

  it('pre-selects and still shows the shared hint when the leader has 80 % or more', () => {
    const localities: ZugLocality[] = [{
      postcode: '9999', locality: 'Testdorf', main: true, outsideShare: 0,
      municipalities: [{ bfs: ZUG, share: 85 }, { bfs: BAAR, share: 10 }, { bfs: NEUHEIM, share: 5 }],
    }];
    expect(proposeMunicipality('9999', 'Testdorf', localities)).toMatchObject({
      proposedBfs: ZUG, sharedHint: true,
    });
  });

  it('reports a postcode without any Zug locality as unknown', () => {
    expect(proposeMunicipality('8000', 'Zürich')).toEqual({
      known: false, proposedBfs: null, candidates: [], sharedHint: false, outsideHint: false,
    });
  });
});

// @covers FR-01.03
describe('getMunicipality', () => {
  it('returns the invoice recipient for a BFS number', () => {
    expect(getMunicipality(MENZINGEN)?.recipient).toEqual({
      title: 'Gemeindeverwaltung', department: 'Soziales und Gesundheit',
      address: 'Postfach', city: '6313 Menzingen',
    });
  });

  it('returns undefined for a number outside canton Zug', () => {
    expect(getMunicipality(261)).toBeUndefined();
  });
});
