"use client";

import { useLocale, useTranslations } from "next-intl";
import { SectionShell } from "@/components/viewer/SectionShell";
import { SectionHeading } from "@/components/viewer/SectionHeading";
import { bodyFontStyle } from "@/lib/fonts";
import { pickBilingual } from "@/lib/bilingual";
import type { Invitation } from "@/types";

export function Direction({ invitation }: { invitation: Invitation }) {
  const t = useTranslations("viewer");
  const locale = useLocale();
  const mapUrl = invitation.content.mapUrl;
  const address = pickBilingual(invitation.content.address, locale);

  if (!mapUrl && !address) return null;

  const embedSrc = mapUrl
    ? `https://maps.google.com/maps?q=${encodeURIComponent(mapUrl)}&output=embed`
    : null;

  return (
    <SectionShell className="text-maroon">
      <SectionHeading icon="📍">{t("directionTitle")}</SectionHeading>

      {address && (
        <p
          className="max-w-md leading-relaxed text-maroon/90"
          style={bodyFontStyle(locale)}
        >
          {address}
        </p>
      )}

      {embedSrc && (
        <div className="h-64 w-full max-w-xl overflow-hidden rounded-2xl shadow-lg">
          <iframe
            src={embedSrc}
            title="Map"
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}

      {mapUrl && (
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-gold px-6 py-2 text-sm uppercase tracking-widest text-cream shadow-md"
        >
          {t("openInMaps")}
        </a>
      )}
    </SectionShell>
  );
}
