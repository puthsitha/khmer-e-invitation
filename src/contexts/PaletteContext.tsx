"use client";

import { createContext, useContext, type ReactNode } from "react";

export type PaletteId = "royal-gold" | "blush-temple" | "modern-minimal";

const PaletteContext = createContext<PaletteId>("royal-gold");

export function PaletteProvider({
  palette,
  children,
}: {
  palette: string;
  children: ReactNode;
}) {
  const id: PaletteId = isPaletteId(palette) ? palette : "royal-gold";
  return (
    <PaletteContext.Provider value={id}>
      <div data-palette={id}>{children}</div>
    </PaletteContext.Provider>
  );
}

export function usePalette() {
  return useContext(PaletteContext);
}

function isPaletteId(value: string): value is PaletteId {
  return value === "royal-gold" || value === "blush-temple" || value === "modern-minimal";
}
