"use client";

import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SectionShell } from "@/components/viewer/SectionShell";
import { bodyFontStyle } from "@/lib/fonts";
import { useCountdown } from "@/hooks/useCountdown";
import type { Invitation } from "@/types";

function AnimatedNumber({ value }: { value: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <span
      className="relative inline-block h-[1em] overflow-hidden align-bottom"
      style={{ width: `${value.length}ch` }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={reduceMotion ? { opacity: 0 } : { y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { y: "-100%", opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function Countdown({ invitation }: { invitation: Invitation }) {
  const t = useTranslations("viewer");
  const locale = useLocale();
  const reduceMotion = useReducedMotion();
  const { days, hours, minutes, seconds } = useCountdown(invitation.eventDate);

  const units: [number, string][] = [
    [days, t("days")],
    [hours, t("hours")],
    [minutes, t("minutes")],
    [seconds, t("seconds")],
  ];

  return (
    <SectionShell className="text-maroon">
      <p className="text-glow text-lg text-maroon/90" style={bodyFontStyle(locale)}>
        {t("countdownTitle")}
      </p>
      <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
        {units.map(([value, label], index) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: index * 0.2, ease: "easeOut" }}
            className="flex min-w-20 flex-col items-center gap-1 rounded-2xl bg-cream/75 px-3 py-4 shadow-lg backdrop-blur-md sm:min-w-24"
          >
            <span className="font-[family-name:var(--font-heading-en)] text-3xl text-gold sm:text-4xl">
              <AnimatedNumber value={String(value).padStart(2, "0")} />
            </span>
            <span className="text-[10px] uppercase tracking-widest text-maroon/70">
              {label}
            </span>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}
