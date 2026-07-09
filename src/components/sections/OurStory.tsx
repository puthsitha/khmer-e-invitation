"use client";

import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { SectionShell } from "@/components/viewer/SectionShell";
import { pickBilingual } from "@/lib/bilingual";
import type { Invitation } from "@/types";

export function OurStory({ invitation }: { invitation: Invitation }) {
  const t = useTranslations("viewer");
  const locale = useLocale();
  const story = Array.isArray(invitation.content.story) ? invitation.content.story : [];

  if (story.length === 0) return null;

  return (
    <SectionShell className="bg-maroon text-cream">
      <p className="text-sm uppercase tracking-widest text-gold">
        {t("storyTitle")}
      </p>
      <div className="flex w-full max-w-xl flex-col gap-10">
        {story.map((item, index) => (
          <div key={index} className="flex flex-col items-center gap-4">
            {item.image && (
              <div className="relative h-48 w-full max-w-sm overflow-hidden rounded-xl">
                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, 400px"
                  className="object-cover"
                  loading="lazy"
                />
              </div>
            )}
            <p className="font-[family-name:var(--font-heading-km)] text-xl text-gold">
              {pickBilingual(item.title, locale)}
            </p>
            <p className="font-[family-name:var(--font-body-km)] leading-relaxed">
              {pickBilingual(item.description, locale)}
            </p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
