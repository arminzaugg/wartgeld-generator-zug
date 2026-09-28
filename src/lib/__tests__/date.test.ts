import { describe, it, expect, vi, afterEach } from 'vitest';
import { formatSwissDate, todayIso } from '../date';

describe('date helpers', () => {
  afterEach(() => vi.useRealTimers());

  it('formats ISO dates as DD.MM.YYYY without time-zone shifts', () => {
    expect(formatSwissDate('2024-01-01')).toBe('01.01.2024');
    expect(formatSwissDate('2025-12-31')).toBe('31.12.2025');
  });

  it('returns the local date for today', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 1, 3, 23, 30));
    expect(todayIso()).toBe('2025-02-03');
  });
});
