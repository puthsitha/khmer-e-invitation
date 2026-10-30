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
      <div className="grid w-full max-w-xs grid-cols-4 gap-2 sm:max-w-md sm:gap-4">
        {units.map(([value, label], index) => (
          <motion.div
            key={label}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
            className="ultra-thin-material flex flex-col items-center gap-1 rounded-2xl px-1.5 py-3 sm:px-3 sm:py-4"
          >
            <span className="font-[family-name:var(--font-heading-en)] text-2xl text-gold sm:text-4xl drop-shadow-[0_2px_8px_rgba(201,162,75,0.35)]">
              <AnimatedNumber value={String(value).padStart(2, "0")} />
            </span>
            <span className="text-[9px] uppercase tracking-wider text-maroon/80 sm:text-[10px] sm:tracking-widest font-medium">
              {label}
            </span>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}
