"use client";

import { useEffect, useState } from "react";
import { MapPin, ExternalLink, AlertCircle, Loader2 } from "lucide-react";
import {
  parseGoogleMapsDetails,
  isShortGoogleMapsUrl,
  ParsedMapDetails,
} from "@/lib/mapUrl";

interface VenueMapPreviewProps {
  mapUrl?: string | null;
  locale?: string;
}

export function VenueMapPreview({
  mapUrl,
  locale = "km",
}: VenueMapPreviewProps) {
  const [resolvedDetails, setResolvedDetails] = useState<ParsedMapDetails | null>(
    null,
  );
  const [isResolving, setIsResolving] = useState(false);
  const [resolveFailed, setResolveFailed] = useState(false);

  useEffect(() => {
    const trimmed = mapUrl?.trim();
    if (!trimmed) {
      setResolvedDetails(null);
      setIsResolving(false);
      setResolveFailed(false);
      return;
    }

    // 1. Try synchronous coordinate/embed extraction from the map URL
    const sync = parseGoogleMapsDetails(trimmed, null, locale);
    if (sync?.lat && sync?.lng) {
      setResolvedDetails(sync);
      setIsResolving(false);
      setResolveFailed(false);
      return;
    }

    // 2. If short URL or coords not directly in URL, resolve via server endpoint
    let cancelled = false;
    setIsResolving(true);
    setResolveFailed(false);

    fetch(`/api/resolve-map?url=${encodeURIComponent(trimmed)}&locale=${locale}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.details?.embedSrc) {
          setResolvedDetails(data.details);
          setResolveFailed(false);
        } else if (sync?.embedSrc) {
          // Fall back to direct sync embed if available
          setResolvedDetails(sync);
          setResolveFailed(false);
        } else {
          setResolvedDetails(null);
          setResolveFailed(true);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn("Could not resolve map URL:", err);
        if (sync?.embedSrc) {
          setResolvedDetails(sync);
          setResolveFailed(false);
        } else {
          setResolvedDetails(null);
          setResolveFailed(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsResolving(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [mapUrl, locale]);

  if (!mapUrl?.trim()) {
    return null;
  }

  // Loading state while resolving short map URL
  if (isResolving) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gold/30 dark:border-gold/20 bg-cream/30 dark:bg-white/5 shadow-2xs">
        <div className="flex items-center justify-between border-b border-gold/20 dark:border-gold/15 px-3.5 py-2 text-[11px] text-maroon/70 dark:text-[#f6eee8]/70 bg-cream/60 dark:bg-white/5">
          <span className="flex items-center gap-1.5 font-medium">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-gold" />
            <span>Resolving map location from URL…</span>
          </span>
          <a
            href={mapUrl.trim()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-semibold text-gold hover:underline"
          >
            <span>Open Link</span>
            <ExternalLink size={11} />
          </a>
        </div>
        <div className="flex h-44 w-full flex-col items-center justify-center gap-2 bg-gold/5 dark:bg-black/20 text-xs text-maroon/50 dark:text-[#f6eee8]/50">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gold/30 border-t-maroon dark:border-t-gold" />
          <span>Loading map from URL…</span>
        </div>
      </div>
    );
  }

  // If successfully resolved into an embed iframe
  if (resolvedDetails?.embedSrc) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gold/30 dark:border-gold/20 bg-cream/30 dark:bg-white/5 shadow-2xs">
        <div className="flex items-center justify-between border-b border-gold/20 dark:border-gold/15 px-3.5 py-2 text-[11px] text-maroon/70 dark:text-[#f6eee8]/70 bg-cream/60 dark:bg-white/5">
          <span className="flex items-center gap-1.5 font-medium">
            <MapPin className="h-3.5 w-3.5 text-gold shrink-0" />
            <span className="truncate max-w-[280px] sm:max-w-md">
              {resolvedDetails.lat && resolvedDetails.lng
                ? `Coordinates: ${resolvedDetails.lat.toFixed(5)}, ${resolvedDetails.lng.toFixed(5)}`
                : resolvedDetails.query
                  ? `Location: ${resolvedDetails.query}`
                  : "Map Location (from URL)"}
            </span>
          </span>
          <a
            href={mapUrl.trim()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-semibold text-gold hover:underline shrink-0"
          >
            <span>Open Link</span>
            <ExternalLink size={11} />
          </a>
        </div>
        <div className="relative h-44 w-full">
          <iframe
            src={resolvedDetails.embedSrc}
            title="Venue Map Preview"
            className="h-full w-full border-0"
            loading="lazy"
          />
        </div>
      </div>
    );
  }

  // Failed to parse or embed the URL
  if (resolveFailed) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-amber-300/60 dark:border-amber-600/30 bg-amber-50/50 dark:bg-amber-950/20 p-3 text-xs text-amber-800 dark:text-amber-300">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>Could not extract map coordinates from this URL.</span>
        </div>
        <a
          href={mapUrl.trim()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 font-semibold text-gold hover:underline shrink-0 ml-2"
        >
          <span>Test Link</span>
          <ExternalLink size={11} />
        </a>
      </div>
    );
  }

  return null;
}
