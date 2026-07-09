import type { CSSProperties } from "react";

/** Display heading font (Moul for km, Playfair Display for en). */
export function headingFontStyle(locale: string): CSSProperties {
  return {
    fontFamily:
      locale === "en" ? "var(--font-heading-en)" : "var(--font-heading-km)",
  };
}

/** Flowing script font for the couple's names — Alex Brush for en, Moul for km. */
export function scriptFontStyle(locale: string): CSSProperties {
  return {
    fontFamily:
      locale === "en" ? "var(--font-script-en)" : "var(--font-heading-km)",
  };
}

/** Elegant serif body copy — Cormorant Garamond for en, Kantumruy Pro for km. */
export function bodyFontStyle(locale: string): CSSProperties {
  return {
    fontFamily:
      locale === "en" ? "var(--font-elegant-en)" : "var(--font-body-km)",
  };
}
