import { describe, it, expect } from 'vitest';
import { compareStreets } from './sort.ts';

const names = (list: string[], query: string) =>
  list.map(StreetName => ({ StreetName })).sort(compareStreets(query)).map(s => s.StreetName);

describe('compareStreets', () => {
  it('puts an exact match first regardless of input order', () => {
    expect(names(['Baarerstrasse', 'Baar'], 'baar')[0]).toBe('Baar');
    expect(names(['Baar', 'Baarerstrasse'], 'baar')[0]).toBe('Baar');
  });

  it('ranks prefix matches before other matches, shorter names first', () => {
    expect(names(['Alte Dorfstrasse', 'Dorfstrasse Nord', 'Dorfstrasse'], 'dorf'))
      .toEqual(['Dorfstrasse', 'Dorfstrasse Nord', 'Alte Dorfstrasse']);
  });
});
