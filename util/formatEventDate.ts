/**
 * The API sends dates as "YYYY-MM-DD HH:mm:ss" or null.
 * Returns the date formatted for the given locale, or null when there is no valid date.
 */
export function formatEventDate(
  value: string | null,
  locale: string,
): string | null {
  if (!value) return null;

  // Safari can't parse "2026-10-30 18:00:00"; the ISO form with a "T" works in every browser.
  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
