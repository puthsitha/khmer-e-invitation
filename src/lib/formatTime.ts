/** Parses a stored 12-hour time string (e.g. "6:30 PM") and formats it for
 * the guest-facing locale, so Khmer viewers see Khmer numerals/format. */
export function formatAgendaTime(time: string, locale: string): string {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(time.trim());
  if (!match) return time;

  let hours = Number(match[1]) % 12;
  if (match[3].toUpperCase() === "PM") hours += 12;
  const date = new Date(2000, 0, 1, hours, Number(match[2]));

  return new Intl.DateTimeFormat(locale === "km" ? "km-KH" : "en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
