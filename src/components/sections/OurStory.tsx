"use client";

import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { BookOpen } from "lucide-react";
import { SectionShell } from "@/components/viewer/SectionShell";
import { GlassCard } from "@/components/viewer/GlassCard";
import { SectionHeading } from "@/components/viewer/SectionHeading";
import { TimelineItem } from "@/components/viewer/TimelineItem";
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
        <SectionHeading icon={<BookOpen className="h-4 w-4" />}>
          {t("storyTitle")}
        </SectionHeading>
        <ol className="flex flex-col">
          {story.map((item, index) => (
            <TimelineItem key={index} index={index} isLast={index === story.length - 1}>
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
                <Image
                  src={item.image}
                  alt=""
                  width={0}
                  height={0}
                  sizes="(max-width: 640px) 100vw, 480px"
                  className="h-auto w-full rounded-2xl shadow-lg"
                  loading="lazy"
                />
              )}
            </TimelineItem>
          ))}
        </ol>
      </GlassCard>
    </SectionShell>
  );
}
