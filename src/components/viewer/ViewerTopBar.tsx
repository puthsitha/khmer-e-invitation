"use client";

import { LocaleSwitcher } from "@/components/ui/LocaleSwitcher";

export function ViewerTopBar({
  hasMusic,
  muted,
  onToggleMute,
}: {
  hasMusic: boolean;
  muted: boolean;
  onToggleMute: () => void;
}) {
  return (
    <div className="fixed inset-x-0 top-4 z-50 grid grid-cols-3 items-center px-4">
      <div />
      <div className="justify-self-center shadow-md">
        <LocaleSwitcher />
      </div>
      <div className="justify-self-end">
        {hasMusic && (
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? "Unmute background music" : "Mute background music"}
            className="flex items-center gap-2 rounded-full border border-gold/40 bg-cream/80 px-3 py-1.5 text-xs uppercase tracking-widest text-maroon shadow-md backdrop-blur"
          >
            <span aria-hidden>{muted ? "🔇" : "🔊"}</span>
            {muted ? "Off" : "On"}
          </button>
        )}
      </div>
    </div>
  );
}
