"use client";

import { useTranslations } from "next-intl";
import { SectionShell } from "@/components/viewer/SectionShell";
import { QrCode } from "@/components/ui/QrCode";
import type { Invitation } from "@/types";

export function Direction({ invitation }: { invitation: Invitation }) {
  const t = useTranslations("viewer");
  const mapUrl = invitation.content.mapUrl;

  if (!mapUrl) return null;

  return (
    <SectionShell className="bg-cream text-maroon">
      <p className="text-sm uppercase tracking-widest text-gold">
        {t("directionTitle")}
      </p>
      <a
        href={mapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full bg-maroon px-6 py-2 text-cream"
      >
        {t("openInMaps")}
      </a>
      <QrCode value={mapUrl} size={160} />
    </SectionShell>
  );
}
