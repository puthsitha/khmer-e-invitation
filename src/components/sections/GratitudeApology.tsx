"use client";

import { useLocale, useTranslations } from "next-intl";
import { Heart } from "lucide-react";
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
        <SectionHeading icon={<Heart className="h-4 w-4" />} dividerVariant={4}>
          {t("gratitudeTitle")}
        </SectionHeading>
        <p className="leading-relaxed text-maroon/90" style={bodyFontStyle(locale)}>
          {t("gratitudeText")}
        </p>
      </GlassCard>
    </SectionShell>
  );
}
