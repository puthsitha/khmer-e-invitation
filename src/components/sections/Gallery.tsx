"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { SectionShell } from "@/components/viewer/SectionShell";
import { SectionHeading } from "@/components/viewer/SectionHeading";
import type { Invitation } from "@/types";

export function Gallery({ invitation }: { invitation: Invitation }) {
  const t = useTranslations("viewer");
  const [selected, setSelected] = useState<number | null>(null);
  const photos = invitation.mediaUrls.gallery;

  if (photos.length === 0) return null;

  return (
    <SectionShell className="text-maroon">
      <SectionHeading icon="🖼️">{t("galleryTitle")}</SectionHeading>
      <div className="grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((url, index) => (
          <button
            key={url}
            type="button"
            onClick={() => setSelected(index)}
            className="relative aspect-square overflow-hidden rounded-xl shadow-lg"
          >
            <Image
              src={url}
              alt=""
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              className="object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {selected !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6"
            onClick={() => setSelected(null)}
          >
            <div className="relative h-[70vh] w-full max-w-2xl">
              <Image
                src={photos[selected]}
                alt=""
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SectionShell>
  );
}
