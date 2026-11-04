"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import { GuestNameFrame } from "@/components/ui/GuestNameFrame";
import { SparkBurst } from "@/components/ui/SparkBurst";
import { bodyFontStyle, headingFontStyle, scriptFontStyle } from "@/lib/fonts";
import { pickBilingual } from "@/lib/bilingual";
import { formatKhmerDate, formatKhmerTime } from "@/lib/khmerDate";
import type { Invitation } from "@/types";

/** Reference look captured from wedgo.app's English-mode couple names,
 * adapted to the template's text & primary palette. */
const enNameStyle: CSSProperties = {
  color: "var(--color-maroon)",
  lineHeight: 1.15,
  textShadow: "0 2px 10px rgba(0, 0, 0, 0.18)",
  letterSpacing: "0.005em",
  fontWeight: 400,
  wordBreak: "break-word",
  overflowWrap: "break-word",
  fontSize: "clamp(1.5rem, 6.5vw, 2.625rem)",
};

/** Same reference treatment for the Khmer couple names. */
const kmNameStyle: CSSProperties = {
  lineHeight: 1.8,
  textShadow: "0 2px 10px rgba(0, 0, 0, 0.18)",
  letterSpacing: "0px",
  fontWeight: 400,
  wordBreak: "break-word",
  overflowWrap: "break-word",
  fontSize: "clamp(1rem, 5.5vw, 1.625rem)",
};

export function Hero({
  invitation,
  guestName: propGuestName,
  onOpen,
  onStartMusic,
  contained = false,
}: {
  invitation: Invitation;
  guestName?: string;
  onOpen: () => void;
  onStartMusic: () => void;
  contained?: boolean;
}) {
  const t = useTranslations("viewer");
  const locale = useLocale();
  const shouldReduceMotion = useReducedMotion();
  const [bursting, setBursting] = useState(false);
  const paramGuestName = useSearchParams().get("to")?.trim();
  const guestName = propGuestName || paramGuestName;


  const groomName = pickBilingual(invitation.content.groomName, locale);
  const brideName = pickBilingual(invitation.content.brideName, locale);
  const address = pickBilingual(invitation.content.address, locale);

  const eventDate = new Date(invitation.eventDate);
  const date =
    locale === "km"
      ? formatKhmerDate(eventDate)
      : eventDate.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
  const time =
    locale === "km"
      ? formatKhmerTime(eventDate)
      : eventDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });

  const nameStyle: CSSProperties =
    locale === "en"
      ? { ...scriptFontStyle(locale), ...enNameStyle }
      : { ...scriptFontStyle(locale), ...kmNameStyle };

  const onOccasionInkAnimation = shouldReduceMotion
    ? undefined
    : "name-ink-reveal 1.6s cubic-bezier(0.16, 1, 0.3, 1) 0s 1 normal both";
  const onOccasionStyle: CSSProperties =
    locale === "km"
      ? {
          ...headingFontStyle(locale),
          fontSize: "18px",
          letterSpacing: "0px",
          textTransform: "none",
          fontWeight: 400,
          opacity: 0.9,
          marginBottom: "18px",
          animation: onOccasionInkAnimation,
        }
      : {
          fontFamily: "var(--font-elegant-en)",
          fontSize: "clamp(11px, 2.9vw, 13px)",
          letterSpacing: "0.36em",
          textTransform: "uppercase",
          fontWeight: 600,
          opacity: 0.9,
          marginBottom: "18px",
          animation: onOccasionInkAnimation,
        };

  function handleOpenClick() {
    onStartMusic();
    setBursting(true);
    setTimeout(onOpen, 500);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className={`${
        contained ? "relative min-h-[560px]" : "fixed inset-0 min-h-screen"
      } z-40 flex flex-col items-center overflow-y-auto overflow-x-clip px-4 py-8 sm:px-6 sm:py-12 text-center text-maroon w-full max-w-full`}
      style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
    >
      <div className="m-auto flex w-full max-w-lg flex-col items-center gap-4 sm:gap-5 py-4">
        <p className="text-glow text-maroon" style={onOccasionStyle}>
          {t("onOccasion")}
        </p>

      <div className="flex flex-col items-center gap-3 sm:gap-4">
        <motion.h1
          style={{
            ...nameStyle,
            animation: shouldReduceMotion
              ? undefined
              : "name-ink-reveal 1.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s 1 normal both",
          }}
        >
          {groomName}
        </motion.h1>
        <span className="text-2xl text-gold" style={scriptFontStyle(locale)}>
          {locale === "km" ? "និង" : "&"}
        </span>
        <motion.h1
          style={{
            ...nameStyle,
            animation: shouldReduceMotion
              ? undefined
              : "name-ink-reveal 1.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s 1 normal both",
          }}
        >
          {brideName}
        </motion.h1>
      </div>

      <GuestNameFrame
        text={guestName ? t("guestGreeting", { name: guestName }) : t("guestGreetingDefault")}
        textStyle={bodyFontStyle(locale)}
      />

      <p
        className="max-w-xs text-base italic text-maroon/80"
        style={bodyFontStyle(locale)}
      >
        {t("requestPleasure")}
      </p>

      <div
        className="flex flex-col items-center gap-1 text-maroon/90"
        style={bodyFontStyle(locale)}
      >
        <p className="text-lg font-medium">{date}</p>
        <p className="text-gold font-semibold">{time}</p>
        {address && <p className="max-w-xs text-sm opacity-85 mt-1">{address}</p>}
      </div>

      <div className="relative mt-4">
        <SparkBurst active={bursting} />
        <motion.button
          type="button"
          onClick={handleOpenClick}
          animate={shouldReduceMotion ? undefined : { scale: [1, 1.05, 1] }}
          transition={
            shouldReduceMotion
              ? undefined
              : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
          }
          className="relative overflow-hidden rounded-full bg-gold px-8 py-3 text-sm font-bold uppercase tracking-widest text-[#140f13] shadow-lg cursor-pointer"
        >
          {!shouldReduceMotion && (
            <span
              aria-hidden
              className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              style={{
                animation: "shimmer-sweep 2s linear infinite",
              }}
            />
          )}
          <span className="relative z-10">{t("openInvitation")}</span>
        </motion.button>
      </div>
      </div>
    </motion.div>
  );
}
