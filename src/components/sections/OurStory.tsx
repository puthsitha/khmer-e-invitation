"use client";

import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { SectionShell } from "@/components/viewer/SectionShell";
import { GlassCard } from "@/components/viewer/GlassCard";
import { SectionHeading } from "@/components/viewer/SectionHeading";
import { bodyFontStyle, headingFontStyle } from "@/lib/fonts";
import { pickBilingual } from "@/lib/bilingual";
import type { Invitation } from "@/types";

export function OurStory({ invitation }: { invitation: Invitation }) {
  const t = useTranslations("viewer");
  const locale = useLocale();
  const story = Array.isArray(invitation.content.story) ? invitation.content.story : [];

  if (story.length === 0) return null;

  return (
    <SectionShell className="text-maroon">
      <GlassCard>
        <SectionHeading icon="📖">{t("storyTitle")}</SectionHeading>
        <ol className="flex flex-col gap-8 border-l-2 border-gold/40 pl-6 text-left">
          {story.map((item, index) => (
            <li key={index} className="relative">
              <span className="absolute -left-[29px] top-1.5 h-3 w-3 rounded-full bg-gold" />
              <p className="mb-2 text-lg text-maroon" style={headingFontStyle(locale)}>
                {pickBilingual(item.title, locale)}
              </p>
              <p
                className="mb-3 leading-relaxed text-maroon/90"
                style={bodyFontStyle(locale)}
              >
                {pickBilingual(item.description, locale)}
              </p>
              {item.image && (
                <div className="relative h-56 w-full overflow-hidden rounded-2xl shadow-lg">
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, 480px"
                    className="object-cover"
                    loading="lazy"
                  />
                </div>
              )}
            </li>
          ))}
        </ol>
      </GlassCard>
    </SectionShell>
  );
}
