import type { Bilingual } from "@/types";

export const EMPTY_BILINGUAL: Bilingual = { km: "", en: "" };

/**
 * Normalizes a Bilingual field, tolerating the pre-bilingual data shape
 * (a plain string, treated as the Khmer value) so existing documents don't
 * crash the editor/viewer after this shape change.
 */
export function asBilingual(value: unknown): Bilingual {
  if (typeof value === "string") return { km: value, en: "" };
  if (value && typeof value === "object" && "km" in value && "en" in value) {
    return value as Bilingual;
  }
  return EMPTY_BILINGUAL;
}

/** Picks the guest-facing locale's text, falling back to the other language if empty. */
export function pickBilingual(value: unknown, locale: string): string {
  const bilingual = asBilingual(value);
  return locale === "en"
    ? bilingual.en || bilingual.km
    : bilingual.km || bilingual.en;
}
