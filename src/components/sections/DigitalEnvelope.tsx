"use client";

import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { Gift } from "lucide-react";
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
      <SectionHeading icon={<Gift className="h-4 w-4" />}>
        {t("digitalEnvelopeTitle")}
      </SectionHeading>
      <div className="relative h-64 w-64 overflow-hidden rounded-2xl sm:h-80 sm:w-80">
        <Image
          src={qrUrl}
          alt=""
          fill
          sizes="(max-width: 640px) 256px, 320px"
          className="object-contain"
        />
      </div>
      <p className="text-maroon/80" style={bodyFontStyle(locale)}>
        {t("digitalEnvelopeNote")}
      </p>
    </SectionShell>
  );
}
