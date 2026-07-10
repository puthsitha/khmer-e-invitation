"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { PALETTE_SWATCHES } from "@/lib/palettes";
import type { Invitation } from "@/types";

export function ColorPaletteAccent({ invitation }: { invitation: Invitation }) {
  const t = useTranslations("viewer");
  const reduceMotion = useReducedMotion();
  const swatches =
    PALETTE_SWATCHES[invitation.colorPalette as keyof typeof PALETTE_SWATCHES] ??
    PALETTE_SWATCHES["royal-gold"];

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
            whileInView={
              reduceMotion
                ? { opacity: 1, scale: 1 }
                : { opacity: 1, scale: [0.7, 1.2, 0.7] }
            }
            viewport={{ once: true }}
            transition={
              reduceMotion
                ? { duration: 0.6, delay: index * 0.15, ease: "easeOut" }
                : {
                    opacity: { duration: 0.4, delay: index * 0.15 },
                    scale: {
                      duration: 1.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.2,
                    },
                  }
            }
            className="h-12 w-12 rounded-full shadow-lg ring-2 ring-cream/80 sm:h-16 sm:w-16"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  );
}
