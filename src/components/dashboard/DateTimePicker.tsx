"use client";

import { useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Calendar, CalendarDays } from "lucide-react";
import { TimeSelect12h } from "./TimeSelect12h";
import { formatDateTime } from "@/lib/khmerDate";

interface DateTimePickerProps {
  value: number;
  onChange: (timestamp: number) => void;
  label?: string;
}

export function DateTimePicker({
  value,
  onChange,
  label,
}: DateTimePickerProps) {
  const t = useTranslations("dashboard.editor.dateTimePicker");
  const locale = useLocale();

  // Convert timestamp to local date strings
  const { dateStr, timeStr, formattedPreview } = useMemo(() => {
    const d = new Date(value);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    let hours = d.getHours();
    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const timeStr = `${hours}:${minutes} ${period}`;

    const formattedPreview = formatDateTime(value, locale, "medium");

    return { dateStr, timeStr, formattedPreview };
  }, [value, locale]);

  function handleDateChange(newDateStr: string) {
    if (!newDateStr) return;
    const [y, m, d] = newDateStr.split("-").map(Number);
    const date = new Date(value);
    date.setFullYear(y, m - 1, d);
    onChange(date.getTime());
  }

  function handleTimeChange(newTimeStr: string) {
    const match = newTimeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return;

    let hours = Number(match[1]);
    const minutes = Number(match[2]);
    const period = match[3].toUpperCase();

    if (period === "PM" && hours < 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    const date = new Date(value);
    date.setHours(hours, minutes, 0, 0);
    onChange(date.getTime());
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gold/30 bg-cream/30 p-4 sm:p-5">
      {/* Label and formatted human-friendly preview badge */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold/20 text-maroon">
            <CalendarDays className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold text-maroon">
            {label || t("dateLabel")}
          </span>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-white/90 px-3 py-1 text-xs font-semibold text-maroon shadow-xs">
          <Calendar className="h-3 w-3 text-gold" />
          <span>{formattedPreview}</span>
        </span>
      </div>

      {/* Date & Time Selectors */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Date Input */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-maroon/70">
            {t("dateLabel")}
          </span>
          <div className="relative flex items-center">
            <input
              type="date"
              value={dateStr}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full rounded-xl border border-gold/40 bg-white px-3.5 py-2.5 text-sm font-medium text-maroon shadow-xs outline-none transition-all hover:border-gold/70 focus:border-maroon focus:ring-2 focus:ring-maroon/15 cursor-pointer"
            />
          </div>
        </div>

        {/* Time Selector */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-maroon/70">
            {t("timeLabel")}
          </span>
          <TimeSelect12h
            value={timeStr}
            onChange={handleTimeChange}
          />
        </div>
      </div>
    </div>
  );
}
