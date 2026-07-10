/** Khmer day-period label, since Intl's km-KH AM/PM strings don't render
 * the conventional Khmer words guests expect. */
function khmerPeriod(hour24: number): string {
  if (hour24 < 12) return "ព្រឹក";
  if (hour24 < 18) return "រសៀល";
  return "យប់";
}

/** Parses a stored 12-hour time string (e.g. "6:30 PM") and formats it for
 * the guest-facing locale, so Khmer viewers see the Khmer day-period word
 * (ព្រឹក/រសៀល/យប់) instead of AM/PM. */
export function formatAgendaTime(time: string, locale: string): string {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(time.trim());
  if (!match) return time;

  let hour24 = Number(match[1]) % 12;
  if (match[3].toUpperCase() === "PM") hour24 += 12;
  const minute = match[2];

  if (locale === "km") {
    const hour12 = ((hour24 + 11) % 12) + 1;
    return `${hour12}:${minute} ${khmerPeriod(hour24)}`;
  }

  const date = new Date(2000, 0, 1, hour24, Number(minute));
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
