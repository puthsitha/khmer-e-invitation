"use client";

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
    <div className="fixed inset-x-0 top-4 z-50 grid grid-cols-3 items-center px-4">
      <div />
      <div className="justify-self-center">
        <ViewerLocaleSwitcher locale={locale} onChange={onChangeLocale} />
      </div>
      <div className="justify-self-end">
        {hasMusic && (
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? "Unmute background music" : "Mute background music"}
            className="flex items-center gap-2 rounded-full border border-gold/40 bg-cream/95 px-3 py-1.5 text-xs uppercase tracking-widest text-maroon shadow-md backdrop-blur-sm"
          >
            <span aria-hidden>{muted ? "🔇" : "🔊"}</span>
            {muted ? "Off" : "On"}
          </button>
        )}
      </div>
    </div>
  );
}
