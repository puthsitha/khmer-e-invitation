import type { Bilingual } from "@/types";

/** Picks the guest-facing locale's text, falling back to the other language if empty. */
export function pickBilingual(value: Bilingual | undefined, locale: string): string {
  if (!value) return "";
  return locale === "en" ? value.en || value.km : value.km || value.en;
}
