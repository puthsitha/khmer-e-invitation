"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, ExternalLink, X, Film, CheckCircle2 } from "lucide-react";
import { toBackgroundEmbedUrl } from "@/lib/embed";

interface VideoPreviewCardProps {
  url?: string;
  onClear?: () => void;
  labels: {
    previewTitle: string;
    previewEmpty: string;
    previewHint: string;
    validYoutube: string;
    validVimeo: string;
    openLink: string;
    clear: string;
  };
}

export function VideoPreviewCard({
  url = "",
  onClear,
  labels,
}: VideoPreviewCardProps) {
  const embedUrl = useMemo(() => (url ? toBackgroundEmbedUrl(url) : null), [url]);

  const isYoutube = url.includes("youtube.com") || url.includes("youtu.be");
  const isVimeo = url.includes("vimeo.com");

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gold/30 bg-cream/30 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold/20 text-maroon">
            <Film className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold text-maroon">
            {labels.previewTitle}
          </span>
        </div>

        {embedUrl && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="h-3 w-3" />
              {isYoutube ? labels.validYoutube : isVimeo ? labels.validVimeo : "Video Ready"}
            </span>

            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-gold/40 bg-white px-2.5 py-1 text-xs font-medium text-maroon transition-colors hover:bg-gold/15"
              title={labels.openLink}
            >
              <ExternalLink className="h-3 w-3" />
              <span className="hidden sm:inline">{labels.openLink}</span>
            </a>

            {onClear && (
              <button
                type="button"
                onClick={onClear}
                className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                title={labels.clear}
              >
                <X className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{labels.clear}</span>
              </button>
            )}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {embedUrl ? (
          <motion.div
            key="video-player"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden rounded-xl border border-gold/30 bg-black shadow-md"
          >
            <div className="relative aspect-video w-full">
              <iframe
                src={embedUrl}
                title="Cover Video Preview"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="video-empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gold/40 bg-white/70 px-4 py-8 text-center"
          >
            <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-gold">
              <Video className="h-6 w-6" />
            </span>
            <p className="max-w-sm text-xs font-medium text-maroon/70">
              {labels.previewEmpty}
            </p>
            <p className="mt-1 text-[11px] text-maroon/50">
              {labels.previewHint}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
