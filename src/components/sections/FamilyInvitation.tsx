"use client";

import { useLocale, useTranslations } from "next-intl";
import { SectionShell } from "@/components/viewer/SectionShell";
import { OrnamentDivider } from "@/components/ui/OrnamentDivider";
import { pickBilingual } from "@/lib/bilingual";
import type { FamilyMembers, Invitation } from "@/types";

function FamilyBlock({
  heading,
  family,
  locale,
}: {
  heading: string;
  family?: FamilyMembers;
  locale: string;
}) {
  const father = pickBilingual(family?.father, locale);
  const mother = pickBilingual(family?.mother, locale);

  if (!father && !mother) return null;

  return (
    <div>
      <p className="mb-2 text-sm uppercase tracking-widest text-gold">{heading}</p>
      <p className="font-[family-name:var(--font-body-km)]">
        {[father, mother].filter(Boolean).join(" & ")}
      </p>
    </div>
  );
}

export function FamilyInvitation({ invitation }: { invitation: Invitation }) {
  const t = useTranslations("viewer");
  const locale = useLocale();
  const { groomFamily, brideFamily, invitationText } = invitation.content;
  const text = pickBilingual(invitationText, locale);

  return (
    <SectionShell className="bg-cream text-maroon">
      <div className="grid w-full max-w-2xl grid-cols-1 gap-8 sm:grid-cols-2">
        <FamilyBlock heading={t("groomFamily")} family={groomFamily} locale={locale} />
        <FamilyBlock heading={t("brideFamily")} family={brideFamily} locale={locale} />
      </div>

      <OrnamentDivider />

      {text && (
        <p className="max-w-xl font-[family-name:var(--font-body-km)] leading-relaxed">
          {text}
        </p>
      )}
    </SectionShell>
  );
}
