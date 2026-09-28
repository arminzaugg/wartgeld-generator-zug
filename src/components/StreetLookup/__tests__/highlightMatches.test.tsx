import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { highlightMatches } from '../highlightMatches';

describe('highlightMatches', () => {
  it('marks every matching term case-insensitively', () => {
    const { container } = render(highlightMatches('Baarerstrasse', ['baar', 'strasse']));
    expect([...container.querySelectorAll('mark')].map(m => m.textContent)).toEqual(['Baar', 'strasse']);
    expect(container.textContent).toBe('Baarerstrasse');
  });

  it('treats regex characters in the input literally instead of throwing', () => {
    expect(() => render(highlightMatches('Strasse (alt)', ['(a', '[x']))).not.toThrow();
    const { container } = render(highlightMatches('Strasse (alt)', ['(a']));
    expect(container.querySelector('mark')?.textContent).toBe('(a');
  });

  it('does not interpret HTML in the text', () => {
    const { container } = render(highlightMatches('<img src=x onerror=alert(1)>', ['im']));
    expect(container.querySelector('img')).toBeNull();
  });
});
