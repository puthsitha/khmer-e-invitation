"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Check,
  Eye,
  LayoutTemplate,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { ImageLightbox } from "@/components/viewer/ImageLightbox";
import {
  createTemplate,
  deleteTemplate,
  listTemplates,
  newTemplateId,
  updateTemplate,
} from "@/lib/firebase/firestore";
import {
  UploadValidationError,
  uploadTemplatePreviewImage,
  validateTemplatePreviewImage,
} from "@/lib/firebase/storage";
import { usePalettes } from "@/hooks/usePalettes";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { UPLOAD_LIMITS } from "@/lib/constants";
import type { InvitationCategory, Template } from "@/types";

const CATEGORIES: InvitationCategory[] = ["wedding", "birthday", "event"];
const PREVIEW_IMAGE_MAX_LABEL =
  UPLOAD_LIMITS.galleryImageMaxBytes >= 1024 * 1024
    ? `${Math.floor(UPLOAD_LIMITS.galleryImageMaxBytes / (1024 * 1024))}MB`
    : `${Math.floor(UPLOAD_LIMITS.galleryImageMaxBytes / 1024)}KB`;

const inputClassName =
  "rounded-lg border border-gold/40 dark:border-gold/30 bg-white dark:bg-[#20181e] text-maroon dark:text-[#f6eee8] px-3 py-2 transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 text-sm";

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

