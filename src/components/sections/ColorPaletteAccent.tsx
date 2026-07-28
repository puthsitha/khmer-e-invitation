"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { getPalette } from "@/lib/firebase/firestore";
import type { Invitation, Palette } from "@/types";

export function ColorPaletteAccent({ invitation }: { invitation: Invitation }) {
  const t = useTranslations("viewer");
  const [palette, setPalette] = useState<Palette | null>(null);

  useEffect(() => {
    let cancelled = false;
    getPalette(invitation.colorPalette).then((p) => {
      if (!cancelled) setPalette(p);
    });
    return () => {
      cancelled = true;
    };
  }, [invitation.colorPalette]);

  if (!palette) return null;
  const swatches = [palette.gold, palette.maroon, palette.cream];

  return (
    <div className="flex w-full flex-col items-center gap-4 py-8">
      <p className="text-glow text-xs uppercase tracking-[0.25em] text-maroon/70">
        {t("colorPaletteTitle")}
      </p>
      <div className="flex flex-wrap justify-center gap-5 sm:gap-6">
        {swatches.map((color, index) => (
          <motion.span
            key={color}
            initial={{ opacity: 0, scale: 0.6 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
            className="h-12 w-12 rounded-full shadow-lg ring-2 ring-cream/80 sm:h-16 sm:w-16"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  );
}
