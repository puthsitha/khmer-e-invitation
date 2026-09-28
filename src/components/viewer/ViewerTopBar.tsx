"use client";

import { Volume2, VolumeX } from "lucide-react";
import { ViewerLocaleSwitcher } from "@/components/viewer/ViewerLocaleSwitcher";

export function ViewerTopBar({
  locale,
  onChangeLocale,
  hasMusic,
  muted,
  onToggleMute,
}: {
  locale: "km" | "en";
  onChangeLocale: (locale: "km" | "en") => void;
  hasMusic: boolean;
  muted: boolean;
  onToggleMute: () => void;
}) {
  return (
    <div className="fixed inset-x-0 top-3 sm:top-4 z-50 flex items-center justify-between px-3 sm:px-4 pt-[env(safe-area-inset-top,0px)] pointer-events-none max-w-full w-full">
      <div className="w-16 shrink-0 sm:w-24" />
      <div className="pointer-events-auto">
        <ViewerLocaleSwitcher locale={locale} onChange={onChangeLocale} />
      </div>
      <div className="flex w-16 shrink-0 justify-end sm:w-24 pointer-events-auto">
        {hasMusic && (
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={
              muted ? "Unmute background music" : "Mute background music"
            }
            className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-gold/40 bg-cream/90 px-2.5 sm:px-3 py-1.5 text-xs uppercase tracking-widest text-maroon shadow-md backdrop-blur-md transition-transform hover:scale-105"
          >
            {muted ? (
              <VolumeX className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
            ) : (
              <Volume2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
            )}
            <span className="text-[11px] sm:text-xs">{muted ? "Off" : "On"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
