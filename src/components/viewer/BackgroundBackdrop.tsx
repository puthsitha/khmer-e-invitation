"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AmbientSparks } from "@/components/ui/AmbientSparks";

/**
 * Fixed, heavily blurred full-viewport photo/video that stays in place behind
 * the whole scrolling experience, so every section reads as a frosted-glass
 * card floating over one continuous backdrop rather than a stack of flat
 * blocks. Prefers the cover video embed, falls back to the first gallery
 * photo, falls back to a plain cream background.
 */
export function BackgroundBackdrop({
  embedUrl,
  imageUrl,
}: {
  embedUrl?: string | null;
  imageUrl?: string;
}) {
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!embedUrl) return;

    // Mobile browsers pause background iframes when the tab loses
    // visibility. On return, the embedded player shows its own "tap to
    // resume" overlay (briefly, in the center) rather than silently
    // resuming, since pointer-events-none only blocks our page from
    // forwarding clicks into the iframe — it can't stop the iframe's own
    // internal UI. Force a fresh iframe load instead, which autoplays
    // cleanly with no resume prompt.
    function handleVisibility() {
      if (document.visibilityState === "visible") {
        setReloadKey((key) => key + 1);
      }
    }

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [embedUrl]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-cream">
      {embedUrl ? (
        <iframe
          key={reloadKey}
          src={embedUrl}
          title="Cover video"
          allow="autoplay; encrypted-media"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[100vh] min-h-[56.25vw] w-[177.78vh] min-w-[100vw] -translate-x-1/2 -translate-y-1/2 scale-110 blur-[2px]"
        />
      ) : imageUrl ? (
        <Image
          src={imageUrl}
          alt=""
          fill
          sizes="100vw"
          priority
          className="scale-105 object-cover blur-[2px]"
        />
      ) : null}
      <div className="absolute inset-0 bg-cream/35" />
      <AmbientSparks />
    </div>
  );
}
