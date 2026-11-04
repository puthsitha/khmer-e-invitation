"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Check,
  Eye,
  Image as ImageIcon,
  LayoutTemplate,
  Music,
  Palette,
  Pencil,
  Plus,
  Smartphone,
  Sparkles,
  Tablet,
  Trash2,
  Upload,
  Video,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { ImageLightbox } from "@/components/viewer/ImageLightbox";
import { ViewerExperience } from "@/components/viewer/ViewerExperience";
import {
  createTemplate,
  deleteTemplate,
  listTemplates,
  newTemplateId,
  updateTemplate,
  DEFAULT_TEMPLATE_COLORS,
} from "@/lib/firebase/firestore";
import {
  UploadValidationError,
  uploadTemplatePreviewImage,
  uploadTemplateBackgroundImage,
  uploadTemplateMusic,
  validateTemplatePreviewImage,
  assertUpload,
} from "@/lib/firebase/storage";
import { createSampleInvitationForTemplate } from "@/lib/mockInvitation";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { UPLOAD_LIMITS, ALLOWED_AUDIO_TYPES, ALLOWED_IMAGE_TYPES } from "@/lib/constants";
import type { InvitationCategory, Template, TemplateColors } from "@/types";

const CATEGORIES: InvitationCategory[] = ["wedding", "birthday", "event"];
const PREVIEW_IMAGE_MAX_LABEL =
  UPLOAD_LIMITS.galleryImageMaxBytes >= 1024 * 1024
    ? `${Math.floor(UPLOAD_LIMITS.galleryImageMaxBytes / (1024 * 1024))}MB`
    : `${Math.floor(UPLOAD_LIMITS.galleryImageMaxBytes / 1024)}KB`;

const COLOR_PRESETS: {
  id: string;
  label: string;
  colors: TemplateColors;
}[] = [
  {
    id: "emerald-gold",
    label: "Emerald Gold",
    colors: {
      primary: "#d4af37",
      secondary: "#0f3d2e",
      text: "#f8f4eb",
      background: "#071f17",
    },
  },
  {
    id: "royal-kh",
    label: "Royal KH",
    colors: {
      primary: "#c9a24b",
      secondary: "#7a1f2b",
      text: "#3b1319",
      background: "#fdf8f0",
    },
  },
  {
    id: "teal-silver",
    label: "Teal Silver",
    colors: {
      primary: "#7dd3fc",
      secondary: "#115e59",
      text: "#f0fdfa",
      background: "#082f32",
    },
  },
];

const inputClassName =
  "rounded-xl border border-gold/40 dark:border-gold/30 bg-white dark:bg-[#20181e] text-maroon dark:text-[#f6eee8] px-3.5 py-2 transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 text-sm";

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

