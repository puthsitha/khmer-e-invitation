"use client";

import { motion } from "framer-motion";
import { PALETTE_SWATCHES } from "@/lib/palettes";
import type { Invitation } from "@/types";

export function ColorPaletteAccent({ invitation }: { invitation: Invitation }) {
  const swatches =
    PALETTE_SWATCHES[invitation.colorPalette as keyof typeof PALETTE_SWATCHES] ??
    PALETTE_SWATCHES["royal-gold"];

  return (
    <div className="flex w-full justify-center gap-3 bg-cream py-8">
      {swatches.map((color, index) => (
        <motion.span
          key={color}
          initial={{ opacity: 0, scale: 0.6 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
          className="h-4 w-4 rounded-full"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}
