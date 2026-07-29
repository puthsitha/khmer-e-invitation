"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { getPalette } from "@/lib/firebase/firestore";
import type { Palette } from "@/types";

const PaletteContext = createContext<string>("royal-gold");

const KNOWN_IDS = ["royal-gold", "blush-temple", "modern-minimal"];

export function PaletteProvider({
  palette,
  children,
}: {
  palette: string;
  children: ReactNode;
}) {
  const [resolved, setResolved] = useState<Palette | null>(null);

  useEffect(() => {
    let cancelled = false;
    getPalette(palette).then((p) => {
      if (!cancelled) setResolved(p);
    });
    return () => {
      cancelled = true;
    };
  }, [palette]);

  // Falls back to the Royal Gold static CSS block while the palette loads,
  // or permanently for an unknown/deleted custom palette id.
  const dataPaletteId = KNOWN_IDS.includes(palette) ? palette : "royal-gold";
  const style: CSSProperties | undefined = resolved
    ? ({
        "--color-gold": resolved.primary,
        "--color-gold-light": resolved.primaryLight,
        "--color-maroon": resolved.secondary,
        "--color-cream": resolved.background,
      } as CSSProperties)
    : undefined;

  return (
    <PaletteContext.Provider value={palette}>
      <div data-palette={dataPaletteId} style={style}>
        {children}
      </div>
    </PaletteContext.Provider>
  );
}

export function usePalette() {
  return useContext(PaletteContext);
}
