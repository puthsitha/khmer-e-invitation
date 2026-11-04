"use client";

import { useLocale, useTranslations } from "next-intl";
import { Clock } from "lucide-react";
import { SectionShell } from "@/components/viewer/SectionShell";
import { GlassCard } from "@/components/viewer/GlassCard";
import { SectionHeading } from "@/components/viewer/SectionHeading";
import { TimelineItem } from "@/components/viewer/TimelineItem";
import { TypewriterText } from "@/components/viewer/TypewriterText";
import { bodyFontStyle } from "@/lib/fonts";
import { pickBilingual } from "@/lib/bilingual";
import { formatAgendaTime } from "@/lib/formatTime";
import type { Invitation } from "@/types";

export function Agenda({ invitation }: { invitation: Invitation }) {
  const t = useTranslations("viewer");
  const locale = useLocale();
  const agenda = Array.isArray(invitation.content.agenda) ? invitation.content.agenda : [];

  if (agenda.length === 0) return null;

  return (
    <SectionShell className="text-maroon">
      <GlassCard>
        <SectionHeading icon={<Clock className="h-4 w-4" />} dividerVariant={5}>
          {t("agendaTitle")}
        </SectionHeading>
        <ol className="flex flex-col">
          {agenda.map((item, index) => (
            <TimelineItem
              key={`${item.time}-${index}`}
              index={index}
              isLast={index === agenda.length - 1}
            >
              <div className="mb-2">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border border-gold/50 bg-gold/15 px-3 py-0.5 text-sm @sm:text-base font-bold tracking-wide text-gold lining-nums tabular-nums shadow-2xs"
                  style={{ ...bodyFontStyle(locale), fontWeight: 700 }}
                >
                  <Clock className="h-3.5 w-3.5 shrink-0 text-gold" />
                  <span>{formatAgendaTime(item.time, locale)}</span>
                </span>
              </div>
              <TypewriterText
                text={pickBilingual(item.title, locale)}
                className="text-[15px] @sm:text-base font-medium leading-[1.85] text-maroon"
                style={bodyFontStyle(locale)}
              />
            </TimelineItem>
          ))}
        </ol>
      </GlassCard>
    </SectionShell>
  );
}
