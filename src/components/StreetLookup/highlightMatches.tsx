const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Wraps occurrences of the search terms in <mark>. User input is escaped, never parsed as HTML. */
export const highlightMatches = (text: string, searchTerms: string[]) => {
  const terms = searchTerms.filter(term => term.length >= 2).map(escapeRegExp);
  if (terms.length === 0) return <span>{text}</span>;

  const matcher = new RegExp(`(${terms.join("|")})`, "gi");
  // split() with a capturing group puts the matches at odd indexes.
  return (
    <span>
      {text.split(matcher).map((part, i) =>
        i % 2 === 1
          ? <mark key={i} className="bg-yellow-100 font-medium">{part}</mark>
          : part
      )}
    </span>
  );
};
