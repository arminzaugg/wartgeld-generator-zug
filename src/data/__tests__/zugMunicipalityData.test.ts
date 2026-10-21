import { describe, it, expect } from 'vitest';
import { ZUG_LOCALITIES } from '../zugLocalities.generated';
import { MUNICIPALITIES } from '../municipalities';
import supabaseExport from '../../../scripts/municipality-data/supabase-export-2026-10-21.json';

const locality = (postcode: string, name: string) =>
  ZUG_LOCALITIES.find(l => l.postcode === postcode && l.locality === name);

// @covers FR-01.03
describe('bundled Zug municipality data', () => {
  it('has exactly one recipient for each of the 11 Zug municipalities', () => {
    expect(MUNICIPALITIES).toHaveLength(11);
    expect(new Set(MUNICIPALITIES.map(m => m.bfs)).size).toBe(11);
    expect(new Set(MUNICIPALITIES.map(m => m.name)).size).toBe(11);
  });

  it('maps every Zug locality only to municipalities that have a recipient', () => {
    const known = new Set(MUNICIPALITIES.map(m => m.bfs));
    const unknown = ZUG_LOCALITIES.flatMap(l => l.municipalities)
      .filter(m => !known.has(m.bfs));
    expect(unknown).toEqual([]);
  });

  it('prints the same recipient lines as the Supabase export of 2026-10-21', () => {
    const exported = supabaseExport.rows.map(r => ({
      name: r.municipality,
      recipient: { title: r.title, department: r.name, address: r.address, city: r.city },
    }));
    expect(MUNICIPALITIES.map(({ name, recipient }) => ({ name, recipient }))).toEqual(exported);
  });

  it('assigns 6319 Allenwinden entirely to Baar', () => {
    expect(locality('6319', 'Allenwinden')).toMatchObject({
      municipalities: [{ bfs: 1701, share: 100 }],
      outsideShare: 0,
    });
  });

  it('splits 6314 Neuägeri across four municipalities, largest share first, ties by BFS number', () => {
    expect(locality('6314', 'Neuägeri')?.municipalities.map(m => m.bfs)).toEqual([1709, 1704, 1701, 1711]);
  });

  it('keeps the share of 8836 Bennau that lies outside canton Zug', () => {
    const bennau = locality('8836', 'Bennau');
    expect(bennau?.municipalities).toEqual([{ bfs: 1706, share: 5.036 }]);
    expect(bennau?.outsideShare).toBeCloseTo(94.964, 3);
  });
});
