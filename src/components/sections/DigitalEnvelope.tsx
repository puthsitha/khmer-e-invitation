"use client";

import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { SectionShell } from "@/components/viewer/SectionShell";
import { SectionHeading } from "@/components/viewer/SectionHeading";
import { bodyFontStyle } from "@/lib/fonts";
import type { Invitation } from "@/types";

export function DigitalEnvelope({ invitation }: { invitation: Invitation }) {
  const t = useTranslations("viewer");
  const locale = useLocale();
  const qrUrl = invitation.mediaUrls.digitalEnvelopeQr;

  if (!qrUrl) return null;

  return (
    <SectionShell className="text-maroon">
      <SectionHeading icon="🎁">{t("digitalEnvelopeTitle")}</SectionHeading>
      <div className="relative h-48 w-48 overflow-hidden rounded-2xl bg-white p-3 shadow-lg">
        <Image src={qrUrl} alt="" fill sizes="192px" className="object-contain p-3" />
      </div>
      <p className="text-maroon/80" style={bodyFontStyle(locale)}>
        {t("digitalEnvelopeNote")}
      </p>
    </SectionShell>
  );
}
