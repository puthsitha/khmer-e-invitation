"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { QrCode, CheckCircle2 } from "lucide-react";
import { WaxSeal } from "@/components/ui/WaxSeal";

export function FeatureShowcase() {
  const t = useTranslations("home");

  return (
    <section className="relative z-20 w-full max-w-5xl px-4 py-12">
      {/* Section Header */}
      <div className="mb-10 text-center">
        <h2 className="font-[family-name:var(--font-heading-km)] text-2xl text-maroon sm:text-3xl">
          {t("featuresTitle")}
        </h2>
        <p className="font-[family-name:var(--font-body-km)] mx-auto mt-2 max-w-xl text-sm leading-relaxed text-maroon/80 sm:text-base">
          {t("featuresSubtitle")}
        </p>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Card 1: Interactive 3D Envelope */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ delay: 0.1, duration: 0.5 }}
          whileHover={{ y: -6, scale: 1.02 }}
          className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-gold/40 bg-gradient-to-b from-[#fffefc] to-[#fcf6ed] p-6 shadow-lg backdrop-blur-md transition-all duration-300 hover:border-gold hover:shadow-[0_20px_45px_rgba(201,162,75,0.22)]"
        >
          <div>
            {/* Title & Description */}
            <h3 className="font-[family-name:var(--font-heading-km)] text-lg text-maroon">
              {t("feat1Title")}
            </h3>
            <p className="font-[family-name:var(--font-body-km)] mt-2 text-sm leading-relaxed text-maroon/75">
              {t("feat1Desc")}
            </p>
          </div>

          {/* Interactive Mini Preview Illustration: 3D Envelope */}
          <div className="mt-6 flex h-28 items-center justify-center rounded-2xl border border-gold/25 bg-gold/5 p-3 transition-colors duration-300 group-hover:bg-gold/10">
            <div className="relative flex h-20 w-36 items-center justify-center rounded-xl border border-gold/40 bg-[#fdfaf5] shadow-md transition-transform duration-500 group-hover:scale-105">
              {/* Envelope flap folds */}
              <div
                className="absolute inset-x-0 top-0 h-9 border-b border-gold/30 bg-gold/10"
                style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
              />
              {/* Mini Wax Seal */}
              <div className="relative z-10 transition-transform duration-300 group-hover:scale-115">
                <WaxSeal size={36} />
              </div>
              <span className="absolute bottom-1.5 text-[9px] font-medium uppercase tracking-widest text-gold">
                Khmer E-Card
              </span>
            </div>
          </div>

          {/* Gold bottom indicator */}
          <div className="mt-5 h-1 w-12 rounded-full bg-gold/40 transition-all duration-300 group-hover:w-24 group-hover:bg-gold" />
        </motion.div>

        {/* Card 2: Melody & Storytelling */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ delay: 0.2, duration: 0.5 }}
          whileHover={{ y: -6, scale: 1.02 }}
          className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-gold/40 bg-gradient-to-b from-[#fffefc] to-[#fcf6ed] p-6 shadow-lg backdrop-blur-md transition-all duration-300 hover:border-gold hover:shadow-[0_20px_45px_rgba(201,162,75,0.22)]"
        >
          <div>
            {/* Title & Description */}
            <h3 className="font-[family-name:var(--font-heading-km)] text-lg text-maroon">
              {t("feat2Title")}
            </h3>
            <p className="font-[family-name:var(--font-body-km)] mt-2 text-sm leading-relaxed text-maroon/75">
              {t("feat2Desc")}
            </p>
          </div>

          {/* Interactive Mini Preview Illustration: Live Sound Equalizer Bars */}
          <div className="mt-6 flex h-28 items-center justify-center gap-2 rounded-2xl border border-gold/25 bg-gold/5 p-3 transition-colors duration-300 group-hover:bg-gold/10">
            {[18, 38, 52, 30, 44, 22, 48].map((height, i) => (
              <motion.span
                key={i}
                animate={{ height: [height * 0.4, height, height * 0.5] }}
                transition={{
                  duration: 0.9 + (i % 3) * 0.3,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                  delay: i * 0.12,
                }}
                className="w-2 rounded-full bg-gradient-to-t from-gold to-gold-light shadow-xs"
              />
            ))}
          </div>

          {/* Gold bottom indicator */}
          <div className="mt-5 h-1 w-12 rounded-full bg-gold/40 transition-all duration-300 group-hover:w-24 group-hover:bg-gold" />
        </motion.div>

        {/* Card 3: Smart RSVP & Digital Gifts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ delay: 0.3, duration: 0.5 }}
          whileHover={{ y: -6, scale: 1.02 }}
          className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-gold/40 bg-gradient-to-b from-[#fffefc] to-[#fcf6ed] p-6 shadow-lg backdrop-blur-md transition-all duration-300 hover:border-gold hover:shadow-[0_20px_45px_rgba(201,162,75,0.22)]"
        >
          <div>
            {/* Title & Description */}
            <h3 className="font-[family-name:var(--font-heading-km)] text-lg text-maroon">
              {t("feat3Title")}
            </h3>
            <p className="font-[family-name:var(--font-body-km)] mt-2 text-sm leading-relaxed text-maroon/75">
              {t("feat3Desc")}
            </p>
          </div>

          {/* Interactive Mini Preview Illustration: QR Scan & Attendance Check */}
          <div className="mt-6 flex h-28 items-center justify-center gap-3 rounded-2xl border border-gold/25 bg-gold/5 p-3 transition-colors duration-300 group-hover:bg-gold/10">
            <div className="relative flex h-18 w-18 items-center justify-center rounded-xl border-2 border-gold/50 bg-white p-1.5 shadow-sm transition-transform duration-300 group-hover:scale-105">
              <QrCode className="h-12 w-12 text-maroon/80" />
              {/* Scan laser line */}
              <motion.div
                animate={{ y: [-16, 16, -16] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="pointer-events-none absolute inset-x-1 h-0.5 bg-gold shadow-[0_0_8px_#c9a24b]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 rounded-full bg-emerald-100/90 px-2 py-0.5 text-[10px] font-bold text-emerald-800 shadow-2xs">
                <CheckCircle2 size={12} className="text-emerald-600" />
                <span>RSVP Done</span>
              </div>
              <span className="text-[10px] font-medium text-maroon/60">Bakong KHQR</span>
            </div>
          </div>

          {/* Gold bottom indicator */}
          <div className="mt-5 h-1 w-12 rounded-full bg-gold/40 transition-all duration-300 group-hover:w-24 group-hover:bg-gold" />
        </motion.div>
      </div>
    </section>
  );
}