function TemplateItemImage({ src, alt }: { src?: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center text-maroon/40 dark:text-gold/40">
        <LayoutTemplate size={24} strokeWidth={1.5} />
        <span className="mt-1 text-[10px] uppercase tracking-wider font-medium">
          No Image
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
    />
  );
}

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<InvitationCategory>("wedding");
  const [previewImage, setPreviewImage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [templateId, setTemplateId] = useState(() => newTemplateId());
  const [colorPalette, setColorPalette] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Template | null>(null);
  const [lightboxPhotos, setLightboxPhotos] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const palettes = usePalettes();
  const t = useTranslations("admin.templates");
  const tCategory = useTranslations("dashboard.list.category");
  const tCommon = useTranslations("common");

  function openLightboxForTemplate(url: string) {
    const images = templates
      .map((t) => t.previewImage)
      .filter((img): img is string => Boolean(img && img.trim()));
    const idx = images.indexOf(url);
    if (idx !== -1) {
      setLightboxPhotos(images);
      setLightboxIndex(idx);
    } else {
      setLightboxPhotos([url]);
      setLightboxIndex(0);
    }
  }

  function openLightboxSingle(url: string) {
    setLightboxPhotos([url]);
    setLightboxIndex(0);
  }

  const selectedPalette = colorPalette || palettes?.[0]?.paletteId || "";
  const categoryOptions = CATEGORIES.map((c) => ({ value: c, label: tCategory(c) }));
  const paletteOptions =
    palettes?.map((p) => ({
      value: p.paletteId,
      label: p.name,
      swatches: [p.primary, p.secondary, p.background],
    })) ?? [];

  function refresh() {
    listTemplates()
      .then(setTemplates)
      .catch((err) => {
        console.warn("Could not load templates:", err);
      });
  }

  useEffect(refresh, []);

  // Clean up any blob preview URL on unmount or URL change
  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  function clearSelectedFile() {
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
      setLocalPreviewUrl(null);
    }
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function startEdit(tpl: Template) {
    clearSelectedFile();
    setEditingId(tpl.templateId);
    setName(tpl.name || "");
    setCategory(tpl.category);
    setPreviewImage(tpl.previewImage || "");
    setDescription(tpl.description || "");
    setColorPalette(tpl.defaultColorPalette || "");
    setTemplateId(tpl.templateId);
    setUploadError(null);
    setSaveError(null);
  }

  function cancelEdit() {
    clearSelectedFile();
    setEditingId(null);
    setName("");
    setCategory("wedding");
    setPreviewImage("");
    setDescription("");
    setColorPalette("");
    setTemplateId(newTemplateId());
    setUploadError(null);
    setSaveError(null);
  }

  // Local file selection without immediate upload
  function handlePreviewImageSelect(file: File | null) {
    if (!file) return;
    setUploadError(null);
    setSaveError(null);

    try {
      validateTemplatePreviewImage(file);
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
      const objectUrl = URL.createObjectURL(file);
      setSelectedFile(file);
      setLocalPreviewUrl(objectUrl);
    } catch (err) {
      setUploadError(
        err instanceof UploadValidationError ? err.message : t("uploadError"),
      );
    }
  }

  function handleRemoveImage() {
    clearSelectedFile();
    setPreviewImage("");
    setUploadError(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setSaveError(null);
    setUploadError(null);

    let finalImageUrl = previewImage;

    // 1. If admin selected a new image file, upload now
    if (selectedFile) {
      setUploading(true);
      try {
        finalImageUrl = await uploadTemplatePreviewImage(templateId, selectedFile);
      } catch (err) {
        console.error("Image upload failed:", err);
        const errMsg =
          err instanceof Error && err.message ? err.message : t("uploadError");
        setUploadError(errMsg);
        setSaveError(t("uploadFailedNotice"));
        setUploading(false);
        setSubmitting(false);
        // Do NOT proceed to save template in Firestore if upload fails
        return;
      } finally {
        setUploading(false);
      }
    }

    // 2. Only proceed to save template if upload succeeded (or no new file was uploaded)
    try {
      if (editingId) {
        await updateTemplate(editingId, {
          name: name.trim(),
          previewImage: finalImageUrl || "",
          description: description.trim() || undefined,
          defaultColorPalette: selectedPalette,
        });
      } else {
        await createTemplate(
          {
            category,
            name: name.trim(),
            previewImage: finalImageUrl || "",
            description: description.trim() || undefined,
            defaultColorPalette: selectedPalette,
            defaultFonts: { heading: "Moul", body: "Kantumruy Pro" },
          },
          templateId,
        );
      }
      cancelEdit();
      refresh();
    } catch (err) {
      console.error("Failed to save template:", err);
      setSaveError(err instanceof Error ? err.message : "Failed to save template");
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    await deleteTemplate(pendingDelete.templateId);
    if (editingId === pendingDelete.templateId) {
      cancelEdit();
    }
    setPendingDelete(null);
    refresh();
  }

  const displayImage = localPreviewUrl || previewImage;

  return (
    <main className="w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {/* Page Title & Subtitle */}
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-heading-km)] text-2xl sm:text-3xl font-semibold text-maroon dark:text-[#f6eee8]">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-maroon/60 dark:text-[#f6eee8]/60">
          {t("subtitle")}
        </p>
      </div>

      {/* Two Column Layout: Template Form (Left) | List Template (Right) */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* Column 1: Template Form (Create / Update) */}
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <motion.form
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 rounded-2xl border border-gold/30 dark:border-gold/20 bg-white dark:bg-[#1c161b] p-5 sm:p-6 shadow-sm"
          >
            <div className="flex items-center justify-between pb-2 border-b border-gold/20 dark:border-gold/15">
              <div className="flex items-center gap-2">
                <LayoutTemplate className="h-5 w-5 text-maroon dark:text-gold" />
                <h2 className="font-[family-name:var(--font-heading-km)] text-lg font-semibold text-maroon dark:text-[#f6eee8]">
                  {editingId ? t("editFormTitle") : t("formTitle")}
                </h2>
              </div>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="text-xs text-maroon/60 dark:text-[#f6eee8]/60 hover:text-maroon dark:hover:text-[#f6eee8] underline cursor-pointer"
                >
                  {tCommon("cancel")}
                </button>
              )}
            </div>

            {/* Name (title) */}
            <label className="flex flex-col gap-1.5 text-sm text-maroon dark:text-[#f6eee8]">
              <span className="font-medium">{t("name")}</span>
              <input
                required
                placeholder={t("namePlaceholder")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`${inputClassName} w-full`}
              />
            </label>

            {/* Category (disabled when editing) */}
            <label className="flex flex-col gap-1.5 text-sm text-maroon dark:text-[#f6eee8]">
              <div className="flex items-center justify-between">
                <span className="font-medium">{t("category")}</span>
                {Boolean(editingId) && (
                  <span className="text-[11px] text-maroon/50 dark:text-[#f6eee8]/50 italic">
                    {t("categoryDisabledHint")}
                  </span>
                )}
              </div>
              <CustomSelect
                value={category}
                onChange={(v) => setCategory(v as InvitationCategory)}
                options={categoryOptions}
                disabled={Boolean(editingId)}
              />
            </label>

            {/* Preview image */}
            <div className="flex flex-col gap-1.5 text-sm text-maroon dark:text-[#f6eee8]">
              <span className="font-medium">{t("previewImage")}</span>
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  id="template-preview-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  disabled={uploading || submitting}
                  onChange={(e) => handlePreviewImageSelect(e.target.files?.[0] ?? null)}
                />
                <label
                  htmlFor="template-preview-image"
                  className={`flex items-center gap-2 rounded-lg border border-gold/40 dark:border-gold/30 px-3 py-1.5 text-sm text-maroon dark:text-[#f6eee8] transition-colors ${
                    uploading || submitting
                      ? "opacity-60 cursor-not-allowed"
                      : "cursor-pointer hover:bg-gold/10"
                  }`}
                >
                  <Upload size={14} />
                  {uploading
                    ? t("uploading")
                    : displayImage
                      ? t("changeImage")
                      : t("uploadImage")}
                </label>
                {displayImage && (
                  <div className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={displayImage}
                      alt="Preview"
                      referrerPolicy="no-referrer"
                      onClick={() => openLightboxSingle(displayImage)}
                      title={t("viewFullImage")}
                      className="h-11 w-11 rounded-lg border border-gold/30 object-cover shadow-xs cursor-pointer hover:opacity-85 transition-opacity"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={uploading || submitting}
                      title={t("removeImage")}
                      className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-white shadow-xs hover:bg-red-700 cursor-pointer disabled:opacity-50"
                    >
                      <X size={10} />
                    </button>
                  </div>
                )}
                {selectedFile && (
                  <span className="text-xs text-gold font-medium truncate max-w-[180px]">
                    ({selectedFile.name})
                  </span>
                )}
              </div>
              <span className="text-xs text-maroon/60 dark:text-[#f6eee8]/60">
                {t("previewImageHint", { size: PREVIEW_IMAGE_MAX_LABEL })}
              </span>
              {uploadError && (
                <span className="text-xs text-red-500 dark:text-red-400">{uploadError}</span>
              )}
            </div>

            {/* Description (optional) */}
            <label className="flex flex-col gap-1.5 text-sm text-maroon dark:text-[#f6eee8]">
              <span className="font-medium">{t("description")}</span>
              <textarea
                rows={3}
                placeholder={t("descriptionPlaceholder")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`${inputClassName} w-full resize-y`}
              />
            </label>

            {/* Palette */}
            <label className="flex flex-col gap-1.5 text-sm text-maroon dark:text-[#f6eee8]">
              <span className="font-medium">{t("palette")}</span>
              <CustomSelect
                value={selectedPalette}
                onChange={setColorPalette}
                options={paletteOptions}
              />
            </label>

            {/* Error display */}
            {saveError && (
              <div className="rounded-lg border border-red-300 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-2.5 text-xs text-red-600 dark:text-red-400">
                {saveError}
              </div>
            )}

            {/* Submit & Cancel buttons */}
            <div className="mt-2 flex items-center gap-2">
              <motion.button
                type="submit"
                disabled={uploading || submitting}
                whileHover={{ scale: uploading || submitting ? 1 : 1.02 }}
                whileTap={{ scale: uploading || submitting ? 1 : 0.98 }}
                className="cursor-pointer flex-1 flex items-center justify-center gap-2 rounded-xl bg-maroon dark:bg-gold px-5 py-2.5 text-sm text-cream dark:text-maroon font-medium shadow-md shadow-maroon/20 transition-colors hover:bg-maroon/90 dark:hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading ? (
                  <span>{t("uploading")}</span>
                ) : editingId ? (
                  <>
                    <Check size={16} />
                    {t("update")}
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    {t("add")}
                  </>
                )}
              </motion.button>
              {editingId && (
                <motion.button
                  type="button"
                  onClick={cancelEdit}
                  disabled={uploading || submitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="cursor-pointer rounded-xl border border-gold/50 dark:border-gold/30 px-4 py-2.5 text-sm text-maroon dark:text-[#f6eee8] transition-colors hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {tCommon("cancel")}
                </motion.button>
              )}
            </div>
          </motion.form>
        </div>

        {/* Column 2: List Templates */}
        <div className="lg:col-span-7">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-heading-km)] text-lg font-semibold text-maroon dark:text-[#f6eee8]">
              {t("listTitle")}
            </h2>
            <span className="rounded-full bg-gold/15 dark:bg-gold/20 px-2.5 py-0.5 text-xs font-medium text-maroon dark:text-gold">
              {templates.length}
            </span>
          </div>

          {templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gold/40 dark:border-gold/30 p-10 text-center bg-white/50 dark:bg-[#1c161b]/50">
              <LayoutTemplate className="h-10 w-10 text-maroon/40 dark:text-gold/40 mb-3" />
              <p className="text-sm font-medium text-maroon/70 dark:text-[#f6eee8]/70">
                {t("empty")}
              </p>
            </div>
          ) : (
            <motion.ul
              variants={listVariants}
              initial="hidden"
              animate="show"
              className="flex flex-col gap-3"
            >
              <AnimatePresence>
                {templates.map((tpl) => {
                  const palette = palettes?.find((p) => p.paletteId === tpl.defaultColorPalette);
                  const hasCustomDescription = Boolean(tpl.description && tpl.description.trim());
                  const isEditing = editingId === tpl.templateId;

                  return (
                    <motion.li
                      key={tpl.templateId}
                      variants={itemVariants}
                      layout
                      exit={{ opacity: 0, height: 0 }}
                      className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl border bg-white dark:bg-[#1c161b] p-4 sm:p-5 shadow-xs transition-all hover:shadow-md ${
                        isEditing
                          ? "border-gold ring-2 ring-gold/40 shadow-sm"
                          : "border-gold/30 dark:border-gold/20 hover:border-gold/50"
                      }`}
                    >
                      {/* Image */}
                      <div
                        onClick={() => {
                          if (tpl.previewImage) {
                            openLightboxForTemplate(tpl.previewImage);
                          }
                        }}
                        className={`group/img relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-xl border border-gold/30 dark:border-gold/20 bg-gold/5 dark:bg-[#251d24] ${
                          tpl.previewImage ? "cursor-pointer" : ""
                        }`}
                        title={tpl.previewImage ? t("viewFullImage") : undefined}
                      >
                        <TemplateItemImage src={tpl.previewImage} alt={tpl.name} />
                        {tpl.previewImage && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover/img:opacity-100">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-maroon shadow-md transition-transform duration-200 group-hover/img:scale-105 dark:bg-[#20181e]/90 dark:text-gold">
                              <Eye size={16} />
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content: Name, Type, Description (or Palette name) */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-base text-maroon dark:text-[#f6eee8]">
                            {tpl.name}
                          </h3>
                          <span className="inline-flex items-center rounded-full bg-gold/15 dark:bg-gold/20 px-2.5 py-0.5 text-xs font-medium text-maroon dark:text-gold">
                            {tCategory(tpl.category)}
                          </span>
                        </div>

                        {/* Description (if don't have -> using Palette name) */}
                        <div className="mt-2 text-sm text-maroon/80 dark:text-[#f6eee8]/80">
                          {hasCustomDescription ? (
                            <p className="line-clamp-2 leading-relaxed">
                              {tpl.description}
                            </p>
                          ) : (
                            <div className="flex items-center gap-2 text-maroon/70 dark:text-[#f6eee8]/70">
                              {palette && (
                                <span className="flex -space-x-1" aria-hidden>
                                  {[palette.primary, palette.secondary, palette.background].map(
                                    (color, i) => (
                                      <span
                                        key={i}
                                        className="h-3.5 w-3.5 rounded-full border border-white dark:border-neutral-800 shadow-xs"
                                        style={{ backgroundColor: color }}
                                        title={color}
                                      />
                                    ),
                                  )}
                                </span>
                              )}
                              <span className="font-medium">
                                {palette ? palette.name : tpl.defaultColorPalette}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* If custom description exists, also show palette swatch info beneath */}
                        {hasCustomDescription && palette && (
                          <div className="mt-2 flex items-center gap-2 text-xs text-maroon/60 dark:text-[#f6eee8]/60">
                            <span className="flex -space-x-1" aria-hidden>
                              {[palette.primary, palette.secondary, palette.background].map(
                                (color, i) => (
                                  <span
                                    key={i}
                                    className="h-3 w-3 rounded-full border border-white dark:border-neutral-800 shadow-xs"
                                    style={{ backgroundColor: color }}
                                  />
                                ),
                              )}
                            </span>
                            <span>{palette.name}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions: Edit & Delete */}
                      <div className="flex items-center gap-2 shrink-0 sm:self-center self-end">
                        <motion.button
                          type="button"
                          onClick={() => startEdit(tpl)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          aria-label={`${t("edit")} ${tpl.name}`}
                          className={`flex items-center gap-1.5 cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                            isEditing
                              ? "border-gold bg-gold/15 text-maroon dark:text-gold ring-1 ring-gold"
                              : "border-gold/40 dark:border-gold/30 text-maroon dark:text-[#f6eee8] hover:bg-gold/10"
                          }`}
                        >
                          <Pencil size={13} />
                          <span>{t("edit")}</span>
                        </motion.button>

                        <motion.button
                          type="button"
                          onClick={() => setPendingDelete(tpl)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          aria-label={`${t("delete")} ${tpl.name}`}
                          className="flex items-center gap-1.5 cursor-pointer rounded-lg border border-red-200 dark:border-red-900/40 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                          <Trash2 size={13} />
                          <span>{t("delete")}</span>
                        </motion.button>
                      </div>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </motion.ul>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={pendingDelete !== null}
        title={t("deleteConfirmTitle", { name: pendingDelete?.name ?? "" })}
        body={t("deleteConfirmBody")}
        confirmLabel={t("delete")}
        cancelLabel={tCommon("cancel")}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      {/* Lightbox for viewing full-size preview images */}
      {lightboxIndex !== null && lightboxPhotos.length > 0 && (
        <ImageLightbox
          photos={lightboxPhotos}
          index={lightboxIndex}
          onClose={() => {
            setLightboxIndex(null);
            setLightboxPhotos([]);
          }}
          onChangeIndex={setLightboxIndex}
        />
      )}
    </main>
  );
}
