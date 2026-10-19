"use client";

import { motion } from "framer-motion";
import { Check, Palette as PaletteIcon } from "lucide-react";
import type { Palette } from "@/types";

interface PaletteSelectorProps {
  palettes: Palette[];
  selectedId: string;
  onSelect: (paletteId: string) => void;
  title?: string;
  description?: string;
}

export function PaletteSelector({
  palettes,
  selectedId,
  onSelect,
  title,
  description,
}: PaletteSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      {(title || description) && (
        <div>
          {title && (
            <div className="flex items-center gap-1.5 text-sm font-semibold text-maroon dark:text-[#f6eee8]">
              <PaletteIcon className="h-4 w-4 text-gold" />
              <span>{title}</span>
            </div>
          )}
          {description && (
            <p className="mt-0.5 text-xs text-maroon/60 dark:text-[#f6eee8]/60">{description}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {palettes.map((palette) => {
          const isSelected = palette.paletteId === selectedId;

          return (
            <motion.button
              key={palette.paletteId}
              type="button"
              onClick={() => onSelect(palette.paletteId)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`group relative flex flex-col gap-2.5 rounded-2xl border p-3.5 text-left transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "border-maroon dark:border-gold bg-white dark:bg-[#20181e] shadow-md ring-2 ring-maroon/20 dark:ring-gold/30 opacity-100 scale-[1.01]"
                  : "border-gold/30 dark:border-gold/20 bg-white/70 dark:bg-[#1c161b] opacity-60 hover:opacity-95 hover:border-gold hover:bg-white dark:hover:bg-[#20181e] hover:shadow-xs"
              }`}
            >
              {/* Card Header: Name + Active Check */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-semibold transition-colors ${
                    isSelected ? "text-maroon dark:text-gold" : "text-maroon/80 dark:text-[#f6eee8]/80 group-hover:text-maroon dark:group-hover:text-[#f6eee8]"
                  }`}
                >
                  {palette.name}
                </span>

                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full transition-all ${
                    isSelected
                      ? "bg-maroon dark:bg-gold text-cream dark:text-maroon scale-100 shadow-xs"
                      : "border border-gold/40 dark:border-gold/30 text-transparent scale-90 group-hover:border-gold"
                  }`}
                >
                  <Check className="h-3 w-3" strokeWidth={3} />
                </div>
              </div>

              {/* Swatches Row */}
              <div className="flex items-center gap-2">
                {[
                  { label: "Primary", color: palette.primary },
                  { label: "Secondary", color: palette.secondary },
                  { label: "Background", color: palette.background },
                ].map((swatch, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span
                      className="h-6 w-6 rounded-full border border-black/10 shadow-xs ring-1 ring-white transition-transform group-hover:scale-110"
                      style={{ backgroundColor: swatch.color }}
                      title={`${swatch.label}: ${swatch.color}`}
                    />
                  </div>
                ))}
              </div>

              {/* Visual Strip Preview */}
              <div
                className="h-2 w-full rounded-full border border-black/5 overflow-hidden flex"
                style={{ backgroundColor: palette.background }}
              >
                <div
                  className="h-full w-2/5"
                  style={{ backgroundColor: palette.primary }}
                />
                <div
                  className="h-full w-2/5"
                  style={{ backgroundColor: palette.secondary }}
                />
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
