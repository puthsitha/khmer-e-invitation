"use client";

import type { Bilingual } from "@/types";

export function BilingualField({
  label,
  value,
  onBlur,
  textarea = false,
}: {
  label: string;
  value: Bilingual;
  onBlur: (value: Bilingual) => void;
  textarea?: boolean;
}) {
  const fieldClassName =
    "rounded-lg border border-gold/40 px-3 py-2 transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20";

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-maroon">{label}</span>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs text-maroon/60">
          ខ្មែរ (Khmer)
          {textarea ? (
            <textarea
              defaultValue={value.km}
              rows={3}
              onBlur={(e) => onBlur({ ...value, km: e.target.value })}
              className={fieldClassName}
            />
          ) : (
            <input
              type="text"
              defaultValue={value.km}
              onBlur={(e) => onBlur({ ...value, km: e.target.value })}
              className={fieldClassName}
            />
          )}
        </label>
        <label className="flex flex-col gap-1 text-xs text-maroon/60">
          English
          {textarea ? (
            <textarea
              defaultValue={value.en}
              rows={3}
              onBlur={(e) => onBlur({ ...value, en: e.target.value })}
              className={fieldClassName}
            />
          ) : (
            <input
              type="text"
              defaultValue={value.en}
              onBlur={(e) => onBlur({ ...value, en: e.target.value })}
              className={fieldClassName}
            />
          )}
        </label>
      </div>
    </div>
  );
}
