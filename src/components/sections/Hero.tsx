"use client";

import { useTranslations } from "next-intl";
import { SectionShell } from "@/components/viewer/SectionShell";
import { toBackgroundEmbedUrl } from "@/lib/embed";
import type { Invitation } from "@/types";

export function Hero({ invitation }: { invitation: Invitation }) {
  const t = useTranslations("viewer");
  const embedUrl = invitation.coverVideoEmbedUrl
    ? toBackgroundEmbedUrl(invitation.coverVideoEmbedUrl)
    : null;
  const names = [invitation.content.groomName, invitation.content.brideName]
    .filter(Boolean)
    .join(" & ");

  return (
    <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-maroon text-cream">
      <div className="absolute inset-0">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title="Cover video"
            allow="autoplay; encrypted-media"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[130vh] w-[130vw] -translate-x-1/2 -translate-y-1/2"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-maroon via-maroon/90 to-black" />
        )}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <SectionShell className="relative z-10 min-h-0 py-0 text-cream">
        <p className="font-[family-name:var(--font-body-km)] text-sm uppercase tracking-[0.3em] text-gold">
          {t("weddingCeremony")}
        </p>
        <h1 className="font-[family-name:var(--font-heading-km)] text-4xl sm:text-6xl">
          {names}
        </h1>
      </SectionShell>
    </section>
  );
}
