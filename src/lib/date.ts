/** Today's date as `YYYY-MM-DD` in the user's local time zone. */
export const todayIso = (): string => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

/**
 * Formats an ISO date (`YYYY-MM-DD`, as produced by <input type="date">) as `DD.MM.YYYY`.
 * Parsed as plain text so the result never shifts by a day with the time zone.
 */
export const formatSwissDate = (isoDate: string): string => {
  const [year, month, day] = isoDate.split('-');
  return `${day}.${month}.${year}`;
};
