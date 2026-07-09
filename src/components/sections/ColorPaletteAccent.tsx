"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { PALETTE_SWATCHES } from "@/lib/palettes";
import type { Invitation } from "@/types";

export function ColorPaletteAccent({ invitation }: { invitation: Invitation }) {
  const t = useTranslations("viewer");
  const swatches =
    PALETTE_SWATCHES[invitation.colorPalette as keyof typeof PALETTE_SWATCHES] ??
    PALETTE_SWATCHES["royal-gold"];

  return (
    <div className="flex w-full flex-col items-center gap-4 py-8">
      <p className="text-xs uppercase tracking-[0.25em] text-maroon/70">
        {t("colorPaletteTitle")}
      </p>
      <div className="flex justify-center gap-3">
        {swatches.map((color, index) => (
          <motion.span
            key={color}
            initial={{ opacity: 0, scale: 0.6 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
            className="h-4 w-4 rounded-full shadow"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  );
}
