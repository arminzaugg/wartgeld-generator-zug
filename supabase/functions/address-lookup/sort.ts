interface Named {
  StreetName: string;
}

/**
 * Orders street results for a query: exact matches first, then prefix
 * matches, then shorter names first.
 */
export const compareStreets = (query: string) => {
  const q = query.toLowerCase();
  return (a: Named, b: Named): number => {
    const nameA = a.StreetName.toLowerCase();
    const nameB = b.StreetName.toLowerCase();

    const exactA = nameA === q;
    const exactB = nameB === q;
    if (exactA !== exactB) return exactA ? -1 : 1;

    const prefixA = nameA.startsWith(q);
    const prefixB = nameB.startsWith(q);
    if (prefixA !== prefixB) return prefixA ? -1 : 1;

    return a.StreetName.length - b.StreetName.length;
  };
};
