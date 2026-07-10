"use client";

import { useLocale, useTranslations } from "next-intl";
import { SectionShell } from "@/components/viewer/SectionShell";
import { OrnamentDivider } from "@/components/ui/OrnamentDivider";
import { bodyFontStyle, scriptFontStyle } from "@/lib/fonts";
import { pickBilingual } from "@/lib/bilingual";
import { formatKhmerDate } from "@/lib/khmerDate";
import type { Invitation } from "@/types";

export function Closing({ invitation }: { invitation: Invitation }) {
  const t = useTranslations("viewer");
  const locale = useLocale();
  const names = [
    pickBilingual(invitation.content.groomName, locale),
    pickBilingual(invitation.content.brideName, locale),
  ]
    .filter(Boolean)
    .join(locale === "km" ? " និង " : " & ");
  const eventDate = new Date(invitation.eventDate);
  const date =
    locale === "km"
      ? formatKhmerDate(eventDate)
      : eventDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

  return (
    <SectionShell className="text-maroon">
      <OrnamentDivider />
      <h2 className="text-glow text-3xl text-maroon" style={scriptFontStyle(locale)}>
        {names}
      </h2>
      <p className="text-glow" style={bodyFontStyle(locale)}>
        {date}
      </p>
      <OrnamentDivider mirrored />
      <p className="text-glow text-sm text-maroon/70" style={bodyFontStyle(locale)}>
        {t("closingSignoff")}
      </p>
    </SectionShell>
  );
}
