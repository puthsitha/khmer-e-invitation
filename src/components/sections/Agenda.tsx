"use client";

import { useLocale, useTranslations } from "next-intl";
import { SectionShell } from "@/components/viewer/SectionShell";
import { GlassCard } from "@/components/viewer/GlassCard";
import { SectionHeading } from "@/components/viewer/SectionHeading";
import { bodyFontStyle } from "@/lib/fonts";
import { pickBilingual } from "@/lib/bilingual";
import type { Invitation } from "@/types";

export function Agenda({ invitation }: { invitation: Invitation }) {
  const t = useTranslations("viewer");
  const locale = useLocale();
  const agenda = Array.isArray(invitation.content.agenda) ? invitation.content.agenda : [];

  if (agenda.length === 0) return null;

  return (
    <SectionShell className="text-maroon">
      <GlassCard>
        <SectionHeading icon="🕐">{t("agendaTitle")}</SectionHeading>
        <ol className="flex flex-col gap-6 border-l-2 border-gold/40 pl-6 text-left">
          {agenda.map((item, index) => (
            <li key={`${item.time}-${index}`} className="relative">
              <span className="absolute -left-[29px] top-1.5 h-3 w-3 rounded-full bg-gold" />
              <p className="font-[family-name:var(--font-heading-en)] text-gold">
                {item.time}
              </p>
              <p style={bodyFontStyle(locale)}>{pickBilingual(item.title, locale)}</p>
            </li>
          ))}
        </ol>
      </GlassCard>
    </SectionShell>
  );
}
