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
              <p className="font-[family-name:var(--font-heading-en)] text-gold">
                {formatAgendaTime(item.time, locale)}
              </p>
              <TypewriterText
                text={pickBilingual(item.title, locale)}
                style={bodyFontStyle(locale)}
              />
            </TimelineItem>
          ))}
        </ol>
      </GlassCard>
    </SectionShell>
  );
}
