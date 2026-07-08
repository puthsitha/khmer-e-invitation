import { defineRouting } from "next-intl/routing";

export const locales = ["km", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "km";

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
});
