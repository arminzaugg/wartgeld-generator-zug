const WINDOW_MS = 60_000;

/**
 * Fixed one-minute window over all requests this instance serves. Best effort:
 * Bunny may run several instances, each with its own count.
 */
export const createRateLimiter = (maxPerMinute: number, now: () => number) => {
  let window = -1;
  let count = 0;
  return (): boolean => {
    const current = Math.floor(now() / WINDOW_MS);
    if (current !== window) {
      window = current;
      count = 0;
    }
    count += 1;
    return count <= maxPerMinute;
  };
};
