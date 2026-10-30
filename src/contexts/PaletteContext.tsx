"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { getPalette, getTemplate, DEFAULT_TEMPLATE_COLORS } from "@/lib/firebase/firestore";
import type { TemplateColors } from "@/types";

const PaletteContext = createContext<TemplateColors>(DEFAULT_TEMPLATE_COLORS);

export function PaletteProvider({
  palette,
  templateId,
  colors: explicitColors,
  children,
}: {
  palette?: string;
  templateId?: string;
  colors?: TemplateColors;
  children: ReactNode;
}) {
  const [resolved, setResolved] = useState<TemplateColors | null>(null);

  useEffect(() => {
    if (explicitColors) {
      return;
    }

    let cancelled = false;

    async function load() {
      if (templateId) {
        const tpl = await getTemplate(templateId).catch(() => null);
        if (!cancelled && tpl?.colors) {
          setResolved(tpl.colors);
          return;
        }
      }
      if (palette) {
        const p = await getPalette(palette).catch(() => null);
        if (!cancelled && p) {
          setResolved({
            primary: p.primary,
            secondary: p.secondary,
            text: p.secondary,
            background: p.background,
          });
          return;
        }
      }
      if (!cancelled) {
        setResolved(DEFAULT_TEMPLATE_COLORS);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [explicitColors, templateId, palette]);

  const activeColors = explicitColors ?? resolved ?? DEFAULT_TEMPLATE_COLORS;
  const bgOpacity =
    typeof activeColors.backgroundOpacity === "number"
      ? Math.max(0, Math.min(100, activeColors.backgroundOpacity))
      : 85;

  const style: CSSProperties = {
    "--color-primary": activeColors.primary,
    "--color-secondary": activeColors.secondary,
    "--color-text": activeColors.text,
    "--color-bg": activeColors.background,
    "--bg-opacity": `${bgOpacity}%`,
    "--color-gold": activeColors.primary,
    "--color-gold-light": `color-mix(in srgb, ${activeColors.primary} 75%, white)`,
    "--color-maroon": activeColors.text,
    "--color-cream": activeColors.background,
    backgroundColor: activeColors.background,
    color: activeColors.text,
  } as CSSProperties;

  return (
    <PaletteContext.Provider value={activeColors}>
      <div data-palette="custom" style={style} className="h-full min-h-full w-full">
        {children}
      </div>
    </PaletteContext.Provider>
  );
}

export function usePalette() {
  return useContext(PaletteContext);
}
