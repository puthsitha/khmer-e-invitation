"use client";

import { useLocale, useTranslations } from "next-intl";
import { SectionShell } from "@/components/viewer/SectionShell";
import { GlassCard } from "@/components/viewer/GlassCard";
import { SectionHeading } from "@/components/viewer/SectionHeading";
import { bodyFontStyle } from "@/lib/fonts";

export function GratitudeApology() {
  const t = useTranslations("viewer");
  const locale = useLocale();

  return (
    <SectionShell className="text-maroon">
      <GlassCard>
        <SectionHeading icon="🎀">{t("gratitudeTitle")}</SectionHeading>
        <p className="leading-relaxed text-maroon/90" style={bodyFontStyle(locale)}>
          {t("gratitudeText")}
        </p>
      </GlassCard>
    </SectionShell>
  );
}
