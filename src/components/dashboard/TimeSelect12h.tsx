"use client";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = ["00", "15", "30", "45"];
type Period = "AM" | "PM";

function parseTime12h(value: string) {
  const match = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return { hour: 6, minute: "00", period: "PM" as Period };
  return {
    hour: Number(match[1]),
    minute: match[2],
    period: match[3].toUpperCase() as Period,
  };
}

export function TimeSelect12h({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { hour, minute, period } = parseTime12h(value);
  const selectClassName = "rounded-lg border border-gold/40 px-2 py-1.5";

  function update(next: Partial<{ hour: number; minute: string; period: Period }>) {
    const h = next.hour ?? hour;
    const m = next.minute ?? minute;
    const p = next.period ?? period;
    onChange(`${h}:${m} ${p}`);
  }

  return (
    <div className="flex gap-2">
      <select
        value={hour}
        onChange={(e) => update({ hour: Number(e.target.value) })}
        className={selectClassName}
      >
        {HOURS.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
      <select
        value={minute}
        onChange={(e) => update({ minute: e.target.value })}
        className={selectClassName}
      >
        {MINUTES.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <select
        value={period}
        onChange={(e) => update({ period: e.target.value as Period })}
        className={selectClassName}
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
}
