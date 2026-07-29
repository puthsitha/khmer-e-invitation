"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const labels: Record<string, string> = {
  km: "ខ្មែរ",
  en: "EN",
};

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex items-center gap-1 rounded-full border border-gold/40 bg-cream/60 p-1 text-sm">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => router.replace(pathname, { locale: loc })}
          aria-current={loc === locale}
          className={`cursor-pointer rounded-full px-3 py-1 transition-colors ${
            loc === locale
              ? "bg-maroon text-cream"
              : "text-maroon/70 hover:text-maroon"
          }`}
        >
          {labels[loc]}
        </button>
      ))}
    </div>
  );
}
