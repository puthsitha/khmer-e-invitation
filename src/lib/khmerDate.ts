const KHMER_WEEKDAYS = [
  "ថ្ងៃអាទិត្យ",
  "ថ្ងៃច័ន្ទ",
  "ថ្ងៃអង្គារ",
  "ថ្ងៃពុធ",
  "ថ្ងៃព្រហស្បតិ៍",
  "ថ្ងៃសុក្រ",
  "ថ្ងៃសៅរ៍",
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
  const weekday = KHMER_WEEKDAYS[date.getDay()];
  const month = KHMER_MONTHS[date.getMonth()];
  return `${weekday} ទី${toKhmerDigits(date.getDate())} ខែ${month} ឆ្នាំ${toKhmerDigits(date.getFullYear())}`;
}

export function formatKhmerTime(date: Date): string {
  const hours24 = date.getHours();
  const period = hours24 < 12 ? "ព្រឹក" : "ល្ងាច";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `ម៉ោង ${toKhmerDigits(hours12)}:${toKhmerDigits(minutes)} ${period}`;
}
