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
      <SectionHeading icon={<Gift className="h-4 w-4" />} dividerVariant={1}>
        {t("digitalEnvelopeTitle")}
      </SectionHeading>
      <div className="ultra-thin-material relative flex items-center justify-center p-4 rounded-2xl sm:rounded-3xl shadow-2xl">
        <div className="relative h-60 w-60 overflow-hidden rounded-xl sm:h-72 sm:w-72">
          <Image
            src={qrUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 240px, 288px"
            className="object-contain"
          />
        </div>
      </div>
      <p className="text-glow text-maroon/80" style={bodyFontStyle(locale)}>
        {t("digitalEnvelopeNote")}
      </p>
    </SectionShell>
  );
}
