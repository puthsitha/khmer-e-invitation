"use client";

import { motion } from "framer-motion";
import type { Invitation } from "@/types";

const PALETTE_SWATCHES: Record<string, string[]> = {
  "royal-gold": ["#c9a24b", "#7a1f2b", "#fdf8f0"],
  "blush-temple": ["#e7b8c2", "#c9a24b", "#fffaf5"],
  "modern-minimal": ["#2a2a2a", "#c9a24b", "#f5f2ec"],
};

export function ColorPaletteAccent({ invitation }: { invitation: Invitation }) {
  const swatches =
    PALETTE_SWATCHES[invitation.colorPalette] ?? PALETTE_SWATCHES["royal-gold"];

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
