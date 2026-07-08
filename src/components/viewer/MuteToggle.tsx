"use client";

export function MuteToggle({
  muted,
  onToggle,
}: {
  muted: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={muted ? "Unmute background music" : "Mute background music"}
      className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-gold/60 bg-cream/90 text-maroon shadow-lg backdrop-blur"
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
}
