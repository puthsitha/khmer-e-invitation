"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, UploadCloud, Trash2, Volume2, AlertCircle } from "lucide-react";

const DEFAULT_AUDIO_ACCEPT =
  "audio/mpeg,audio/mp3,audio/wav,audio/x-m4a,audio/aac,audio/ogg,audio/mp4,.mp3,.wav,.m4a,.aac,.ogg";

interface AudioUploadManagerProps {
  audioUrl?: string;
  onUpload: (file: File) => Promise<void> | void;
  onRemove: () => Promise<void> | void;
  accept?: string;
  labels: {
    musicTitle: string;
    musicNote: string;
    dropzoneTitle: string;
    dropzoneReplaceTitle?: string;
    browseFiles: string;
    uploading: string;
    supportsNote: string;
    removeAudio: string;
    currentAudio?: string;
    removing?: string;
    invalidAudioType?: string;
  };
}

export function AudioUploadManager({
  audioUrl,
  onUpload,
  onRemove,
  accept = DEFAULT_AUDIO_ACCEPT,
  labels,
}: AudioUploadManagerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function isAudioFile(file: File): boolean {
    if (file.type && file.type.startsWith("audio/")) return true;
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    return [".mp3", ".wav", ".m4a", ".aac", ".ogg", ".mp4"].includes(ext);
  }

  async function processFile(file: File | undefined) {
    if (!file) return;
    setErrorMessage(null);

    if (!isAudioFile(file)) {
      setErrorMessage(
        labels.invalidAudioType ||
          "Please upload a valid audio file (MP3, M4A, WAV, AAC, OGG).",
      );
      return;
    }

    setIsUploading(true);
    try {
      await onUpload(file);
    } catch (err) {
      console.error("Failed to upload audio:", err);
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to upload audio track.",
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
      processFile(e.dataTransfer.files[0]);
    }
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  }

  async function handleRemove() {
    if (!audioUrl || isRemoving || isUploading) return;
    setErrorMessage(null);
    setIsRemoving(true);
    try {
      await onRemove();
    } catch (err) {
      console.error("Failed to remove audio:", err);
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to remove audio track.",
      );
    } finally {
      setIsRemoving(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gold/30 dark:border-gold/20 bg-cream/20 dark:bg-white/5 p-5">
      {/* Header with Title and Remove Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold/20 dark:bg-gold/25 text-maroon dark:text-[#f6eee8]">
            <Music className="h-4 w-4" />
          </span>
          <div>
            <h4 className="text-sm font-semibold text-maroon dark:text-[#f6eee8]">
              {labels.musicTitle}
            </h4>
            <p className="text-xs text-maroon/60 dark:text-[#f6eee8]/60">
              {labels.musicNote}
            </p>
          </div>
        </div>

        {audioUrl && !isUploading && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={isRemoving}
            className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50 transition-colors"
          >
            {isRemoving ? (
              <svg
                className="h-3.5 w-3.5 animate-spin text-red-600 dark:text-red-400"
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
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            <span>{isRemoving ? labels.removing || labels.removeAudio : labels.removeAudio}</span>
          </button>
        )}
      </div>

      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        disabled={isUploading || isRemoving}
      />

      {/* Drag & Drop Zone */}
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
          {/* Animated Icon / Spinner */}
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

          {/* Text Labels */}
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm font-medium text-maroon dark:text-[#f6eee8]">
              {isUploading ? (
                <span className="font-semibold text-maroon dark:text-gold">
                  {labels.uploading}
                </span>
              ) : (
                <>
                  {audioUrl
                    ? labels.dropzoneReplaceTitle || labels.dropzoneTitle
                    : labels.dropzoneTitle}{" "}
                  <span className="font-semibold text-maroon dark:text-gold underline decoration-gold underline-offset-4 hover:text-gold transition-colors">
                    {labels.browseFiles}
                  </span>
                </>
              )}
            </p>
            <p className="text-[11px] text-maroon/50 dark:text-[#f6eee8]/50">
              {labels.supportsNote}
            </p>
          </div>

          {/* Processing badge when uploading */}
          {isUploading && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 flex items-center gap-2 rounded-full bg-gold/20 dark:bg-gold/25 px-3 py-1 text-xs font-medium text-maroon dark:text-gold"
            >
              <span className="h-2 w-2 rounded-full bg-maroon dark:bg-gold animate-ping" />
              <span>{labels.uploading}</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Error Message Display */}
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

      {/* Current Active Audio Player */}
      {audioUrl && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-2 rounded-xl border border-gold/30 dark:border-gold/20 bg-white dark:bg-[#20181e] p-3.5 shadow-xs"
        >
          <div className="flex items-center justify-between text-xs text-maroon/70 dark:text-[#f6eee8]/70">
            <span className="flex items-center gap-1.5 font-semibold text-maroon dark:text-[#f6eee8]">
              <Volume2 className="h-3.5 w-3.5 text-gold" />
              <span>{labels.currentAudio || "Current Track"}</span>
            </span>
          </div>
          <audio
            className="w-full rounded-lg"
            controls
            src={audioUrl}
            preload="metadata"
          />
        </motion.div>
      )}
    </div>
  );
}
