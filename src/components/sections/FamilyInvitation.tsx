"use client";

import { useLocale, useTranslations } from "next-intl";
import { SectionShell } from "@/components/viewer/SectionShell";
import { GlassCard } from "@/components/viewer/GlassCard";
import { bodyFontStyle } from "@/lib/fonts";
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
      <p className="mb-2 text-xs uppercase tracking-widest text-gold">{heading}</p>
      <div className="flex flex-col gap-1" style={bodyFontStyle(locale)}>
        {father && <p>{father}</p>}
        {mother && <p>{mother}</p>}
      </div>
    </div>
  );
}

export function FamilyInvitation({ invitation }: { invitation: Invitation }) {
  const t = useTranslations("viewer");
  const locale = useLocale();
  const { groomFamily, brideFamily, invitationText } = invitation.content;
  const text = pickBilingual(invitationText, locale);

  return (
    <SectionShell className="text-maroon">
      <GlassCard className="flex flex-col items-center gap-8">
        <div className="grid w-full grid-cols-1 gap-8 sm:grid-cols-2 sm:divide-x sm:divide-gold/30">
          <FamilyBlock heading={t("groomFamily")} family={groomFamily} locale={locale} />
          <div className="sm:pl-8">
            <FamilyBlock heading={t("brideFamily")} family={brideFamily} locale={locale} />
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <p className="text-sm uppercase tracking-widest text-maroon">
            {t("invitationHeading")}
          </p>
          {text && (
            <p
              className="max-w-xl leading-relaxed text-maroon/90"
              style={bodyFontStyle(locale)}
            >
              {text}
            </p>
          )}
        </div>
      </GlassCard>
    </SectionShell>
  );
}
