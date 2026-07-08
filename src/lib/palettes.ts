export const PALETTE_IDS = ["royal-gold", "blush-temple", "modern-minimal"] as const;
export type PaletteId = (typeof PALETTE_IDS)[number];

export const PALETTE_LABELS: Record<PaletteId, string> = {
  "royal-gold": "Royal Gold",
  "blush-temple": "Blush Temple",
  "modern-minimal": "Modern Minimal Khmer",
};

// Swatch previews for pickers — mirrors the [data-palette] overrides in globals.css.
export const PALETTE_SWATCHES: Record<PaletteId, string[]> = {
  "royal-gold": ["#c9a24b", "#7a1f2b", "#fdf8f0"],
  "blush-temple": ["#c9a24b", "#8a3b4c", "#fff8f4"],
  "modern-minimal": ["#b8934a", "#2a2a2a", "#f5f2ec"],
};
