"use client";

import { useTranslations } from "next-intl";
import { SectionShell } from "@/components/viewer/SectionShell";
import { OrnamentDivider } from "@/components/ui/OrnamentDivider";

export function GratitudeApology() {
  const t = useTranslations("viewer");

  return (
    <SectionShell className="bg-cream text-maroon">
      <OrnamentDivider />
      <p className="font-[family-name:var(--font-heading-km)] text-2xl">
        {t("gratitudeTitle")}
      </p>
      <p className="max-w-xl font-[family-name:var(--font-body-km)] leading-relaxed">
        {t("gratitudeText")}
      </p>
      <OrnamentDivider />
    </SectionShell>
  );
}
