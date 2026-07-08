import { useTranslations } from "next-intl";
import { LocaleSwitcher } from "@/components/ui/LocaleSwitcher";
import { HeroReveal } from "@/components/ui/HeroReveal";

export default function HomePage() {
  const t = useTranslations("home");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-cream px-6 text-center">
      <div className="absolute right-4 top-4">
        <LocaleSwitcher />
      </div>
      <HeroReveal>
        <h1 className="font-[family-name:var(--font-heading-km)] text-4xl text-maroon sm:text-5xl">
          {t("heading")}
        </h1>
        <p className="font-[family-name:var(--font-body-km)] max-w-xl text-lg text-maroon/80">
          {t("subheading")}
        </p>
        <button
          type="button"
          className="rounded-full bg-gold px-8 py-3 font-[family-name:var(--font-body-km)] text-cream shadow-lg transition-transform hover:scale-105"
        >
          {t("cta")}
        </button>
      </HeroReveal>
    </main>
  );
}
