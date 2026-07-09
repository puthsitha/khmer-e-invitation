"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import { OrnamentDivider } from "@/components/ui/OrnamentDivider";
import { SparkBurst } from "@/components/ui/SparkBurst";
import { bodyFontStyle, scriptFontStyle } from "@/lib/fonts";
import { pickBilingual } from "@/lib/bilingual";
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

export function Hero({
  invitation,
  onOpen,
}: {
  invitation: Invitation;
  onOpen: () => void;
}) {
  const t = useTranslations("viewer");
  const locale = useLocale();
  const shouldReduceMotion = useReducedMotion();
  const [bursting, setBursting] = useState(false);

  const groomName = pickBilingual(invitation.content.groomName, locale);
  const brideName = pickBilingual(invitation.content.brideName, locale);
  const address = pickBilingual(invitation.content.address, locale);

  const dateLocale = locale === "km" ? "km-KH" : "en-US";
  const date = new Date(invitation.eventDate).toLocaleDateString(dateLocale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const time = new Date(invitation.eventDate).toLocaleTimeString(dateLocale, {
    hour: "2-digit",
    minute: "2-digit",
  });

  const nameClassName =
    locale === "en" ? "" : "text-4xl leading-[1.6] sm:text-6xl";
  const nameStyle: CSSProperties =
    locale === "en"
      ? { ...scriptFontStyle(locale), ...enNameStyle }
      : scriptFontStyle(locale);

  function handleOpenClick() {
    setBursting(true);
    setTimeout(onOpen, 900);
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-5 overflow-y-auto px-6 py-10 text-center text-maroon">
      <p
        className="text-xs uppercase tracking-[0.3em] text-maroon/70"
        style={bodyFontStyle(locale)}
      >
        {t("onOccasion")}
      </p>

      <div className="flex flex-col items-center gap-3 sm:gap-4">
        <motion.h1
          className={nameClassName}
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
          &
        </span>
        <motion.h1
          className={nameClassName}
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

      <OrnamentDivider />

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
              className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-white/90 to-transparent"
              style={{
                animation: "shimmer-sweep 2.4s ease-in-out infinite",
              }}
            />
          )}
          <span className="relative z-10">{t("openInvitation")}</span>
        </motion.button>
      </div>
    </div>
  );
}
