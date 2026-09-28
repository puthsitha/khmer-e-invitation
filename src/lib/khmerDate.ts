const KHMER_WEEKDAYS_FULL = [
  "ថ្ងៃអាទិត្យ",
  "ថ្ងៃច័ន្ទ",
  "ថ្ងៃអង្គារ",
  "ថ្ងៃពុធ",
  "ថ្ងៃព្រហស្បតិ៍",
  "ថ្ងៃសុក្រ",
  "ថ្ងៃសៅរ៍",
];

const KHMER_WEEKDAYS_SHORT = [
  "អាទិត្យ",
  "ច័ន្ទ",
  "អង្គារ",
  "ពុធ",
  "ព្រហស្បតិ៍",
  "សុក្រ",
  "សៅរ៍",
];

const KHMER_MONTHS = [
  "មករា",
  "កុម្ភៈ",
  "មីនា",
  "មេសា",
  "ឧសភា",
  "មិថុនា",
  "កក្កដា",
  "សីហា",
  "កញ្ញា",
  "តុលា",
  "វិច្ឆិកា",
  "ធ្នូ",
];

const KHMER_DIGITS = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];

/**
 * Browsers/Node builds without full Khmer ICU data silently fall back to
 * English output for `toLocaleDateString("km-KH", ...)` — no error, just
 * the wrong language. Format Khmer dates/times manually instead so the
 * viewer always shows real Khmer regardless of the runtime's ICU data.
 */
export function toKhmerDigits(value: number | string): string {
  return String(value)
    .split("")
    .map((char) => KHMER_DIGITS[Number(char)] ?? char)
    .join("");
}

export function formatKhmerDate(date: Date): string {
  const weekday = KHMER_WEEKDAYS_FULL[date.getDay()];
  const month = KHMER_MONTHS[date.getMonth()];
  return `${weekday} ទី${toKhmerDigits(date.getDate())} ខែ${month} ឆ្នាំ${toKhmerDigits(date.getFullYear())}`;
}

export function formatKhmerTime(date: Date): string {
  const hours24 = date.getHours();
  let period = "ព្រឹក";
  if (hours24 >= 12 && hours24 < 17) {
    period = "រសៀល";
  } else if (hours24 >= 17) {
    period = "ល្ងាច";
  }
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `ម៉ោង ${toKhmerDigits(hours12)}:${toKhmerDigits(minutes)} ${period}`;
}

/**
 * Format date & time localized to Khmer or English
 */
export function formatDateTime(
  dateInput: number | Date,
  locale: string = "km",
  style: "full" | "medium" | "short" = "medium"
): string {
  const date = typeof dateInput === "number" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "";

  if (locale === "km") {
    const weekday = style === "full" ? KHMER_WEEKDAYS_FULL[date.getDay()] : KHMER_WEEKDAYS_SHORT[date.getDay()];
    const day = toKhmerDigits(date.getDate());
    const month = KHMER_MONTHS[date.getMonth()];
    const year = toKhmerDigits(date.getFullYear());
    const time = formatKhmerTime(date);

    if (style === "full") {
      return `${weekday} ទី${day} ខែ${month} ឆ្នាំ${year} វេលា${time}`;
    }
    return `${weekday}, ${day} ${month} ${year} វេលា${time}`;
  }

  // English format
  if (style === "full") {
    const datePart = date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const timePart = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${datePart} at ${timePart}`;
  }

  const datePart = date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const timePart = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${datePart} at ${timePart}`;
}

/**
 * Format relative time (short format):
 * "today", "yesterday", "30 min ago", "1 hour ago", "2 days ago", "3 weeks ago", "1 month ago", etc.
 */
export function formatRelativeTime(
  dateInput: number | Date,
  locale: string = "km",
  baseDate: number | Date = Date.now()
): string {
  const date = typeof dateInput === "number" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "";

  const now = typeof baseDate === "number" ? baseDate : baseDate.getTime();
  const target = date.getTime();
  const diffMs = now - target;
  const isKm = locale === "km";

  // Future timestamp
  if (diffMs < 0) {
    return formatDateTime(date, locale, "medium");
  }

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.max(1, Math.round(diffDay / 7));
  const diffMonth = Math.max(1, Math.round(diffDay / 30.4375));
  const diffYear = Math.max(1, Math.round(diffDay / 365.25));

  const nowDate = new Date(now);
  const isSameDay =
    nowDate.getFullYear() === date.getFullYear() &&
    nowDate.getMonth() === date.getMonth() &&
    nowDate.getDate() === date.getDate();

  const yesterdayDate = new Date(now - 86400000);
  const isYesterday =
    yesterdayDate.getFullYear() === date.getFullYear() &&
    yesterdayDate.getMonth() === date.getMonth() &&
    yesterdayDate.getDate() === date.getDate();

  // Under 45 seconds
  if (diffSec < 45) {
    return isKm ? "អម្បាញ់មិញ" : "just now";
  }

  // Under 60 minutes: e.g. "30 min ago" / "៣០ នាទីមុន"
  if (diffMin < 60) {
    if (diffMin <= 1) {
      return isKm ? "១ នាទីមុន" : "1 min ago";
    }
    return isKm
      ? `${toKhmerDigits(diffMin)} នាទីមុន`
      : `${diffMin} min ago`;
  }

  // Within today:
  // For recent hours (1-11 hrs): "1 hour ago", "X hours ago"
  // For older same-day: "today" / "ថ្ងៃនេះ"
  if (diffHour < 24 && isSameDay) {
    if (diffHour <= 1) {
      return isKm ? "១ ម៉ោងមុន" : "1 hour ago";
    }
    if (diffHour < 12) {
      return isKm
        ? `${toKhmerDigits(diffHour)} ម៉ោងមុន`
        : `${diffHour} hours ago`;
    }
    return isKm ? "ថ្ងៃនេះ" : "today";
  }

  // Yesterday
  if (isYesterday || diffDay === 1) {
    return isKm ? "ម្សិលមិញ" : "yesterday";
  }

  // 2 to 6 days ago: e.g. "2 days ago" / "២ ថ្ងៃមុន"
  if (diffDay < 7) {
    return isKm
      ? `${toKhmerDigits(diffDay)} ថ្ងៃមុន`
      : `${diffDay} days ago`;
  }

  // 1 to 4 weeks ago: e.g. "3 weeks ago" / "៣ សប្តាហ៍មុន"
  if (diffDay < 30) {
    if (diffWeek <= 1) {
      return isKm ? "១ សប្តាហ៍មុន" : "1 week ago";
    }
    return isKm
      ? `${toKhmerDigits(diffWeek)} សប្តាហ៍មុន`
      : `${diffWeek} weeks ago`;
  }

  // 1 to 11 months ago: e.g. "1 month ago" / "១ ខែមុន"
  if (diffDay < 365) {
    if (diffMonth <= 1) {
      return isKm ? "១ ខែមុន" : "1 month ago";
    }
    return isKm
      ? `${toKhmerDigits(diffMonth)} ខែមុន`
      : `${diffMonth} months ago`;
  }

  // 1+ years ago: e.g. "1 year ago" / "១ ឆ្នាំមុន"
  if (diffYear <= 1) {
    return isKm ? "១ ឆ្នាំមុន" : "1 year ago";
  }
  return isKm
    ? `${toKhmerDigits(diffYear)} ឆ្នាំមុន`
    : `${diffYear} years ago`;
}
