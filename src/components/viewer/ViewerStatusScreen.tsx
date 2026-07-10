"use client";

import type { ReactNode } from "react";
import { useLocale } from "next-intl";
import { OrnamentDivider } from "@/components/ui/OrnamentDivider";
import { bodyFontStyle } from "@/lib/fonts";

/** Full-screen loading/error state, styled to match the invitation's own
 * ornamental Khmer-gold look rather than a bare system message. */
export function ViewerStatusScreen({
  icon,
  message,
}: {
  icon: ReactNode;
  message: string;
}) {
  const locale = useLocale();

  return (
    <main className="paper-texture flex min-h-screen flex-col items-center justify-center gap-6 bg-cream px-6 text-center text-maroon">
      <div
        className="image-glow flex h-20 w-20 items-center justify-center rounded-full text-cream shadow-lg"
        style={{
          background:
            "radial-gradient(circle at 35% 30%, var(--color-gold-light), var(--color-gold))",
        }}
      >
        {icon}
      </div>
      <OrnamentDivider priority />
      <p className="text-glow max-w-xs text-lg" style={bodyFontStyle(locale)}>
        {message}
      </p>
    </main>
  );
}
