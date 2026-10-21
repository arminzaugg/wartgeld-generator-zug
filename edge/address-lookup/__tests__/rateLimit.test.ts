// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { createRateLimiter } from '../rateLimit';

// @covers FR-01.10
describe('createRateLimiter', () => {
  it('allows the cap within one minute and refuses the next request', () => {
    const now = 60_000 * 100 + 5;
    const allow = createRateLimiter(3, () => now);
    expect([allow(), allow(), allow(), allow()]).toEqual([true, true, true, false]);
  });

  it('starts counting again in the next minute', () => {
    let now = 60_000 * 100;
    const allow = createRateLimiter(1, () => now);
    expect(allow()).toBe(true);
    now += 59_999;
    expect(allow()).toBe(false);
    now += 1;
    expect(allow()).toBe(true);
  });

  it('refuses everything when the cap is zero', () => {
    expect(createRateLimiter(0, () => 0)()).toBe(false);
  });
});
