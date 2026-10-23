"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  Image as ImageIcon,
  UploadCloud,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { VideoPreviewCard } from "@/components/dashboard/VideoPreviewCard";

interface CoverBackdropManagerProps {
  mediaType?: "video" | "photo";
  videoUrl?: string;
  imageUrl?: string;
  onChangeMediaType: (type: "video" | "photo") => Promise<void> | void;
  onSaveVideoUrl: (url: string) => Promise<void> | void;
  onUploadImage: (file: File) => Promise<void> | void;
  onRemoveImage: () => Promise<void> | void;
  inputClassName?: string;
  labels: {
    backdropTitle: string;
    typeVideo: string;
    typePhoto: string;
    coverVideo: string;
    coverVideoPlaceholder: string;
    videoPreviewTitle: string;
    videoPreviewEmpty: string;
    videoPreviewHint: string;
    videoValidYoutube: string;
    videoValidVimeo: string;
    openVideoLink: string;
    clearVideo: string;
    photoPreviewTitle: string;
    photoPreviewEmpty: string;
    photoPreviewHint: string;
    photoValid: string;
    removePhoto: string;
    changePhoto: string;
    dragDropPhoto: string;
    browseFiles: string;
    uploadingPhoto: string;
    photoSupportsHint: string;
  };
}