function TemplateItemImage({
  src,
  alt,
  colors,
}: {
  src?: string;
  alt: string;
  colors?: TemplateColors;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className="flex h-full w-full flex-col items-center justify-center p-2 text-center"
        style={{
          backgroundColor: colors?.background || "#fdf8f0",
          color: colors?.primary || "#c9a24b",
        }}
      >
        <LayoutTemplate size={24} strokeWidth={1.5} />
        <span className="mt-1 text-[9px] uppercase tracking-wider font-semibold opacity-80">
          {alt.slice(0, 12)}
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

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-maroon dark:text-[#f6eee8]">
      <span>{label}</span>
      <div className="flex items-center gap-2 rounded-xl border border-gold/40 dark:border-gold/30 bg-white dark:bg-[#20181e] p-1.5">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-7 shrink-0 cursor-pointer rounded-lg border border-gold/30 bg-transparent p-0"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-w-0 bg-transparent font-mono text-xs text-maroon dark:text-[#f6eee8] focus:outline-none"
        />
      </div>
    </label>
  );
}

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [templateId, setTemplateId] = useState(() => newTemplateId());

  // Basic metadata
  const [name, setName] = useState("");
  const [category, setCategory] = useState<InvitationCategory>("wedding");
  const [description, setDescription] = useState("");

  // Card thumbnail / preview image
  const [previewImage, setPreviewImage] = useState("");
  const [selectedPreviewFile, setSelectedPreviewFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  // Colors (Primary, Secondary, Text, Background)
  const [colors, setColors] = useState<TemplateColors>(DEFAULT_TEMPLATE_COLORS);

  // Background settings
  const [backgroundType, setBackgroundType] = useState<"none" | "photo" | "video">("photo");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState("");
  const [selectedBgFile, setSelectedBgFile] = useState<File | null>(null);
  const [localBgUrl, setLocalBgUrl] = useState<string | null>(null);
  const [backgroundVideoUrl, setBackgroundVideoUrl] = useState("");

  // Music settings
  const [hasMusic, setHasMusic] = useState(true);
  const [defaultMusicUrl, setDefaultMusicUrl] = useState("");
  const [selectedMusicFile, setSelectedMusicFile] = useState<File | null>(null);

  // Live preview controls
  const [previewStage, setPreviewStage] = useState<"closed" | "landing" | "opened">("opened");
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "ipad">("mobile");
  const [fullScreenPreviewTemplate, setFullScreenPreviewTemplate] = useState<Template | null>(null);

  // Upload & Save state
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Template | null>(null);
  const [lightboxPhotos, setLightboxPhotos] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const previewFileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const musicFileInputRef = useRef<HTMLInputElement>(null);

  const t = useTranslations("admin.templates");
  const tCategory = useTranslations("dashboard.list.category");
  const tCommon = useTranslations("common");

  const categoryOptions = CATEGORIES.map((c) => ({ value: c, label: tCategory(c) }));

  function refresh() {
    listTemplates()
      .then(setTemplates)
      .catch((err) => {
        console.warn("Could not load templates:", err);
      });
  }

  useEffect(refresh, []);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
      if (localBgUrl) URL.revokeObjectURL(localBgUrl);
    };
  }, [localPreviewUrl, localBgUrl]);

  function clearFiles() {
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
      setLocalPreviewUrl(null);
    }
    if (localBgUrl) {
      URL.revokeObjectURL(localBgUrl);
      setLocalBgUrl(null);
    }
    setSelectedPreviewFile(null);
    setSelectedBgFile(null);
    setSelectedMusicFile(null);
    if (previewFileInputRef.current) previewFileInputRef.current.value = "";
    if (bgFileInputRef.current) bgFileInputRef.current.value = "";
    if (musicFileInputRef.current) musicFileInputRef.current.value = "";
  }

  function startEdit(tpl: Template) {
    clearFiles();
    setEditingId(tpl.templateId);
    setTemplateId(tpl.templateId);
    setName(tpl.name || "");
    setCategory(tpl.category);
    setPreviewImage(tpl.previewImage || "");
    setDescription(tpl.description || "");
    setColors(tpl.colors || DEFAULT_TEMPLATE_COLORS);
    setBackgroundType(tpl.backgroundType || "none");
    setBackgroundImageUrl(tpl.backgroundImageUrl || "");
    setBackgroundVideoUrl(tpl.backgroundVideoUrl || "");
    setHasMusic(tpl.hasMusic ?? true);
    setDefaultMusicUrl(tpl.defaultMusicUrl || "");
    setUploadError(null);
    setSaveError(null);
  }

  function cancelEdit() {
    clearFiles();
    setEditingId(null);
    setTemplateId(newTemplateId());
    setName("");
    setCategory("wedding");
    setPreviewImage("");
    setDescription("");
    setColors(DEFAULT_TEMPLATE_COLORS);
    setBackgroundType("photo");
    setBackgroundImageUrl("");
    setBackgroundVideoUrl("");
    setHasMusic(true);
    setDefaultMusicUrl("");
    setUploadError(null);
    setSaveError(null);
  }

  function handlePreviewImageSelect(file: File | null) {
    if (!file) return;
    setUploadError(null);
    try {
      validateTemplatePreviewImage(file);
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
      setSelectedPreviewFile(file);
      setLocalPreviewUrl(URL.createObjectURL(file));
    } catch (err) {
      setUploadError(
        err instanceof UploadValidationError ? err.message : t("uploadError"),
      );
    }
  }

  function handleBgImageSelect(file: File | null) {
    if (!file) return;
    setUploadError(null);
    try {
      assertUpload(file, {
        maxBytes: UPLOAD_LIMITS.galleryImageMaxBytes,
        allowedTypes: ALLOWED_IMAGE_TYPES,
        allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
      });
      if (localBgUrl) URL.revokeObjectURL(localBgUrl);
      setSelectedBgFile(file);
      setLocalBgUrl(URL.createObjectURL(file));
    } catch (err) {
      setUploadError(
        err instanceof UploadValidationError ? err.message : t("uploadError"),
      );
    }
  }

  function handleMusicSelect(file: File | null) {
    if (!file) return;
    setUploadError(null);
    try {
      assertUpload(file, {
        maxBytes: UPLOAD_LIMITS.bgMusicMaxBytes,
        allowedTypes: ALLOWED_AUDIO_TYPES,
        allowedExtensions: [".mp3", ".wav", ".m4a", ".aac", ".ogg", ".mp4"],
      });
      setSelectedMusicFile(file);
    } catch (err) {
      setUploadError(
        err instanceof UploadValidationError ? err.message : "Invalid audio file.",
      );
    }
  }

  const displayPreviewImage = localPreviewUrl || previewImage;
  const displayBgImage = localBgUrl || backgroundImageUrl;

  // Build live draft Template for real-time ViewerExperience preview
  const draftTemplate: Template = useMemo(
    () => ({
      templateId,
      category,
      name: name.trim() || "Sample Template",
      previewImage: displayPreviewImage || displayBgImage || "",
      description: description.trim() || undefined,
      colors,
      backgroundType,
      backgroundImageUrl:
        backgroundType === "photo"
          ? displayBgImage || displayPreviewImage || undefined
          : undefined,
      backgroundVideoUrl:
        backgroundType === "video" ? backgroundVideoUrl.trim() || undefined : undefined,
      hasMusic,
      defaultMusicUrl: hasMusic ? defaultMusicUrl.trim() || undefined : undefined,
      defaultFonts: { heading: "Moul", body: "Kantumruy Pro" },
    }),
    [
      templateId,
      category,
      name,
      displayPreviewImage,
      displayBgImage,
      description,
      colors,
      backgroundType,
      backgroundVideoUrl,
      hasMusic,
      defaultMusicUrl,
    ],
  );

  const sampleInvitation = useMemo(
    () => createSampleInvitationForTemplate(draftTemplate),
    [draftTemplate],
  );

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setSaveError(null);
    setUploadError(null);

    let finalPreviewUrl = previewImage;
    let finalBgUrl = backgroundImageUrl;
    let finalMusicUrl = defaultMusicUrl;

    try {
      setUploading(true);
      if (selectedPreviewFile) {
        finalPreviewUrl = await uploadTemplatePreviewImage(templateId, selectedPreviewFile);
      }
      if (backgroundType === "photo" && selectedBgFile) {
        finalBgUrl = await uploadTemplateBackgroundImage(templateId, selectedBgFile);
      }
      if (hasMusic && selectedMusicFile) {
        finalMusicUrl = await uploadTemplateMusic(templateId, selectedMusicFile);
      }
    } catch (err) {
      console.error("Template asset upload failed:", err);
      const errMsg =
        err instanceof Error && err.message ? err.message : t("uploadError");
      setUploadError(errMsg);
      setSaveError(t("uploadFailedNotice"));
      setUploading(false);
      setSubmitting(false);
      return;
    } finally {
      setUploading(false);
    }

    // If admin uploaded a background photo but no separate card thumbnail, use background photo as previewImage too
    if (!finalPreviewUrl && finalBgUrl) {
      finalPreviewUrl = finalBgUrl;
    }

    try {
      const payload: Omit<Template, "templateId"> = {
        category,
        name: name.trim(),
        previewImage: finalPreviewUrl || "",
        description: description.trim() || undefined,
        colors,
        backgroundType,
        backgroundImageUrl:
          backgroundType === "photo" ? finalBgUrl || finalPreviewUrl || undefined : undefined,
        backgroundVideoUrl:
          backgroundType === "video" ? backgroundVideoUrl.trim() || undefined : undefined,
        hasMusic,
        defaultMusicUrl: hasMusic ? finalMusicUrl || undefined : undefined,
        defaultFonts: { heading: "Moul", body: "Kantumruy Pro" },
      };

      if (editingId) {
        await updateTemplate(editingId, payload);
      } else {
        await createTemplate(payload, templateId);
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

  return (
    <main className="w-full max-w-[1440px] mx-auto px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {/* Page Title & Subtitle */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-heading-km)] text-2xl sm:text-3xl font-semibold text-maroon dark:text-[#f6eee8]">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-maroon/60 dark:text-[#f6eee8]/60">
            {t("subtitle")}
          </p>
        </div>
      </div>

      {/* Top Grid: Left Form (5 cols) | Right Live Preview (7 cols) */}
      <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-12">
        {/* Column 1: Template Studio Form */}
        <div className="xl:col-span-5">
          <motion.form
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            onSubmit={handleSubmit}
            className="flex flex-col gap-5 rounded-2xl border border-gold/30 dark:border-gold/20 bg-white dark:bg-[#1c161b] p-5 sm:p-6 shadow-sm"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gold/20 dark:border-gold/15">
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

            {/* Name & Category */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

              <label className="flex flex-col gap-1.5 text-sm text-maroon dark:text-[#f6eee8]">
                <span className="font-medium">{t("category")}</span>
                <CustomSelect
                  value={category}
                  onChange={(v) => setCategory(v as InvitationCategory)}
                  options={categoryOptions}
                  disabled={Boolean(editingId)}
                />
              </label>
            </div>

            {/* Description */}
            <label className="flex flex-col gap-1.5 text-sm text-maroon dark:text-[#f6eee8]">
              <span className="font-medium">{t("description")}</span>
              <textarea
                rows={2}
                placeholder={t("descriptionPlaceholder")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`${inputClassName} w-full resize-y`}
              />
            </label>

            {/* Color Customization (Primary, Secondary, Text, Background) + Presets */}
            <div className="flex flex-col gap-3 rounded-xl border border-gold/25 dark:border-gold/20 bg-cream/40 dark:bg-white/5 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-maroon dark:text-[#f6eee8]">
                  <Palette className="h-4 w-4 text-gold" />
                  <span>{t("colorsTitle")}</span>
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setColors(preset.colors)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-white dark:bg-[#20181e] px-2.5 py-1 text-[11px] font-medium text-maroon dark:text-[#f6eee8] hover:border-gold transition-colors cursor-pointer"
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: preset.colors.primary }}
                      />
                      <span
                        className="h-2.5 w-2.5 rounded-full -ml-1"
                        style={{ backgroundColor: preset.colors.background }}
                      />
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <ColorInput
                  label={t("colorPrimary")}
                  value={colors.primary}
                  onChange={(primary) => setColors((c) => ({ ...c, primary }))}
                />
                <ColorInput
                  label={t("colorSecondary")}
                  value={colors.secondary}
                  onChange={(secondary) => setColors((c) => ({ ...c, secondary }))}
                />
                <ColorInput
                  label={t("colorText")}
                  value={colors.text}
                  onChange={(text) => setColors((c) => ({ ...c, text }))}
                />
                <ColorInput
                  label={t("colorBackground")}
                  value={colors.background}
                  onChange={(background) => setColors((c) => ({ ...c, background }))}
                />
              </div>

              {/* Background Opacity Control */}
              <div className="mt-1 flex flex-col gap-1.5 border-t border-gold/20 pt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-maroon/80 dark:text-[#f6eee8]/80">
                    {t("colorBackgroundOpacity")}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={colors.backgroundOpacity ?? 85}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (!Number.isNaN(val)) {
                          setColors((c) => ({
                            ...c,
                            backgroundOpacity: Math.max(0, Math.min(100, val)),
                          }));
                        }
                      }}
                      className="w-14 rounded-lg border border-gold/30 bg-white dark:bg-[#20181e] px-2 py-0.5 text-right font-mono text-xs text-maroon dark:text-[#f6eee8]"
                    />
                    <span className="font-mono text-xs text-maroon/70 dark:text-[#f6eee8]/70">
                      %
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={colors.backgroundOpacity ?? 85}
                  onChange={(e) =>
                    setColors((c) => ({
                      ...c,
                      backgroundOpacity: Number(e.target.value),
                    }))
                  }
                  className="h-2 w-full accent-gold cursor-pointer"
                />
              </div>
            </div>

            {/* Background Setting (None / Photo / Video) */}
            <div className="flex flex-col gap-3 rounded-xl border border-gold/25 dark:border-gold/20 bg-cream/40 dark:bg-white/5 p-4">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-maroon dark:text-[#f6eee8]">
                <ImageIcon className="h-4 w-4 text-gold" />
                <span>{t("backgroundTitle")}</span>
              </span>

              <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-gold/30 bg-white dark:bg-[#20181e] p-1">
                {(
                  [
                    { key: "none", label: t("bgNone"), icon: Sparkles },
                    { key: "photo", label: t("bgPhoto"), icon: ImageIcon },
                    { key: "video", label: t("bgVideo"), icon: Video },
                  ] as const
                ).map((opt) => {
                  const Icon = opt.icon;
                  const active = backgroundType === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setBackgroundType(opt.key)}
                      className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                        active
                          ? "bg-maroon text-cream dark:bg-gold dark:text-maroon shadow-xs"
                          : "text-maroon/70 dark:text-[#f6eee8]/70 hover:bg-gold/10"
                      }`}
                    >
                      <Icon size={13} />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              {backgroundType === "photo" && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <input
                      ref={bgFileInputRef}
                      id="template-bg-image"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      disabled={uploading || submitting}
                      onChange={(e) => handleBgImageSelect(e.target.files?.[0] ?? null)}
                    />
                    <label
                      htmlFor="template-bg-image"
                      className="flex items-center gap-2 rounded-lg border border-gold/40 bg-white dark:bg-[#20181e] px-3 py-1.5 text-xs font-medium text-maroon dark:text-[#f6eee8] cursor-pointer hover:bg-gold/10"
                    >
                      <Upload size={13} />
                      <span>{displayBgImage ? t("changeImage") : t("uploadBgImage")}</span>
                    </label>
                    {displayBgImage && (
                      <div className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={displayBgImage}
                          alt="Background"
                          referrerPolicy="no-referrer"
                          className="h-10 w-16 rounded-lg border border-gold/30 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (localBgUrl) URL.revokeObjectURL(localBgUrl);
                            setLocalBgUrl(null);
                            setSelectedBgFile(null);
                            setBackgroundImageUrl("");
                          }}
                          className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-white cursor-pointer"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    )}
                  </div>
                  <input
                    type="url"
                    placeholder="Or paste background image URL (https://...)"
                    value={backgroundImageUrl}
                    onChange={(e) => setBackgroundImageUrl(e.target.value)}
                    className={`${inputClassName} text-xs`}
                  />
                </div>
              )}

              {backgroundType === "video" && (
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                  value={backgroundVideoUrl}
                  onChange={(e) => setBackgroundVideoUrl(e.target.value)}
                  className={inputClassName}
                />
              )}
            </div>

            {/* Music Setting (Enable/Disable + Optional default music track) */}
            <div className="flex flex-col gap-3 rounded-xl border border-gold/25 dark:border-gold/20 bg-cream/40 dark:bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-maroon dark:text-[#f6eee8]">
                  <Music className="h-4 w-4 text-gold" />
                  <span>{t("musicTitle")}</span>
                </span>

                <button
                  type="button"
                  onClick={() => setHasMusic((v) => !v)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                    hasMusic
                      ? "bg-emerald-600 text-white"
                      : "bg-maroon/15 dark:bg-white/10 text-maroon/70 dark:text-[#f6eee8]/70"
                  }`}
                >
                  {hasMusic ? <Volume2 size={13} /> : <VolumeX size={13} />}
                  <span>{hasMusic ? t("musicEnabled") : t("musicDisabled")}</span>
                </button>
              </div>

              {hasMusic && (
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      ref={musicFileInputRef}
                      id="template-music-file"
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      disabled={uploading || submitting}
                      onChange={(e) => handleMusicSelect(e.target.files?.[0] ?? null)}
                    />
                    <label
                      htmlFor="template-music-file"
                      className="flex items-center gap-1.5 rounded-lg border border-gold/40 bg-white dark:bg-[#20181e] px-3 py-1.5 text-xs font-medium text-maroon dark:text-[#f6eee8] cursor-pointer hover:bg-gold/10"
                    >
                      <Upload size={13} />
                      <span>{t("uploadMusic")}</span>
                    </label>
                    {selectedMusicFile && (
                      <span className="text-xs text-gold font-medium truncate max-w-[180px]">
                        {selectedMusicFile.name}
                      </span>
                    )}
                  </div>
                  <input
                    type="url"
                    placeholder="Or paste default audio URL (optional)"
                    value={defaultMusicUrl}
                    onChange={(e) => setDefaultMusicUrl(e.target.value)}
                    className={`${inputClassName} text-xs`}
                  />
                </div>
              )}
            </div>

            {/* Optional Card Thumbnail Image */}
            <div className="flex flex-col gap-1.5 text-sm text-maroon dark:text-[#f6eee8]">
              <span className="font-medium">{t("previewImage")}</span>
              <div className="flex items-center gap-3">
                <input
                  ref={previewFileInputRef}
                  id="template-preview-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  disabled={uploading || submitting}
                  onChange={(e) => handlePreviewImageSelect(e.target.files?.[0] ?? null)}
                />
                <label
                  htmlFor="template-preview-image"
                  className="flex items-center gap-2 rounded-lg border border-gold/40 dark:border-gold/30 px-3 py-1.5 text-xs font-medium text-maroon dark:text-[#f6eee8] cursor-pointer hover:bg-gold/10"
                >
                  <Upload size={13} />
                  {displayPreviewImage ? t("changeImage") : t("uploadImage")}
                </label>
                {displayPreviewImage && (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={displayPreviewImage}
                      alt="Thumbnail"
                      referrerPolicy="no-referrer"
                      className="h-10 w-10 rounded-lg border border-gold/30 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
                        setLocalPreviewUrl(null);
                        setSelectedPreviewFile(null);
                        setPreviewImage("");
                      }}
                      className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-white cursor-pointer"
                    >
                      <X size={10} />
                    </button>
                  </div>
                )}
              </div>
              <span className="text-[11px] text-maroon/60 dark:text-[#f6eee8]/60">
                {t("previewImageHint", { size: PREVIEW_IMAGE_MAX_LABEL })}
              </span>
            </div>

            {uploadError && (
              <div className="rounded-lg border border-red-300 bg-red-50 dark:bg-red-950/30 p-2.5 text-xs text-red-600 dark:text-red-400">
                {uploadError}
              </div>
            )}

            {saveError && (
              <div className="rounded-lg border border-red-300 bg-red-50 dark:bg-red-950/30 p-2.5 text-xs text-red-600 dark:text-red-400">
                {saveError}
              </div>
            )}

            {/* Submit & Cancel */}
            <div className="mt-1 flex items-center gap-2">
              <motion.button
                type="submit"
                disabled={uploading || submitting}
                whileHover={{ scale: uploading || submitting ? 1 : 1.02 }}
                whileTap={{ scale: uploading || submitting ? 1 : 0.98 }}
                className="cursor-pointer flex-1 flex items-center justify-center gap-2 rounded-xl bg-maroon dark:bg-gold px-5 py-2.5 text-sm text-cream dark:text-maroon font-semibold shadow-md transition-colors hover:bg-maroon/90 dark:hover:bg-gold/90 disabled:opacity-50"
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
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="cursor-pointer rounded-xl border border-gold/50 px-4 py-2.5 text-sm text-maroon dark:text-[#f6eee8] hover:bg-gold/10"
                >
                  {tCommon("cancel")}
                </button>
              )}
            </div>
          </motion.form>
        </div>

        {/* Column 2: Interactive Live Result Preview */}
        <div className="xl:col-span-7 xl:sticky xl:top-20">
          <div className="flex flex-col gap-3 rounded-2xl border border-gold/30 dark:border-gold/20 bg-white dark:bg-[#1c161b] p-4 sm:p-5 shadow-sm">
            {/* Preview Top Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gold/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-[family-name:var(--font-heading-km)] text-sm sm:text-base font-semibold text-maroon dark:text-[#f6eee8]">
                  {t("livePreviewTitle")}
                </h3>
              </div>

              {/* Stage Switcher: Envelope / Hero / Full Invitation */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-xl border border-gold/30 bg-cream/50 dark:bg-[#20181e] p-1">
                  {(
                    [
                      { key: "closed", label: t("stageEnvelope") },
                      { key: "landing", label: t("stageHero") },
                      { key: "opened", label: t("stageContent") },
                    ] as const
                  ).map((st) => (
                    <button
                      key={st.key}
                      type="button"
                      onClick={() => setPreviewStage(st.key)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                        previewStage === st.key
                          ? "bg-maroon text-cream dark:bg-gold dark:text-maroon"
                          : "text-maroon/70 dark:text-[#f6eee8]/70 hover:text-maroon"
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>

                {/* Device Width Toggle (Mobile / iPad) */}
                <div className="hidden sm:inline-flex rounded-xl border border-gold/30 bg-cream/50 dark:bg-[#20181e] p-1">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("mobile")}
                    title="Mobile View"
                    className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                      previewDevice === "mobile"
                        ? "bg-maroon text-cream dark:bg-gold dark:text-maroon"
                        : "text-maroon/70 dark:text-[#f6eee8]/70"
                    }`}
                  >
                    <Smartphone size={14} />
                    <span>Mobile</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("ipad")}
                    title="iPad View"
                    className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                      previewDevice === "ipad"
                        ? "bg-maroon text-cream dark:bg-gold dark:text-maroon"
                        : "text-maroon/70 dark:text-[#f6eee8]/70"
                    }`}
                  >
                    <Tablet size={14} />
                    <span>iPad</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Live Viewer Frame */}
            <div className="flex justify-center bg-neutral-900/5 dark:bg-black/40 rounded-2xl p-2 sm:p-4 overflow-hidden">
              <div
                className={`relative h-[680px] overflow-hidden rounded-3xl border-4 border-gold/40 shadow-2xl transition-all duration-300 ${
                  previewDevice === "mobile"
                    ? "w-full max-w-[412px]"
                    : "w-full max-w-[768px]"
                }`}
              >
                <ViewerExperience
                  slug={sampleInvitation.slug}
                  initialInvitation={sampleInvitation}
                  templateOverride={draftTemplate}
                  initialStage={previewStage}
                  contained={true}
                  disableAutoScroll={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Saved Templates Library Section */}
      <div className="mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-heading-km)] text-xl font-semibold text-maroon dark:text-[#f6eee8]">
            {t("listTitle")}
          </h2>
          <span className="rounded-full bg-gold/15 dark:bg-gold/20 px-3 py-0.5 text-xs font-semibold text-maroon dark:text-gold">
            {templates.length}
          </span>
        </div>

        {templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gold/40 p-10 text-center bg-white/50 dark:bg-[#1c161b]/50">
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
            className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence>
              {templates.map((tpl) => {
                const isEditing = editingId === tpl.templateId;
                const thumbSrc = tpl.previewImage || tpl.backgroundImageUrl;

                return (
                  <motion.li
                    key={tpl.templateId}
                    variants={itemVariants}
                    layout
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`flex flex-col justify-between gap-4 rounded-2xl border bg-white dark:bg-[#1c161b] p-4 shadow-xs transition-all hover:shadow-md ${
                      isEditing
                        ? "border-gold ring-2 ring-gold/40"
                        : "border-gold/30 dark:border-gold/20 hover:border-gold/50"
                    }`}
                  >
                    <div className="flex gap-4">
                      {/* Thumbnail */}
                      <div
                        onClick={() => setFullScreenPreviewTemplate(tpl)}
                        className="group/img relative h-24 w-24 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-gold/30"
                        title={t("previewSample")}
                      >
                        <TemplateItemImage
                          src={thumbSrc}
                          alt={tpl.name}
                          colors={tpl.colors}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-200 group-hover/img:opacity-100">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-maroon shadow-md">
                            <Eye size={16} />
                          </span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h3 className="font-semibold text-base text-maroon dark:text-[#f6eee8] truncate">
                            {tpl.name}
                          </h3>
                          <span className="inline-flex items-center rounded-full bg-gold/15 dark:bg-gold/20 px-2 py-0.5 text-[10px] font-semibold text-maroon dark:text-gold">
                            {tCategory(tpl.category)}
                          </span>
                        </div>

                        {tpl.description && (
                          <p className="mt-1 line-clamp-2 text-xs text-maroon/70 dark:text-[#f6eee8]/70">
                            {tpl.description}
                          </p>
                        )}

                        {/* Color Swatches & Badges */}
                        <div className="mt-2.5 flex flex-wrap items-center gap-2">
                          <div className="flex -space-x-1">
                            {[
                              { label: "Primary", c: tpl.colors.primary },
                              { label: "Secondary", c: tpl.colors.secondary },
                              { label: "Text", c: tpl.colors.text },
                              { label: "Background", c: tpl.colors.background },
                            ].map((sw, i) => (
                              <span
                                key={i}
                                className="h-4 w-4 rounded-full border border-white dark:border-neutral-800 shadow-xs"
                                style={{ backgroundColor: sw.c }}
                                title={`${sw.label}: ${sw.c}`}
                              />
                            ))}
                          </div>
                          <span className="text-[11px] text-maroon/60 dark:text-[#f6eee8]/60 capitalize">
                            • {tpl.backgroundType}
                          </span>
                          <span className="text-[11px] text-maroon/60 dark:text-[#f6eee8]/60">
                            • {tpl.hasMusic ? "🎵 Music" : "🔇 No Music"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-2 border-t border-gold/15 pt-3">
                      <button
                        type="button"
                        onClick={() => setFullScreenPreviewTemplate(tpl)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-gold/15 dark:bg-gold/20 px-3 py-1.5 text-xs font-semibold text-maroon dark:text-gold hover:bg-gold/25 transition-colors cursor-pointer"
                      >
                        <Eye size={13} />
                        <span>{t("previewSample")}</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => startEdit(tpl)}
                          className="inline-flex items-center gap-1 rounded-lg border border-gold/40 px-2.5 py-1.5 text-xs font-medium text-maroon dark:text-[#f6eee8] hover:bg-gold/10 cursor-pointer"
                        >
                          <Pencil size={12} />
                          <span>{t("edit")}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDelete(tpl)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 dark:border-red-900/40 px-2.5 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                        >
                          <Trash2 size={12} />
                          <span>{t("delete")}</span>
                        </button>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </motion.ul>
        )}
      </div>

      {/* Full Sample Template Preview Modal */}
      <AnimatePresence>
        {fullScreenPreviewTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-black/85"
          >
            <div className="flex items-center justify-between border-b border-white/15 bg-[#140f13] px-4 py-3 text-white">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-sm sm:text-base text-gold">
                  {fullScreenPreviewTemplate.name}
                </span>
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs">
                  {t("previewSample")}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setFullScreenPreviewTemplate(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ViewerExperience
                slug={`preview-${fullScreenPreviewTemplate.templateId}`}
                initialInvitation={createSampleInvitationForTemplate(
                  fullScreenPreviewTemplate,
                )}
                templateOverride={fullScreenPreviewTemplate}
                initialStage="closed"
                contained={true}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={pendingDelete !== null}
        title={t("deleteConfirmTitle", { name: pendingDelete?.name ?? "" })}
        body={t("deleteConfirmBody")}
        confirmLabel={t("delete")}
        cancelLabel={tCommon("cancel")}
        destructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      {/* Lightbox */}
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
