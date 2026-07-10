"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

/** Full-image preview overlay with swipe/drag and prev-next navigation,
 * shared by any section that wants tap-to-zoom on its photos. */
export function ImageLightbox({
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
