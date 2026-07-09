"use client";

import { useLocale, useTranslations } from "next-intl";
import { OrnamentDivider } from "@/components/ui/OrnamentDivider";
import { bodyFontStyle, scriptFontStyle } from "@/lib/fonts";
import { pickBilingual } from "@/lib/bilingual";
import type { Invitation } from "@/types";

export function Hero({
  invitation,
  onOpen,
}: {
  invitation: Invitation;
  onOpen: () => void;
}) {
  const t = useTranslations("viewer");
  const locale = useLocale();

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

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-5 overflow-y-auto px-6 py-10 text-center text-maroon">
      <p
        className="text-xs uppercase tracking-[0.3em] text-maroon/70"
        style={bodyFontStyle(locale)}
      >
        {t("onOccasion")}
      </p>

      <div className="flex flex-col items-center">
        <h1
          className="text-4xl leading-tight sm:text-6xl"
          style={scriptFontStyle(locale)}
        >
          {groomName}
        </h1>
        <span className="text-2xl text-gold" style={scriptFontStyle(locale)}>
          &
        </span>
        <h1
          className="text-4xl leading-tight sm:text-6xl"
          style={scriptFontStyle(locale)}
        >
          {brideName}
        </h1>
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

      <button
        type="button"
        onClick={onOpen}
        className="mt-4 rounded-full bg-gold px-8 py-3 text-sm uppercase tracking-widest text-cream shadow-lg transition-transform hover:scale-105"
      >
        {t("openInvitation")}
      </button>
    </div>
  );
}
