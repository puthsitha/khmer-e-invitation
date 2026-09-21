"use client";

import { Clock, ChevronDown } from "lucide-react";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];
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

  function update(next: Partial<{ hour: number; minute: string; period: Period }>) {
    const h = next.hour ?? hour;
    const m = next.minute ?? minute;
    const p = next.period ?? period;
    onChange(`${h}:${m} ${p}`);
  }

  const selectContainerClass =
    "relative flex items-center rounded-xl border border-gold/40 bg-white shadow-xs transition-all hover:border-gold/70 focus-within:border-maroon focus-within:ring-2 focus-within:ring-maroon/15";
  const selectClass =
    "appearance-none bg-transparent py-2 pl-3 pr-7 text-sm font-medium text-maroon outline-none cursor-pointer";
  const chevronClass =
    "pointer-events-none absolute right-2 text-maroon/40";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/15 text-maroon">
        <Clock className="h-4 w-4 text-maroon/80" />
      </span>

      {/* Hour */}
      <div className={selectContainerClass}>
        <select
          value={hour}
          onChange={(e) => update({ hour: Number(e.target.value) })}
          className={selectClass}
        >
          {HOURS.map((h) => (
            <option key={h} value={h}>
              {h.toString().padStart(2, "0")}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className={chevronClass} />
      </div>

      <span className="text-maroon/60 font-bold">:</span>

      {/* Minute */}
      <div className={selectContainerClass}>
        <select
          value={minute}
          onChange={(e) => update({ minute: e.target.value })}
          className={selectClass}
        >
          {MINUTES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className={chevronClass} />
      </div>

      {/* Period (AM/PM) */}
      <div className={selectContainerClass}>
        <select
          value={period}
          onChange={(e) => update({ period: e.target.value as Period })}
          className={selectClass}
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
        <ChevronDown size={14} className={chevronClass} />
      </div>
    </div>
  );
}

