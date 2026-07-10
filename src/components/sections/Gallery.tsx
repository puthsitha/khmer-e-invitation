"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { Images } from "lucide-react";
import { SectionShell } from "@/components/viewer/SectionShell";
import { SectionHeading } from "@/components/viewer/SectionHeading";
import { ImageLightbox } from "@/components/viewer/ImageLightbox";
import type { Invitation } from "@/types";

const ORBIT_RADIUS_PERCENT = 40;
const ORBIT_DURATION_SECONDS = 50;

function OrbitGallery({
  photos,
  onSelect,
}: {
  photos: string[];
  onSelect: (index: number) => void;
}) {
  const reduceMotion = useReducedMotion();
  const thumbSizeClass =
    photos.length > 8
      ? "h-16 w-16 sm:h-20 sm:w-20"
      : "h-28 w-28 sm:h-36 sm:w-36";

  return (
    <div className="relative mx-auto aspect-square w-full max-w-md sm:max-w-lg">
      <motion.div
        className="absolute inset-0"
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={
          reduceMotion
            ? undefined
            : {
                repeat: Infinity,
                ease: "linear",
                duration: ORBIT_DURATION_SECONDS,
              }
        }
      >
        {photos.map((url, index) => {
          const angle =
            -Math.PI / 2 + (2 * Math.PI * index) / photos.length;
          const left = 50 + Math.cos(angle) * ORBIT_RADIUS_PERCENT;
          const top = 50 + Math.sin(angle) * ORBIT_RADIUS_PERCENT;

          return (
            <motion.div
              key={url}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${left}%`, top: `${top}%` }}
              animate={reduceMotion ? undefined : { rotate: -360 }}
              transition={
                reduceMotion
                  ? undefined
                  : {
                      repeat: Infinity,
                      ease: "linear",
                      duration: ORBIT_DURATION_SECONDS,
                    }
              }
            >
              <button
                type="button"
                onClick={() => onSelect(index)}
                className={`relative ${thumbSizeClass} overflow-hidden rounded-full border-2 border-gold/60 shadow-lg transition-transform hover:scale-105`}
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  sizes="144px"
                  className="object-cover"
                  loading="lazy"
                />
              </button>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 drop-shadow-md sm:h-12 sm:w-12">
        <Image src="/images/Frame_1.png" alt="" fill sizes="48px" className="object-contain" aria-hidden />
      </div>
    </div>
  );
}

export function Gallery({ invitation }: { invitation: Invitation }) {
  const t = useTranslations("viewer");
  const [selected, setSelected] = useState<number | null>(null);
  const photos = invitation.mediaUrls.gallery;

  if (photos.length === 0) return null;

  return (
    <SectionShell className="text-maroon">
      <SectionHeading icon={<Images className="h-4 w-4" />}>
        {t("galleryTitle")}
      </SectionHeading>

      <OrbitGallery photos={photos} onSelect={setSelected} />

      <AnimatePresence>
        {selected !== null && (
          <ImageLightbox
            photos={photos}
            index={selected}
            onClose={() => setSelected(null)}
            onChangeIndex={setSelected}
          />
        )}
      </AnimatePresence>
    </SectionShell>
  );
}
