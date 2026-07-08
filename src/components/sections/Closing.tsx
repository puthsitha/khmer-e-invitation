"use client";

import { useTranslations } from "next-intl";
import { SectionShell } from "@/components/viewer/SectionShell";
import { OrnamentDivider } from "@/components/ui/OrnamentDivider";
import type { Invitation } from "@/types";

export function Closing({ invitation }: { invitation: Invitation }) {
  const t = useTranslations("viewer");
  const names = [invitation.content.groomName, invitation.content.brideName]
    .filter(Boolean)
    .join(" & ");
  const date = new Date(invitation.eventDate).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <SectionShell className="bg-maroon text-cream">
      <OrnamentDivider />
      <h2 className="font-[family-name:var(--font-heading-km)] text-3xl text-gold">
        {names}
      </h2>
      <p className="text-cream/80">{date}</p>
      <p className="font-[family-name:var(--font-body-km)] text-sm text-cream/70">
        {t("closingSignoff")}
      </p>
      <OrnamentDivider />
    </SectionShell>
  );
}
