"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ExternalLink } from "lucide-react";

const emptySubscribe = () => () => {};

/** Full-image preview overlay with swipe/drag and prev-next navigation,
 * portaled to document.body for true full-screen overlay. */
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
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const goNext = () => onChangeIndex((index + 1) % photos.length);
  const goPrev = () => onChangeIndex((index - 1 + photos.length) % photos.length);

  // Keyboard navigation: Escape to close, Arrow keys to navigate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && photos.length > 1) {
        goPrev();
      } else if (e.key === "ArrowRight" && photos.length > 1) {
        goNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  if (!mounted || photos.length === 0) return null;

  const currentPhoto = photos[index] || photos[0];

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md select-none"
      onClick={onClose}
    >
      {/* Top Controls Bar */}
      <div className="absolute left-4 right-4 top-4 z-10 flex items-center justify-between pointer-events-none">
        {/* Counter Badge */}
        {photos.length > 1 ? (
          <span className="rounded-full bg-white/15 px-3.5 py-1 text-xs font-semibold text-cream backdrop-blur-md pointer-events-auto">
            {index + 1} / {photos.length}
          </span>
        ) : (
          <span />
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {currentPhoto && (
            <a
              href={currentPhoto}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title="Open full image in new tab"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-cream transition-colors hover:bg-white/25 cursor-pointer"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-cream transition-colors hover:bg-white/25 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Previous / Next Buttons */}
      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label="Previous photo"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-cream backdrop-blur-xs transition-all hover:bg-white/25 hover:scale-105 active:scale-95 cursor-pointer sm:left-6"
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
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-cream backdrop-blur-xs transition-all hover:bg-white/25 hover:scale-105 active:scale-95 cursor-pointer sm:right-6"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Center Image Container */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={index}
          className="relative flex h-[80vh] w-full max-w-4xl items-center justify-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          drag={photos.length > 1 ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.3}
          onClick={(e) => e.stopPropagation()}
          onDragEnd={(_, info) => {
            if (info.offset.x < -60) goNext();
            else if (info.offset.x > 60) goPrev();
          }}
        >
          <Image
            src={currentPhoto}
            alt={`Preview ${index + 1}`}
            fill
            sizes="(max-width: 1024px) 95vw, 1000px"
            className="object-contain drop-shadow-2xl"
            draggable={false}
            unoptimized
            priority
          />
        </motion.div>
      </AnimatePresence>
    </motion.div>,
    document.body
  );
}
