"use client";

import type { Bilingual } from "@/types";

export function BilingualField({
  label,
  value,
  onBlur,
  textarea = false,
  placeholderKm,
  placeholderEn,
}: {
  label: string;
  value: Bilingual;
  onBlur: (value: Bilingual) => void;
  textarea?: boolean;
  placeholderKm?: string;
  placeholderEn?: string;
}) {
  const fieldClassName =
    "w-full rounded-xl border border-gold/40 dark:border-gold/30 bg-white/90 dark:bg-[#20181e] px-3.5 py-2.5 text-base sm:text-sm text-maroon dark:text-[#f6eee8] shadow-xs transition-all duration-200 placeholder:text-maroon/30 dark:placeholder:text-[#f6eee8]/30 hover:border-gold/70 focus:border-maroon dark:focus:border-gold focus:bg-white dark:focus:bg-[#20181e] focus:outline-none focus:ring-2 focus:ring-maroon/15 dark:focus:ring-gold/20";

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-maroon dark:text-[#f6eee8]">{label}</span>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Khmer Field */}
        <div className="flex flex-col gap-1.5 rounded-xl border border-gold/25 dark:border-gold/20 bg-cream/40 dark:bg-white/5 p-2.5 transition-colors focus-within:border-gold/60 focus-within:bg-cream/60 dark:focus-within:bg-white/10">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 rounded-md bg-gold/20 dark:bg-gold/25 px-2 py-0.5 text-[11px] font-semibold text-maroon dark:text-gold">
              <span aria-hidden>🇰🇭</span> ខ្មែរ (Khmer)
            </span>
          </div>
          {textarea ? (
            <textarea
              defaultValue={value.km}
              rows={3}
              placeholder={placeholderKm}
              onBlur={(e) => onBlur({ ...value, km: e.target.value })}
              className={fieldClassName}
            />
          ) : (
            <input
              type="text"
              defaultValue={value.km}
              placeholder={placeholderKm}
              onBlur={(e) => onBlur({ ...value, km: e.target.value })}
              className={fieldClassName}
            />
          )}
        </div>

        {/* English Field */}
        <div className="flex flex-col gap-1.5 rounded-xl border border-gold/25 dark:border-gold/20 bg-cream/40 dark:bg-white/5 p-2.5 transition-colors focus-within:border-gold/60 focus-within:bg-cream/60 dark:focus-within:bg-white/10">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 rounded-md bg-maroon/10 dark:bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-maroon dark:text-[#f6eee8]">
              <span aria-hidden>🇬🇧</span> English
            </span>
          </div>
          {textarea ? (
            <textarea
              defaultValue={value.en}
              rows={3}
              placeholder={placeholderEn}
              onBlur={(e) => onBlur({ ...value, en: e.target.value })}
              className={fieldClassName}
            />
          ) : (
            <input
              type="text"
              defaultValue={value.en}
              placeholder={placeholderEn}
              onBlur={(e) => onBlur({ ...value, en: e.target.value })}
              className={fieldClassName}
            />
          )}
        </div>
      </div>
    </div>
  );
}

