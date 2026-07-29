"use client";

import { FormEvent, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  createTemplate,
  deleteTemplate,
  listTemplates,
} from "@/lib/firebase/firestore";
import { usePalettes } from "@/hooks/usePalettes";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Select } from "@/components/ui/Select";
import type { InvitationCategory, Template } from "@/types";

const CATEGORIES: InvitationCategory[] = ["wedding", "birthday", "event"];

const inputClassName =
  "rounded-lg border border-gold/40 px-3 py-1.5 transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20";

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<InvitationCategory>("wedding");
  const [previewImage, setPreviewImage] = useState("");
  const [colorPalette, setColorPalette] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Template | null>(null);
  const palettes = usePalettes();
  const t = useTranslations("admin.templates");
  const tCategory = useTranslations("dashboard.list.category");
  const tCommon = useTranslations("common");

  const selectedPalette = colorPalette || palettes?.[0]?.paletteId || "";
  const selectedPaletteSwatches = (() => {
    const palette = palettes?.find((p) => p.paletteId === selectedPalette);
    return palette ? [palette.primary, palette.secondary, palette.background] : null;
  })();

  function refresh() {
    listTemplates().then(setTemplates);
  }

  useEffect(refresh, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await createTemplate({
      category,
      name,
      previewImage,
      defaultColorPalette: selectedPalette,
      defaultFonts: { heading: "Moul", body: "Kantumruy Pro" },
    });
    setName("");
    setPreviewImage("");
    refresh();
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    await deleteTemplate(pendingDelete.templateId);
    setPendingDelete(null);
    refresh();
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 sm:py-14">
      <motion.h1
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-8 font-[family-name:var(--font-heading-km)] text-2xl text-maroon sm:text-3xl"
      >
        {t("title")}
      </motion.h1>

      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
        onSubmit={handleSubmit}
        className="mb-8 flex flex-wrap items-end gap-3 rounded-2xl border border-gold/30 bg-white p-5 shadow-sm"
      >
        <label className="flex flex-col gap-1 text-sm text-maroon">
          {t("name")}
          <input
            required
            placeholder="Elegant Rose Wedding"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClassName}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-maroon">
          {t("category")}
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value as InvitationCategory)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {tCategory(c)}
              </option>
            ))}
          </Select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-maroon">
          {t("previewImage")}
          <input
            placeholder="https://example.com/preview.jpg"
            value={previewImage}
            onChange={(e) => setPreviewImage(e.target.value)}
            className={inputClassName}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-maroon">
          {t("palette")}
          <span className="flex items-center gap-2">
            <Select
              value={selectedPalette}
              onChange={(e) => setColorPalette(e.target.value)}
            >
              {palettes?.map((p) => (
                <option key={p.paletteId} value={p.paletteId}>
                  {p.name}
                </option>
              ))}
            </Select>
            {selectedPaletteSwatches && (
              <span className="flex -space-x-1" aria-hidden>
                {selectedPaletteSwatches.map((color, i) => (
                  <span
                    key={i}
                    className="h-6 w-6 rounded-full border-2 border-white shadow"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </span>
            )}
          </span>
        </label>
        <motion.button
          type="submit"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="cursor-pointer rounded-full bg-maroon px-5 py-2 text-sm text-cream shadow-md shadow-maroon/20 transition-colors hover:bg-maroon/90"
        >
          {t("add")}
        </motion.button>
      </motion.form>

      {templates.length === 0 && (
        <p className="text-sm text-maroon/60">{t("empty")}</p>
      )}

      <motion.ul
        variants={listVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-2"
      >
        <AnimatePresence>
          {templates.map((tpl) => {
            const palette = palettes?.find((p) => p.paletteId === tpl.defaultColorPalette);
            return (
              <motion.li
                key={tpl.templateId}
                variants={itemVariants}
                layout
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center justify-between rounded-2xl border border-gold/30 bg-white px-5 py-3 shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="flex items-center gap-3">
                  {palette && (
                    <span className="flex -space-x-1" aria-hidden>
                      {[palette.primary, palette.secondary, palette.background].map((color) => (
                        <span
                          key={color}
                          className="h-4 w-4 rounded-full border border-white shadow"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </span>
                  )}
                  <span>
                    <strong className="text-maroon">{tpl.name}</strong>{" "}
                    <span className="text-sm text-maroon/60">
                      ({tCategory(tpl.category)}
                      {palette ? `, ${palette.name}` : ""})
                    </span>
                  </span>
                </span>
                <motion.button
                  type="button"
                  onClick={() => setPendingDelete(tpl)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="cursor-pointer text-sm text-red-700 transition-colors hover:text-red-800"
                >
                  {t("delete")}
                </motion.button>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </motion.ul>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={t("deleteConfirmTitle", { name: pendingDelete?.name ?? "" })}
        body={t("deleteConfirmBody")}
        confirmLabel={t("delete")}
        cancelLabel={tCommon("cancel")}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </main>
  );
}
