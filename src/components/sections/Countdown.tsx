"use client";

import { useTranslations } from "next-intl";
import { SectionShell } from "@/components/viewer/SectionShell";
import { useCountdown } from "@/hooks/useCountdown";
import type { Invitation } from "@/types";

export function Countdown({ invitation }: { invitation: Invitation }) {
  const t = useTranslations("viewer");
  const { days, hours, minutes, seconds } = useCountdown(invitation.eventDate);

  const units: [number, string][] = [
    [days, t("days")],
    [hours, t("hours")],
    [minutes, t("minutes")],
    [seconds, t("seconds")],
  ];

  return (
    <SectionShell className="bg-maroon text-cream">
      <p className="text-sm uppercase tracking-widest text-gold">
        {t("countdownTitle")}
      </p>
      <div className="flex gap-4 sm:gap-8">
        {units.map(([value, label]) => (
          <div key={label} className="flex flex-col items-center">
            <span className="font-[family-name:var(--font-heading-km)] text-4xl text-gold sm:text-6xl">
              {String(value).padStart(2, "0")}
            </span>
            <span className="text-xs uppercase tracking-widest text-cream/70">
              {label}
            </span>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
