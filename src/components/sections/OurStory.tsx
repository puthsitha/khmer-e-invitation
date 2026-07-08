"use client";

import { useTranslations } from "next-intl";
import { SectionShell } from "@/components/viewer/SectionShell";
import type { Invitation } from "@/types";

export function OurStory({ invitation }: { invitation: Invitation }) {
  const t = useTranslations("viewer");
  const story = invitation.content.story;

  if (!story) return null;

  return (
    <SectionShell className="bg-maroon text-cream">
      <p className="text-sm uppercase tracking-widest text-gold">
        {t("storyTitle")}
      </p>
      <p className="max-w-xl font-[family-name:var(--font-body-km)] leading-relaxed">
        {story}
      </p>
    </SectionShell>
  );
}
