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
 * adapted to the app's Khmer maroon palette instead of the source's green. */
const enNameStyle: CSSProperties = {
  color: "var(--color-maroon)",
  lineHeight: 1.05,
  textShadow:
    "rgba(255, 255, 255, 0.28) 0px 1px 2px, rgba(255, 255, 255, 0.2) 0px 2px 6px, rgba(255, 255, 255, 0.14) 0px 4px 16px",
  letterSpacing: "0.005em",
  fontWeight: 400,
  whiteSpace: "nowrap",
  overflow: "visible",
  fontSize: "clamp(1.75rem, 8vw, 2.625rem)",
};

/** Same reference treatment for the Khmer couple names, keeping the app's
 * existing maroon color (inherited) instead of the reference's green. */
const kmNameStyle: CSSProperties = {
  lineHeight: 1.8,
  textShadow:
    "rgba(255, 255, 255, 0.28) 0px 1px 2px, rgba(255, 255, 255, 0.2) 0px 2px 6px, rgba(255, 255, 255, 0.14) 0px 4px 16px",
  letterSpacing: "0px",
  fontWeight: 400,
  whiteSpace: "nowrap",
  overflow: "visible",
  fontSize: "clamp(1.0625rem, 6vw, 1.625rem)",
};

export function Hero({
  invitation,
  onOpen,
  onStartMusic,
}: {
  invitation: Invitation;
  onOpen: () => void;
  onStartMusic: () => void;
}) {
  const t = useTranslations("viewer");
  const locale = useLocale();
  const shouldReduceMotion = useReducedMotion();
  const [bursting, setBursting] = useState(false);
  const guestName = useSearchParams().get("to")?.trim();

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
          opacity: 0.78,
          marginBottom: "26px",
          animation: onOccasionInkAnimation,
        }
      : {
          fontFamily: "var(--font-elegant-en)",
          fontSize: "clamp(11px, 2.9vw, 13px)",
          letterSpacing: "0.36em",
          textTransform: "uppercase",
          fontWeight: 500,
          opacity: 0.78,
          marginBottom: "26px",
          animation: onOccasionInkAnimation,
        };

  function handleOpenClick() {
    // Start audio synchronously, in the same click, so browsers that
    // require a fresh user gesture to resume an AudioContext (notably
    // Safari/iOS) don't block playback — the stage transition can still be
    // delayed for the spark burst without affecting that gesture window.
    onStartMusic();
    setBursting(true);
    setTimeout(onOpen, 900);
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-5 overflow-y-auto px-6 py-10 text-center text-maroon">
      <p className="text-maroon" style={onOccasionStyle}>
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

      <GuestNameFrame textStyle={bodyFontStyle(locale)}>
        {guestName ? t("guestGreeting", { name: guestName }) : t("guestGreetingDefault")}
      </GuestNameFrame>

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
        <p className="text-lg">{date}</p>
        <p>{time}</p>
        {address && <p className="max-w-xs">{address}</p>}
      </div>

      <div className="relative mt-4">
        <SparkBurst active={bursting} />
        <motion.button
          type="button"
          onClick={handleOpenClick}
          animate={shouldReduceMotion ? undefined : { scale: [1, 1.06, 1] }}
          transition={
            shouldReduceMotion
              ? undefined
              : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
          }
          className="relative overflow-hidden rounded-full bg-gold px-8 py-3 text-sm uppercase tracking-widest text-cream shadow-lg"
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
  );
}
