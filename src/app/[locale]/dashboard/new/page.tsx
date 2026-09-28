"use client";

import { FormEvent, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "@/i18n/navigation";
import { createInvitation, listTemplates } from "@/lib/firebase/firestore";
import { generateUniqueSlug } from "@/lib/slug";
import { usePalettes } from "@/hooks/usePalettes";
import { CustomSelect, SelectOption } from "@/components/ui/CustomSelect";
import { AlertCircle } from "lucide-react";
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
  const palettes = usePalettes();

  useEffect(() => {
    listTemplates(category).then((list) => {
      setTemplates(list);
      setTemplateId(list[0]?.templateId ?? "");
    });
  }, [category]);

  const categoryOptions: SelectOption[] = CATEGORIES.map((c) => ({
    value: c,
    label: tCat(c),
  }));

  const templateOptions: SelectOption[] =
    templates.length === 0
      ? [{ value: "", label: t("noTemplates") }]
      : templates.map((tmpl) => {
          const pal = palettes?.find(
            (p) => p.paletteId === tmpl.defaultColorPalette,
          );
          return {
            value: tmpl.templateId,
            label: tmpl.name,
            swatches: pal
              ? [pal.primary, pal.secondary, pal.background]
              : undefined,
          };
        });

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
      const selectedTemplate = templates.find(
        (t) => t.templateId === templateId,
      );
      const invitation = await createInvitation(user.uid, {
        slug,
        category,
        templateId,
        defaultLocale: "km",
        colorPalette: selectedTemplate?.defaultColorPalette ?? "royal-gold",
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
  const selectedPalette = palettes?.find(
    (p) => p.paletteId === selectedTemplate?.defaultColorPalette,
  );

  return (
    <main className="mx-auto max-w-lg px-6 py-10">
      <h1 className="mb-6 font-[family-name:var(--font-heading-km)] text-2xl text-maroon sm:text-3xl">
        {t("title")}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Category Custom Dropdown */}
        <div className="flex flex-col gap-1.5 text-sm text-maroon">
          <label className="font-medium">{t("category")}</label>
          <CustomSelect
            value={category}
            onChange={(val) => setCategory(val as InvitationCategory)}
            options={categoryOptions}
            buttonClassName="py-2.5 px-4 text-sm font-medium"
          />
        </div>

        {/* Template Custom Dropdown */}
        <div className="flex flex-col gap-1.5 text-sm text-maroon">
          <label className="font-medium">{t("template")}</label>
          <CustomSelect
            value={templateId}
            onChange={(val) => setTemplateId(val)}
            options={templateOptions}
            buttonClassName="py-2.5 px-4 text-sm font-medium"
          />
        </div>

        {/* Enhanced Palette Preview (Suitable Size) */}
        {selectedPalette && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-2 rounded-xl border border-gold/30 bg-white/75 p-3.5 shadow-xs">
            <div className="flex items-center justify-between text-xs text-maroon/70">
              <span className="font-semibold">{t("palette")}:</span>
              <span className="font-medium text-maroon">
                {selectedPalette.name}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {[
                { label: "Primary", color: selectedPalette.primary },
                { label: "Secondary", color: selectedPalette.secondary },
                { label: "Background", color: selectedPalette.background },
              ].map((swatch, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span
                    className="h-8 w-8 rounded-full border-2 border-white shadow-sm ring-1 ring-gold/40 transition-transform hover:scale-110"
                    style={{ backgroundColor: swatch.color }}
                    title={`${swatch.label}: ${swatch.color}`}
                  />
                  <span className="text-xs text-maroon/60 hidden sm:inline">
                    {swatch.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Required Title Input */}
        <div className="flex flex-col gap-1.5 text-sm text-maroon">
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
            className={`rounded-xl border bg-white px-4 py-2.5 text-sm text-maroon placeholder:text-maroon/30 shadow-xs outline-none transition-all duration-200 ${
              titleError
                ? "border-2 border-red-500 ring-2 ring-red-500/20"
                : "border-gold/40 focus:border-maroon focus:ring-2 focus:ring-maroon/20 hover:border-gold/70"
            }`}
          />
          <AnimatePresence>
            {titleError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-red-600">
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
              className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs font-medium text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </motion.p>
          )}
        </AnimatePresence>

        {/* Animated Loading Submit Button */}
        <motion.button
          type="submit"
          disabled={submitting}
          whileHover={submitting ? undefined : { scale: 1.015 }}
          whileTap={submitting ? undefined : { scale: 0.985 }}
          transition={{ duration: 0.15 }}
          className="group relative mt-2 flex h-12 w-full cursor-pointer items-center justify-center overflow-hidden rounded-full bg-maroon text-sm font-semibold text-cream shadow-md transition-all duration-200 hover:bg-maroon/95 disabled:cursor-not-allowed disabled:opacity-70">
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
                  className="h-4 w-4 animate-spin text-cream"
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
      </form>
    </main>
  );
}
