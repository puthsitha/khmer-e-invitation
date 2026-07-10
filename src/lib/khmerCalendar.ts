const KHMER_DIGITS = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];

/** Converts an integer's Arabic digits to Khmer numerals. */
export function toKhmerNumeral(value: number): string {
  return String(value)
    .split("")
    .map((char) => (char >= "0" && char <= "9" ? KHMER_DIGITS[Number(char)] : char))
    .join("");
}

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

const EN_MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

/** Short weekday labels, Sunday first. */
const KHMER_WEEKDAYS = ["អា", "ច", "អ", "ព", "ព្រ", "សុ", "ស"];
const EN_WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export function monthLabel(year: number, month: number, locale: string): string {
  return locale === "km"
    ? `${KHMER_MONTHS[month]} ${toKhmerNumeral(year)}`
    : `${EN_MONTHS[month]} ${year}`;
}

export function weekdayLabels(locale: string): string[] {
  return locale === "km" ? KHMER_WEEKDAYS : EN_WEEKDAYS;
}

export function dayLabel(day: number, locale: string): string {
  return locale === "km" ? toKhmerNumeral(day) : String(day);
}

/** Grid of day-of-month numbers for a calendar month view, Sunday-first,
 * with `null` placeholders for the leading blanks before the 1st. */
export function monthGrid(year: number, month: number): (number | null)[] {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(firstWeekday).fill(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(day);
  return cells;
}
