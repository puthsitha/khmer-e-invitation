"use client";

const labels: Record<string, string> = {
  km: "ខ្មែរ",
  en: "EN",
};

export function ViewerLocaleSwitcher({
  locale,
  onChange,
}: {
  locale: "km" | "en";
  onChange: (locale: "km" | "en") => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-gold/40 bg-cream/80 p-1 text-sm shadow-md">
      {(["km", "en"] as const).map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => onChange(loc)}
          aria-current={loc === locale}
          className={`rounded-full px-3 py-1 transition-colors ${
            loc === locale ? "bg-maroon text-cream" : "text-maroon/70 hover:text-maroon"
          }`}
        >
          {labels[loc]}
        </button>
      ))}
    </div>
  );
}
