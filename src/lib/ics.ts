function toIcsTimestamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function escapeIcsText(value: string): string {
  return value.replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");
}

const DEFAULT_DURATION_MS = 3 * 60 * 60 * 1000;

/** Builds a downloadable .ics file for the event and triggers the browser
 * save dialog, so guests can add the date straight to their own calendar. */
export function downloadInvitationIcs({
  uid,
  title,
  description,
  location,
  startDate,
}: {
  uid: string;
  title: string;
  description?: string;
  location?: string;
  startDate: Date;
}) {
  const endDate = new Date(startDate.getTime() + DEFAULT_DURATION_MS);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Khmer E-Invitation//EN",
    "BEGIN:VEVENT",
    `UID:${uid}@khmer-e-invitation`,
    `DTSTAMP:${toIcsTimestamp(new Date())}`,
    `DTSTART:${toIcsTimestamp(startDate)}`,
    `DTEND:${toIcsTimestamp(endDate)}`,
    `SUMMARY:${escapeIcsText(title)}`,
    description ? `DESCRIPTION:${escapeIcsText(description)}` : null,
    location ? `LOCATION:${escapeIcsText(location)}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter((line): line is string => line !== null);

  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${uid}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
