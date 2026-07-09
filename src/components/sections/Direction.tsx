"use client";

import { useLocale, useTranslations } from "next-intl";
import { SectionShell } from "@/components/viewer/SectionShell";
import { QrCode } from "@/components/ui/QrCode";
import { pickBilingual } from "@/lib/bilingual";
import type { Invitation } from "@/types";

export function Direction({ invitation }: { invitation: Invitation }) {
  const t = useTranslations("viewer");
  const locale = useLocale();
  const mapUrl = invitation.content.mapUrl;
  const address = pickBilingual(invitation.content.address, locale);

  if (!mapUrl && !address) return null;

  return (
    <SectionShell className="bg-cream text-maroon">
      <p className="text-sm uppercase tracking-widest text-gold">
        {t("directionTitle")}
      </p>
      {address && (
        <p className="max-w-md font-[family-name:var(--font-body-km)] leading-relaxed">
          {address}
        </p>
      )}
      {mapUrl && (
        <>
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-maroon px-6 py-2 text-cream"
          >
            {t("openInMaps")}
          </a>
          <QrCode value={mapUrl} size={160} />
        </>
      )}
    </SectionShell>
  );
}
