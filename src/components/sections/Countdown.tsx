"use client";

import { useLocale, useTranslations } from "next-intl";
import { SectionShell } from "@/components/viewer/SectionShell";
import { bodyFontStyle } from "@/lib/fonts";
import { useCountdown } from "@/hooks/useCountdown";
import type { Invitation } from "@/types";

export function Countdown({ invitation }: { invitation: Invitation }) {
  const t = useTranslations("viewer");
  const locale = useLocale();
  const { days, hours, minutes, seconds } = useCountdown(invitation.eventDate);

  const units: [number, string][] = [
    [days, t("days")],
    [hours, t("hours")],
    [minutes, t("minutes")],
    [seconds, t("seconds")],
  ];

  return (
    <SectionShell className="text-maroon">
      <p className="text-lg text-maroon/90" style={bodyFontStyle(locale)}>
        {t("countdownTitle")}
      </p>
      <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
        {units.map(([value, label]) => (
          <div
            key={label}
            className="flex w-20 flex-col items-center gap-1 rounded-2xl bg-cream/75 py-4 shadow-lg backdrop-blur-md sm:w-24"
          >
            <span className="font-[family-name:var(--font-heading-en)] text-3xl text-gold sm:text-4xl">
              {String(value).padStart(2, "0")}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-maroon/70">
              {label}
            </span>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
