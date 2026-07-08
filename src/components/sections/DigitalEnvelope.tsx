"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { SectionShell } from "@/components/viewer/SectionShell";
import type { Invitation } from "@/types";

export function DigitalEnvelope({ invitation }: { invitation: Invitation }) {
  const t = useTranslations("viewer");
  const qrUrl = invitation.mediaUrls.digitalEnvelopeQr;

  if (!qrUrl) return null;

  return (
    <SectionShell className="bg-maroon text-cream">
      <p className="text-sm uppercase tracking-widest text-gold">
        {t("digitalEnvelopeTitle")}
      </p>
      <div className="relative h-48 w-48 overflow-hidden rounded-xl bg-cream">
        <Image src={qrUrl} alt="" fill sizes="192px" className="object-contain" />
      </div>
      <p className="text-sm text-cream/80">{t("digitalEnvelopeNote")}</p>
    </SectionShell>
  );
}
