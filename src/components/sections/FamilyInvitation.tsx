"use client";

import Image from "next/image";
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
    <div className="flex flex-col items-center text-center min-w-0">
      <p
        className="mb-4 @xl:mb-5 text-xs @xl:text-sm font-semibold text-gold"
        style={bodyFontStyle(locale)}
      >
        {heading}
      </p>
      <div
        className="flex flex-col gap-3.5 @xl:gap-4 text-[15px] @xl:text-lg font-bold leading-normal text-maroon"
        style={{ ...bodyFontStyle(locale), fontWeight: 700 }}
      >
        {father && <p className="font-bold whitespace-nowrap">{father}</p>}
        {mother && <p className="font-bold whitespace-nowrap">{mother}</p>}
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
      <GlassCard className="flex flex-col items-center gap-10 @xl:gap-12 px-5 py-8 @xl:px-10 @xl:py-11">
        <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-3 @xl:gap-8">
          <FamilyBlock
            heading={t("groomFamily")}
            family={groomFamily}
            locale={locale}
          />
          <div className="relative h-20 w-5 shrink-0 self-center @xl:h-28 @xl:w-8">
            <Image
              src="/images/vertical_divider.png"
              alt=""
              fill
              sizes="32px"
              className="object-contain"
              aria-hidden
            />
          </div>
          <FamilyBlock
            heading={t("brideFamily")}
            family={brideFamily}
            locale={locale}
          />
        </div>

        <div className="flex w-full flex-col items-center gap-5 @xl:gap-6">
          <p
            className="text-sm @xl:text-base font-semibold text-gold mt-3"
            style={bodyFontStyle(locale)}
          >
            {t("invitationHeading")}
          </p>
          {text && (
            <p
              className="w-full max-w-lg @xl:max-w-xl px-1 @xl:px-4 text-[15px] @xl:text-[17px] leading-[2.3] text-maroon/95"
              style={{ ...bodyFontStyle(locale), lineHeight: 2.3 }}
            >
              {text}
            </p>
          )}
        </div>
      </GlassCard>
    </SectionShell>
  );
}