export function CoverBackdropManager({
  mediaType = "video",
  videoUrl = "",
  imageUrl = "",
  onChangeMediaType,
  onSaveVideoUrl,
  onUploadImage,
  onRemoveImage,
  inputClassName = "",
  labels,
}: CoverBackdropManagerProps) {
  const [selectedType, setSelectedType] = useState<"video" | "photo">(mediaType);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync internal type state if parent prop updates
  if (mediaType && mediaType !== selectedType && !isUploading && !isRemoving) {
    setSelectedType(mediaType);
  }

  async function handleTypeSwitch(newType: "video" | "photo") {
    if (newType === selectedType || isUploading || isRemoving) return;
    setSelectedType(newType);
    await onChangeMediaType(newType);
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setErrorMessage(null);
    setIsUploading(true);
    try {
      await onUploadImage(file);
    } catch (err) {
      console.error("Cover image upload failed:", err);
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to upload cover image.",
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploading && !isRemoving) {
      setIsDragging(true);
    }
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isUploading || isRemoving) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  }

  async function handleRemovePhoto() {
    if (!imageUrl || isRemoving || isUploading) return;
    setErrorMessage(null);
    setIsRemoving(true);
    try {
      await onRemoveImage();
    } catch (err) {
      console.error("Remove cover image failed:", err);
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to remove cover image.",
      );
    } finally {
      setIsRemoving(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Top Segmented Option Selector: Video vs Photo */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-maroon/70 dark:text-[#f6eee8]/70">
          {labels.backdropTitle}
        </span>
        <div className="inline-flex max-w-sm rounded-xl border border-gold/40 dark:border-gold/30 bg-cream/40 dark:bg-white/5 p-1 gap-1">
          <button
            type="button"
            onClick={() => handleTypeSwitch("video")}
            className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
              selectedType === "video"
                ? "bg-maroon text-cream dark:bg-gold dark:text-maroon shadow-xs"
                : "text-maroon/70 dark:text-[#f6eee8]/70 hover:text-maroon dark:hover:text-gold hover:bg-gold/10"
            }`}
          >
            <Video className="h-3.5 w-3.5" />
            <span>{labels.typeVideo}</span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeSwitch("photo")}
            className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
              selectedType === "photo"
                ? "bg-maroon text-cream dark:bg-gold dark:text-maroon shadow-xs"
                : "text-maroon/70 dark:text-[#f6eee8]/70 hover:text-maroon dark:hover:text-gold hover:bg-gold/10"
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span>{labels.typePhoto}</span>
          </button>
        </div>
      </div>

      {/* OPTION 1: VIDEO (Keep the same) */}
      {selectedType === "video" && (
        <motion.div
          key="type-video"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col gap-3"
        >
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-maroon dark:text-[#f6eee8]">
            <div className="flex items-center gap-1.5">
              <Video className="h-4 w-4 text-gold" />
              <span>{labels.coverVideo}</span>
            </div>
            <input
              type="url"
              defaultValue={videoUrl}
              placeholder={labels.coverVideoPlaceholder}
              onBlur={(e) => onSaveVideoUrl(e.target.value)}
              className={inputClassName}
            />
          </label>

          <VideoPreviewCard
            url={videoUrl}
            onClear={() => onSaveVideoUrl("")}
            labels={{
              previewTitle: labels.videoPreviewTitle,
              previewEmpty: labels.videoPreviewEmpty,
              previewHint: labels.videoPreviewHint,
              validYoutube: labels.videoValidYoutube,
              validVimeo: labels.videoValidVimeo,
              openLink: labels.openVideoLink,
              clear: labels.clearVideo,
            }}
          />
        </motion.div>
      )}

      {/* OPTION 2: PHOTO (Upload image & live preview) */}
      {selectedType === "photo" && (
        <motion.div
          key="type-photo"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col gap-3 rounded-2xl border border-gold/30 dark:border-gold/20 bg-cream/30 dark:bg-white/5 p-4 sm:p-5"
        >
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold/20 dark:bg-gold/25 text-maroon dark:text-gold">
                <ImageIcon className="h-4 w-4" />
              </span>
              <span className="text-sm font-semibold text-maroon dark:text-[#f6eee8]">
                {labels.photoPreviewTitle}
              </span>
            </div>

            {imageUrl && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>{labels.photoValid}</span>
                </span>

                <a
                  href={imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-gold/40 dark:border-gold/30 bg-white dark:bg-[#20181e] px-2.5 py-1 text-xs font-medium text-maroon dark:text-[#f6eee8] transition-colors hover:bg-gold/15"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span className="hidden sm:inline">Open</span>
                </a>

                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={isRemoving || isUploading}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-red-200 dark:border-red-800 bg-white dark:bg-[#20181e] px-2.5 py-1 text-xs font-medium text-red-600 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-50"
                  title={labels.removePhoto}
                >
                  {isRemoving ? (
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  <span className="hidden sm:inline">{labels.removePhoto}</span>
                </button>
              </div>
            )}
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleInputChange}
            className="hidden"
            disabled={isUploading || isRemoving}
          />

          {/* Upload Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isUploading && !isRemoving && fileInputRef.current?.click()}
            className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 ${
              isUploading || isRemoving
                ? "cursor-wait border-gold/40 bg-gold/5 dark:bg-gold/10 opacity-90"
                : isDragging
                  ? "scale-[1.01] cursor-copy border-maroon dark:border-gold bg-gold/15 dark:bg-gold/20 shadow-md"
                  : "cursor-pointer border-gold/50 dark:border-gold/30 bg-white/60 dark:bg-[#20181e]/60 hover:border-maroon/70 dark:hover:border-gold hover:bg-gold/5"
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <motion.div
                whileHover={isUploading || isRemoving ? undefined : { scale: 1.08 }}
                className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-xs transition-colors ${
                  isUploading
                    ? "bg-maroon text-cream dark:bg-gold dark:text-maroon ring-4 ring-gold/30 animate-pulse"
                    : "bg-gold/20 dark:bg-gold/25 text-maroon dark:text-gold group-hover:bg-maroon group-hover:text-cream dark:group-hover:bg-gold dark:group-hover:text-maroon"
                }`}
              >
                {isUploading ? (
                  <svg
                    className="h-6 w-6 animate-spin text-cream dark:text-maroon"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-90"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  <UploadCloud className="h-6 w-6" />
                )}
              </motion.div>

              <div className="flex flex-col items-center gap-1">
                <p className="text-sm font-medium text-maroon dark:text-[#f6eee8]">
                  {isUploading ? (
                    <span className="font-semibold text-maroon dark:text-gold">
                      {labels.uploadingPhoto}
                    </span>
                  ) : (
                    <>
                      {imageUrl ? labels.changePhoto : labels.dragDropPhoto}{" "}
                      <span className="font-semibold text-maroon dark:text-gold underline decoration-gold underline-offset-4 hover:text-gold transition-colors">
                        {labels.browseFiles}
                      </span>
                    </>
                  )}
                </p>
                <p className="text-[11px] text-maroon/50 dark:text-[#f6eee8]/50">
                  {labels.photoSupportsHint}
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 p-3 text-xs font-medium text-red-700 dark:text-red-300"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500 dark:text-red-400" />
                <span>{errorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Photo Live Preview */}
          {imageUrl ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden rounded-xl border border-gold/30 bg-black/90 shadow-md relative"
            >
              <div className="relative aspect-video w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Cover Backdrop Preview"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-cream/20 backdrop-blur-[1px] pointer-events-none" />
                <div className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-[10px] font-medium text-white/90 backdrop-blur-xs">
                  {labels.photoPreviewHint}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="rounded-xl border border-dashed border-gold/40 dark:border-gold/25 bg-gold/5 dark:bg-white/2 p-6 text-center text-xs text-maroon/60 dark:text-[#f6eee8]/60">
              <p className="font-semibold text-maroon dark:text-[#f6eee8]">
                {labels.photoPreviewEmpty}
              </p>
              <p className="mt-1 text-[11px] text-maroon/50 dark:text-[#f6eee8]/50">
                {labels.photoPreviewHint}
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
