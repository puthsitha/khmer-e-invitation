"use client";

import { useTranslations } from "next-intl";
import { SectionShell } from "@/components/viewer/SectionShell";
import type { Invitation } from "@/types";

export function Agenda({ invitation }: { invitation: Invitation }) {
  const t = useTranslations("viewer");
  const agenda = invitation.content.agenda ?? [];

  if (agenda.length === 0) return null;

  return (
    <SectionShell className="bg-cream text-maroon">
      <p className="text-sm uppercase tracking-widest text-gold">
        {t("agendaTitle")}
      </p>
      <ol className="flex w-full max-w-md flex-col gap-4">
        {agenda.map((item, index) => (
          <li
            key={`${item.time}-${index}`}
            className="flex items-center justify-between border-b border-gold/30 pb-2"
          >
            <span className="font-medium text-gold">{item.time}</span>
            <span className="font-[family-name:var(--font-body-km)]">
              {item.label}
            </span>
          </li>
        ))}
      </ol>
    </SectionShell>
  );
}
