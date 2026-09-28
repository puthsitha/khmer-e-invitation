"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { MapPin, Navigation } from "lucide-react";
import { SectionShell } from "@/components/viewer/SectionShell";
import { SectionHeading } from "@/components/viewer/SectionHeading";
import { bodyFontStyle } from "@/lib/fonts";
import { pickBilingual } from "@/lib/bilingual";
import {
  parseGoogleMapsDetails,
  getDirectionsUrl,
  isShortGoogleMapsUrl,
} from "@/lib/mapUrl";
import type { Invitation } from "@/types";

export function Direction({ invitation }: { invitation: Invitation }) {
  const t = useTranslations("viewer");
  const locale = useLocale();
  const mapUrl = invitation.content.mapUrl;
  const address = pickBilingual(invitation.content.address, locale);

  // Synchronously parse map details (handles coords, place names, direct embeds, address fallback)
  const initialDetails = useMemo(
    () => parseGoogleMapsDetails(mapUrl, address, locale),
    [mapUrl, address, locale],
  );

  const [resolvedEmbedSrc, setResolvedEmbedSrc] = useState<string | null>(null);

  // If mapUrl is a short link (maps.app.goo.gl or goo.gl/maps), resolve final redirected URL to get exact pin coordinates
  useEffect(() => {
    if (!mapUrl || !isShortGoogleMapsUrl(mapUrl)) {
      return;
    }

    let cancelled = false;
    const apiUrl = `/api/resolve-map?url=${encodeURIComponent(
      mapUrl,
    )}&address=${encodeURIComponent(address || "")}&locale=${locale}`;

    fetch(apiUrl)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.details?.embedSrc) {
          setResolvedEmbedSrc(data.details.embedSrc);
        }
      })
      .catch((err) => {
        console.warn("Could not resolve short map URL:", err);
      });

    return () => {
      cancelled = true;
    };
  }, [mapUrl, address, locale]);

  if (!mapUrl && !address) return null;

  const embedSrc = resolvedEmbedSrc || initialDetails?.embedSrc || null;
  const directionsUrl = getDirectionsUrl(mapUrl, address);

  return (
    <SectionShell className="text-maroon">
      <SectionHeading icon={<MapPin className="h-4 w-4" />} dividerVariant={4}>
        {t("directionTitle")}
      </SectionHeading>

      {address && (
        <p
          className="text-glow max-w-md leading-relaxed text-maroon/90"
          style={bodyFontStyle(locale)}
        >
          {address}
        </p>
      )}

      {embedSrc && (
        <div className="h-64 sm:h-72 w-full max-w-xl overflow-hidden rounded-2xl sm:rounded-3xl border border-gold/40 shadow-lg bg-cream/50">
          <iframe
            src={embedSrc}
            title="Venue Location Map"
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}

      {directionsUrl && (
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-widest text-cream shadow-md transition-all hover:bg-gold/90 hover:scale-105 hover:shadow-lg cursor-pointer"
        >
          <Navigation className="h-3.5 w-3.5" />
          <span>{t("openInMaps")}</span>
        </a>
      )}
    </SectionShell>
  );
}
