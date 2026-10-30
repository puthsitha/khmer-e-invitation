"use client";

import { FormEvent, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, Link } from "@/i18n/navigation";
import { createInvitation, listTemplates } from "@/lib/firebase/firestore";
import { generateUniqueSlug } from "@/lib/slug";
import { CustomSelect, SelectOption } from "@/components/ui/CustomSelect";
import { AlertCircle, ArrowLeft, ExternalLink, Eye, Music } from "lucide-react";
import type { InvitationCategory, Template } from "@/types";

const CATEGORIES: InvitationCategory[] = ["wedding", "birthday", "event"];

export default function NewInvitationPage() {
  const { user } = useAuth();
  const router = useRouter();
  const t = useTranslations("dashboard.new");
  const tCat = useTranslations("dashboard.list.category");

  const [category, setCategory] = useState<InvitationCategory>("wedding");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateId, setTemplateId] = useState("");
  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    listTemplates(category).then((list) => {
      setTemplates(list);
      setTemplateId(list[0]?.templateId ?? "");
      setImgError(false);
    });
  }, [category]);

  const categoryOptions: SelectOption[] = CATEGORIES.map((c) => ({
    value: c,
    label: tCat(c),
  }));

  const templateOptions: SelectOption[] =
    templates.length === 0
      ? [{ value: "", label: t("noTemplates") }]
      : templates.map((tmpl) => ({
          value: tmpl.templateId,
          label: tmpl.name,
          swatches: [
            tmpl.colors.primary,
            tmpl.colors.secondary,
            tmpl.colors.text,
            tmpl.colors.background,
          ],
        }));

  function validateTitle(val: string): string | null {
    if (!val.trim()) {
      return t("titleRequired");
    }
    return null;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    setError(null);

    const tErr = validateTitle(title);
    if (tErr) {
      setTitleError(tErr);
      return;
    }

    if (!templateId) {
      setError(t("noTemplateError"));
      return;
    }

    setSubmitting(true);
    try {
      const slug = await generateUniqueSlug(title.trim());
      const invitation = await createInvitation(user.uid, {
        slug,
        category,
        templateId,
        defaultLocale: "km",
      });
      router.push(`/dashboard/${invitation.invitationId}`);
    } catch (err) {
      console.error("Failed to create invitation:", err);
      setError(t("genericError"));
    } finally {
      setSubmitting(false);
    }
  }

  const selectedTemplate = templates.find((t) => t.templateId === templateId);
  const previewThumb =
    selectedTemplate?.previewImage || selectedTemplate?.backgroundImageUrl;

  return (
    <main className="mx-auto max-w-lg px-6 py-10">
      {/* Back to Dashboard Link */}
      <Link
        href="/dashboard"
        className="group mb-5 inline-flex items-center gap-2 text-sm font-medium text-maroon/70 dark:text-[#f6eee8]/70 hover:text-maroon dark:hover:text-gold transition-colors cursor-pointer"
      >
        <ArrowLeft size={16} className="transition-transform duration-200 group-hover:-translate-x-1" />
        <span>{t("backToDashboard")}</span>
      </Link>

      <h1 className="mb-6 font-[family-name:var(--font-heading-km)] text-2xl text-maroon dark:text-[#f6eee8] sm:text-3xl">
        {t("title")}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Category Custom Dropdown */}
        <div className="flex flex-col gap-1.5 text-sm text-maroon dark:text-[#f6eee8]">
          <label className="font-medium">{t("category")}</label>
          <CustomSelect
            value={category}
            onChange={(val) => setCategory(val as InvitationCategory)}
            options={categoryOptions}
            buttonClassName="py-2.5 px-4 text-sm font-medium"
          />
        </div>

        {/* Template Custom Dropdown */}
        <div className="flex flex-col gap-1.5 text-sm text-maroon dark:text-[#f6eee8]">
          <label className="font-medium">{t("template")}</label>
          <CustomSelect
            value={templateId}
            onChange={(val) => {
              setTemplateId(val);
              setImgError(false);
            }}
            options={templateOptions}
            buttonClassName="py-2.5 px-4 text-sm font-medium"
          />
        </div>

        {/* Selected Template Summary & Sample Preview Trigger */}
        {selectedTemplate && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3 rounded-xl border border-gold/30 dark:border-gold/20 bg-white/80 dark:bg-[#1c161b] p-4 shadow-xs"
          >
            <div className="flex items-center justify-between text-xs text-maroon/70 dark:text-[#f6eee8]/70">
              <span className="font-semibold">{t("templatePreview")}:</span>
              <span className="font-medium text-maroon dark:text-[#f6eee8]">
                {selectedTemplate.name}
              </span>
            </div>

            {previewThumb && !imgError && (
              <Link
                href={`/i/sample-${selectedTemplate.templateId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group/img relative block aspect-video w-full overflow-hidden rounded-lg border border-gold/25 bg-gold/5 dark:bg-[#251d24]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewThumb}
                  alt={selectedTemplate.name}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-200 group-hover/img:opacity-100">
                  <span className="flex items-center gap-1.5 rounded-full bg-white/90 dark:bg-[#20181e]/90 px-3 py-1.5 text-xs font-semibold text-maroon dark:text-gold shadow-md">
                    <Eye size={14} />
                    <span>{t("previewSample")}</span>
                    <ExternalLink size={12} />
                  </span>
                </div>
              </Link>
            )}

            {selectedTemplate.description && (
              <p className="text-xs leading-relaxed text-maroon/75 dark:text-[#f6eee8]/75">
                {selectedTemplate.description}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2">
                {[
                  { label: "Primary", color: selectedTemplate.colors.primary },
                  { label: "Secondary", color: selectedTemplate.colors.secondary },
                  { label: "Text", color: selectedTemplate.colors.text },
                  { label: "Background", color: selectedTemplate.colors.background },
                ].map((swatch, idx) => (
                  <span
                    key={idx}
                    className="h-6 w-6 rounded-full border-2 border-white dark:border-[#20181e] shadow-xs ring-1 ring-gold/40"
                    style={{ backgroundColor: swatch.color }}
                    title={`${swatch.label}: ${swatch.color}`}
                  />
                ))}
                {selectedTemplate.hasMusic && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-semibold text-maroon dark:text-gold">
                    <Music size={10} />
                    <span>Music</span>
                  </span>
                )}
              </div>

              <Link
                href={`/i/sample-${selectedTemplate.templateId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-gold/40 bg-gold/15 px-3 py-1.5 text-xs font-semibold text-maroon dark:text-gold hover:bg-gold/25 transition-colors cursor-pointer"
              >
                <Eye size={13} />
                <span>{t("previewSample")}</span>
                <ExternalLink size={12} />
              </Link>
            </div>
          </motion.div>
        )}

        {/* Required Title Input */}
        <div className="flex flex-col gap-1.5 text-sm text-maroon dark:text-[#f6eee8]">
          <label htmlFor="invitation-title" className="font-medium">
            {t("titleLabel")} <span className="text-red-500">*</span>
          </label>
          <input
            id="invitation-title"
            type="text"
            required
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (titleError && e.target.value.trim()) setTitleError(null);
            }}
            onBlur={() => setTitleError(validateTitle(title))}
            placeholder={t("titlePlaceholder")}
            disabled={submitting}
            className={`rounded-xl border bg-white dark:bg-[#20181e] px-4 py-2.5 text-sm text-maroon dark:text-[#f6eee8] placeholder:text-maroon/30 dark:placeholder:text-[#f6eee8]/30 shadow-xs outline-none transition-all duration-200 ${
              titleError
                ? "border-2 border-red-500 ring-2 ring-red-500/20"
                : "border-gold/40 dark:border-gold/30 focus:border-maroon dark:focus:border-gold focus:ring-2 focus:ring-maroon/20 dark:focus:ring-gold/20 hover:border-gold/70"
            }`}
          />
          <AnimatePresence>
            {titleError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{titleError}</span>
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* General Form Error */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex items-center gap-1.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 p-2.5 text-xs font-medium text-red-700 dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500 dark:text-red-400" />
              <span>{error}</span>
            </motion.p>
          )}
        </AnimatePresence>

        {/* Action Buttons: Cancel & Submit */}
        <div className="mt-2 flex flex-col-reverse sm:flex-row items-center gap-3">
          <Link
            href="/dashboard"
            className="flex h-12 w-full sm:flex-1 cursor-pointer items-center justify-center rounded-full border border-gold/40 dark:border-gold/30 bg-white/50 dark:bg-white/5 text-sm font-semibold text-maroon dark:text-[#f6eee8] hover:bg-gold/15 dark:hover:bg-gold/10 transition-colors"
          >
            {t("cancel")}
          </Link>

          <motion.button
            type="submit"
            disabled={submitting}
            whileHover={submitting ? undefined : { scale: 1.015 }}
            whileTap={submitting ? undefined : { scale: 0.985 }}
            transition={{ duration: 0.15 }}
            className="group relative flex h-12 w-full sm:flex-[2] cursor-pointer items-center justify-center overflow-hidden rounded-full bg-maroon dark:bg-gold text-sm font-semibold text-cream dark:text-maroon shadow-md transition-all duration-200 hover:bg-maroon/95 dark:hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <AnimatePresence mode="wait">
              {submitting ? (
                <motion.div
                  key="creating"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-2.5">
                  <svg
                    className="h-4 w-4 animate-spin text-cream dark:text-maroon"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24">
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
                  <span>{t("creating")}</span>
                </motion.div>
              ) : (
                <motion.span
                  key="create"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}>
                  {t("create")}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </form>
    </main>
  );
}
