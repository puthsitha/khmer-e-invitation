"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Image as ImageIcon, Trash2, Plus, Sparkles, Eye } from "lucide-react";
import { ImageLightbox } from "@/components/viewer/ImageLightbox";

interface ImageUploadManagerProps {
  images: string[];
  onUpload: (files: FileList) => Promise<void> | void;
  onRemove: (url: string) => Promise<void> | void;
  multiple?: boolean;
  accept?: string;
  note?: string;
  labels: {
    dropzoneTitle: string;
    browseFiles: string;
    uploading: string;
    removeImage: string;
    coverPhotoBadge?: string;
    addImage?: string;
    supportsNote?: string;
    imagesCount?: string;
  };
}

export function ImageUploadManager({
  images,
  onUpload,
  onRemove,
  multiple = true,
  accept = "image/jpeg,image/png,image/webp",
  note,
  labels,
}: ImageUploadManagerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      await onUpload(files);
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
    setIsDragging(true);
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    handleFiles(e.target.files);
  }

  return (
    <div className="flex flex-col gap-4">
      {note && <p className="text-xs text-maroon/70 font-medium">{note}</p>}

      {/* Hidden native input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Drag and Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? "border-maroon bg-gold/10 scale-[1.01]"
            : "border-gold/50 bg-white/60 hover:border-maroon/70 hover:bg-gold/5"
        } ${isUploading ? "opacity-60 cursor-wait" : ""}`}
      >
        <div className="flex flex-col items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/20 text-maroon shadow-xs transition-colors group-hover:bg-maroon group-hover:text-cream"
          >
            {isUploading ? (
              <svg
                className="h-6 w-6 animate-spin text-maroon group-hover:text-cream"
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
              <UploadCloud className="h-6 w-6" />
            )}
          </motion.div>

          <div className="flex flex-col items-center gap-1">
            <p className="text-sm font-medium text-maroon">
              {isUploading ? labels.uploading : labels.dropzoneTitle}{" "}
              {!isUploading && (
                <span className="font-semibold text-maroon underline decoration-gold underline-offset-4 hover:text-gold transition-colors">
                  {labels.browseFiles}
                </span>
              )}
            </p>
            <p className="text-[11px] text-maroon/50">
              {labels.supportsNote || "Supports JPEG, PNG, WebP (up to 500KB per image)"}
            </p>
          </div>
        </div>
      </div>

      {/* Image Gallery Grid */}
      {images.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-maroon">
              <ImageIcon className="h-3.5 w-3.5 text-gold" />
              <span>
                {labels.imagesCount
                  ? labels.imagesCount.replace("{count}", String(images.length))
                  : `${images.length} ${images.length === 1 ? "Image" : "Images"}`}
              </span>
            </div>

            {multiple && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center gap-1 text-xs font-semibold text-maroon hover:text-gold transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{labels.addImage || "Add more"}</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5">
            <AnimatePresence>
              {images.map((url, index) => {
                const isCover = index === 0;

                return (
                  <motion.div
                    key={url}
                    layout
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.25 }}
                    onClick={() => setPreviewIndex(index)}
                    className="group relative aspect-square overflow-hidden rounded-2xl border border-gold/40 bg-white shadow-xs cursor-pointer"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Upload ${index + 1}`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Gradient Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-maroon/80 via-maroon/20 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

                    {/* Centered Preview Zoom Icon on hover */}
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:scale-105">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white shadow-lg backdrop-blur-xs ring-1 ring-white/30">
                        <Eye className="h-4 w-4" />
                      </span>
                    </div>

                    {/* Cover Photo Badge */}
                    {isCover && multiple && labels.coverPhotoBadge && (
                      <div className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded-full bg-gold/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs backdrop-blur-xs">
                        <Sparkles className="h-2.5 w-2.5" />
                        <span>{labels.coverPhotoBadge}</span>
                      </div>
                    )}

                    {/* Image Number Badge (non-cover) */}
                    {!isCover && multiple && (
                      <div className="absolute left-2 top-2 z-10 rounded-full bg-black/40 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs">
                        #{index + 1}
                      </div>
                    )}

                    {/* Remove button */}
                    <div className="absolute bottom-2 right-2 z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemove(url);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white shadow-md transition-colors hover:bg-red-700 cursor-pointer"
                        title={labels.removeImage}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Full-Screen Lightbox View for all uploaded images */}
      <AnimatePresence>
        {previewIndex !== null && (
          <ImageLightbox
            photos={images}
            index={previewIndex}
            onClose={() => setPreviewIndex(null)}
            onChangeIndex={setPreviewIndex}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
