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
    <div className="ultra-thin-material flex items-center gap-1 rounded-full p-1 text-sm shadow-md">
      {(["km", "en"] as const).map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => onChange(loc)}
          aria-current={loc === locale}
          className={`rounded-full px-3 py-1 transition-all ${
            loc === locale
              ? "bg-gold/25 text-gold font-medium border border-gold/40 shadow-xs"
              : "text-[#fdf8f0]/75 hover:text-[#fdf8f0] hover:bg-white/5"
          }`}
        >
          {labels[loc]}
        </button>
      ))}
    </div>
  );
}
