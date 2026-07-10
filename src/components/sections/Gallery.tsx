"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";
import { SectionShell } from "@/components/viewer/SectionShell";
import { SectionHeading } from "@/components/viewer/SectionHeading";
import type { Invitation } from "@/types";

const ORBIT_RADIUS_PERCENT = 38;
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
      ? "h-14 w-14 sm:h-16 sm:w-16"
      : "h-20 w-20 sm:h-24 sm:w-24";

  return (
    <div className="relative mx-auto aspect-square w-full max-w-sm">
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
                  sizes="128px"
                  className="object-cover"
                  loading="lazy"
                />
              </button>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold" />
    </div>
  );
}

function Lightbox({
  photos,
  index,
  onClose,
  onChangeIndex,
}: {
  photos: string[];
  index: number;
  onClose: () => void;
  onChangeIndex: (index: number) => void;
}) {
  const goNext = () => onChangeIndex((index + 1) % photos.length);
  const goPrev = () => onChangeIndex((index - 1 + photos.length) % photos.length);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close preview"
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-cream"
      >
        <X className="h-5 w-5" />
      </button>

      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label="Previous photo"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-cream sm:left-4"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            aria-label="Next photo"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-cream sm:right-4"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={index}
          className="relative h-[70vh] w-full max-w-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          drag={photos.length > 1 ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.3}
          onClick={(e) => e.stopPropagation()}
          onDragEnd={(_, info) => {
            if (info.offset.x < -80) goNext();
            else if (info.offset.x > 80) goPrev();
          }}
        >
          <Image
            src={photos[index]}
            alt=""
            fill
            sizes="100vw"
            className="object-contain"
            draggable={false}
          />
        </motion.div>
      </AnimatePresence>
    </motion.div>
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
          <Lightbox
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
