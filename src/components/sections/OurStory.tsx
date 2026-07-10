"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence } from "framer-motion";
import Image from "next/image";
import { BookOpen } from "lucide-react";
import { SectionShell } from "@/components/viewer/SectionShell";
import { GlassCard } from "@/components/viewer/GlassCard";
import { SectionHeading } from "@/components/viewer/SectionHeading";
import { TimelineItem } from "@/components/viewer/TimelineItem";
import { ImageLightbox } from "@/components/viewer/ImageLightbox";
import { TypewriterText } from "@/components/viewer/TypewriterText";
import { bodyFontStyle, headingFontStyle } from "@/lib/fonts";
import { pickBilingual } from "@/lib/bilingual";
import type { Invitation } from "@/types";

export function OurStory({ invitation }: { invitation: Invitation }) {
  const t = useTranslations("viewer");
  const locale = useLocale();
  const story = Array.isArray(invitation.content.story) ? invitation.content.story : [];
  const [selected, setSelected] = useState<number | null>(null);

  const storyImages = story
    .map((item) => item.image)
    .filter((image): image is string => Boolean(image));

  let imageCounter = -1;
  const items = story.map((item) => ({
    item,
    imageIndex: item.image ? ++imageCounter : -1,
  }));

  if (story.length === 0) return null;

  return (
    <SectionShell className="text-maroon">
      <GlassCard>
        <SectionHeading icon={<BookOpen className="h-4 w-4" />} dividerVariant={6}>
          {t("storyTitle")}
        </SectionHeading>
        <ol className="flex flex-col">
          {items.map(({ item, imageIndex }, index) => (
            <TimelineItem key={index} index={index} isLast={index === story.length - 1}>
              <p className="mb-2 text-lg text-maroon" style={headingFontStyle(locale)}>
                {pickBilingual(item.title, locale)}
              </p>
              <TypewriterText
                text={pickBilingual(item.description, locale)}
                className="mb-3 leading-relaxed text-maroon/90"
                style={bodyFontStyle(locale)}
              />
              {item.image && (
                <button
                  type="button"
                  onClick={() => setSelected(imageIndex)}
                  className="block w-full"
                >
                  <Image
                    src={item.image}
                    alt=""
                    width={0}
                    height={0}
                    sizes="(max-width: 640px) 100vw, 480px"
                    className="h-auto w-full rounded-2xl shadow-lg transition-transform hover:scale-[1.02]"
                    loading="lazy"
                  />
                </button>
              )}
            </TimelineItem>
          ))}
        </ol>
      </GlassCard>

      <AnimatePresence>
        {selected !== null && (
          <ImageLightbox
            photos={storyImages}
            index={selected}
            onClose={() => setSelected(null)}
            onChangeIndex={setSelected}
          />
        )}
      </AnimatePresence>
    </SectionShell>
  );
}
