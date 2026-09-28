"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { LocaleSwitcher } from "@/components/ui/LocaleSwitcher";
import { SiteNav } from "@/components/ui/SiteNav";
import { OrnamentDivider } from "@/components/ui/OrnamentDivider";
import { AmbientSparks } from "@/components/ui/AmbientSparks";
import { InteractiveInvitationCard } from "@/components/home/InteractiveInvitationCard";
import { FeatureShowcase } from "@/components/home/FeatureShowcase";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function HomePage() {
  const t = useTranslations("home");
  const locale = useLocale();
  const { user, appUser, loading } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-cream text-maroon">
      {/* Ambient background sparks */}
      <AmbientSparks />

      {/* Sticky Top Header: stays pinned at top when scrolling */}
      <header
        className={`sticky top-0 z-50 w-full border-b transition-all duration-300 px-4 sm:px-8 ${
          isScrolled
            ? "border-gold/40 bg-cream/95 shadow-md backdrop-blur-lg py-3"
            : "border-gold/25 bg-cream/80 backdrop-blur-md py-4"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="relative h-8 w-8 transition-transform duration-300 group-hover:scale-110 sm:h-9 sm:w-9">
              <Image
                src="/images/Frame_1.png"
                alt="Khmer E-Invitation Logo"
                fill
                sizes="36px"
                className="object-contain drop-shadow-xs"
                priority
              />
            </div>
            <span className="font-[family-name:var(--font-heading-km)] text-base tracking-wide text-maroon sm:text-lg">
              {locale === "km" ? "ការអញ្ជើញបែបខ្មែរ" : "Khmer E-Invite"}
            </span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-5">
            <SiteNav />
            <div className="h-4 w-px bg-gold/40" />
            <LocaleSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative overflow-x-clip">
        {/* Hero Section */}
        <section className="relative z-20 mx-auto flex max-w-5xl flex-col items-center px-4 pt-10 pb-8 text-center sm:pt-14">
          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="font-[family-name:var(--font-heading-km)] text-3xl leading-snug tracking-tight text-maroon sm:text-5xl md:text-6xl"
          >
            {t("heading")}
          </motion.h1>

          {/* Traditional Khmer Divider */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="my-3 flex justify-center"
          >
            <OrnamentDivider variant={2} priority />
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-[family-name:var(--font-body-km)] max-w-2xl text-base leading-relaxed text-maroon/85 sm:text-lg"
          >
            {t("subheading")}
          </motion.p>

          {/* Call to Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            {!loading && user ? (
              <Link
                href={appUser?.role === "admin" ? "/admin" : "/dashboard"}
                className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full border border-gold/50 bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#c59a3f] px-8 py-3.5 font-[family-name:var(--font-heading-km)] text-sm font-semibold text-maroon shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_12px_24px_rgba(201,162,75,0.35)] active:scale-95"
              >
                {/* Shimmer sweep effect */}
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                <span>
                  {appUser?.role === "admin"
                    ? t("goToAdminDashboard")
                    : t("goToDashboard")}
                </span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full border border-gold/50 bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#c59a3f] px-8 py-3.5 font-[family-name:var(--font-heading-km)] text-sm font-semibold text-maroon shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_12px_24px_rgba(201,162,75,0.35)] active:scale-95"
                >
                  {/* Shimmer sweep effect */}
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                  <span>{t("cta")}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    const cardElement = document.getElementById("interactive-card");
                    cardElement?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-cream/80 px-6 py-3.5 font-[family-name:var(--font-body-km)] text-sm font-medium text-maroon shadow-sm backdrop-blur-sm transition-all hover:bg-gold/15 hover:border-gold active:scale-95"
                >
                  <span>{t("exploreDemo")}</span>
                </button>
              </>
            )}
          </motion.div>

          {/* 3D Interactive Invitation Card Centerpiece */}
          <motion.div
            id="interactive-card"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-10 w-full"
          >
            <InteractiveInvitationCard />
          </motion.div>
        </section>

        {/* Feature Showcase Grid */}
        <div className="relative z-20 flex justify-center">
          <FeatureShowcase />
        </div>

        {/* Decorative Traditional Footer */}
        <footer className="relative z-20 mt-16 border-t border-gold/25 bg-cream/60 py-8 text-center backdrop-blur-xs">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4">
            <div className="relative h-6 w-32 opacity-70">
              <Image
                src="/images/divider_6.png"
                alt=""
                fill
                sizes="128px"
                className="object-contain"
                aria-hidden
              />
            </div>
            <p className="font-[family-name:var(--font-body-km)] text-xs text-maroon/70">
              © {new Date().getFullYear()}{" "}
              {locale === "km"
                ? "ការអញ្ជើញអេឡិចត្រូនិកបែបខ្មែរ — រក្សាសិទ្ធិគ្រប់យ៉ាង"
                : "Khmer E-Invitation — All Rights Reserved"}
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
