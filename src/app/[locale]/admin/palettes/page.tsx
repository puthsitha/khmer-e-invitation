"use client";

import { FormEvent, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  createPalette,
  deletePalette,
  listPalettes,
  updatePalette,
} from "@/lib/firebase/firestore";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { Palette } from "@/types";

const EMPTY_FORM = {
  name: "",
  primary: "#c9a24b",
  primaryLight: "#e6cd8a",
  secondary: "#7a1f2b",
  background: "#fdf8f0",
};

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm text-maroon">
      {label}
      <span className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-9 cursor-pointer rounded-lg border border-gold/40 p-1"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-24 rounded-lg border border-gold/40 px-2 py-1.5 text-xs transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
        />
      </span>
    </label>
  );
}

export default function AdminPalettesPage() {
  const [palettes, setPalettes] = useState<Palette[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Palette | null>(null);
  const t = useTranslations("admin.palettes");
  const tCommon = useTranslations("common");

  function refresh() {
    listPalettes().then(setPalettes);
  }

  useEffect(refresh, []);

  function startEdit(p: Palette) {
    setEditingId(p.paletteId);
    setForm({
      name: p.name,
      primary: p.primary,
      primaryLight: p.primaryLight,
      secondary: p.secondary,
      background: p.background,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (editingId) {
      await updatePalette(editingId, form);
    } else {
      await createPalette(form);
    }
    cancelEdit();
    refresh();
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    await deletePalette(pendingDelete.paletteId);
    if (editingId === pendingDelete.paletteId) cancelEdit();
    setPendingDelete(null);
    refresh();
  }

  return (
    <main className="max-w-3xl px-6 py-10 sm:py-14">
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
        className="mb-8 flex flex-wrap items-end gap-4 rounded-2xl border border-gold/30 bg-white p-5 shadow-sm"
      >
        <label className="flex flex-col gap-1 text-sm text-maroon">
          {t("name")}
          <input
            required
            placeholder="Golden Rose"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="rounded-lg border border-gold/40 px-3 py-1.5 transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
          />
        </label>
        <ColorField
          label={t("primary")}
          value={form.primary}
          onChange={(v) => setForm((f) => ({ ...f, primary: v }))}
        />
        <ColorField
          label={t("primaryLight")}
          value={form.primaryLight}
          onChange={(v) => setForm((f) => ({ ...f, primaryLight: v }))}
        />
        <ColorField
          label={t("secondary")}
          value={form.secondary}
          onChange={(v) => setForm((f) => ({ ...f, secondary: v }))}
        />
        <ColorField
          label={t("background")}
          value={form.background}
          onChange={(v) => setForm((f) => ({ ...f, background: v }))}
        />
        <div className="flex gap-2">
          <motion.button
            type="submit"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="cursor-pointer rounded-full bg-maroon px-5 py-2 text-sm text-cream shadow-md shadow-maroon/20 transition-colors hover:bg-maroon/90"
          >
            {editingId ? tCommon("save") : t("add")}
          </motion.button>
          {editingId && (
            <motion.button
              type="button"
              onClick={cancelEdit}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="cursor-pointer rounded-full border border-gold/60 px-4 py-2 text-sm text-maroon transition-colors hover:bg-gold/10"
            >
              {tCommon("cancel")}
            </motion.button>
          )}
        </div>
      </motion.form>

      {palettes.length === 0 && <p className="text-sm text-maroon/60">{t("empty")}</p>}

      <motion.ul variants={listVariants} initial="hidden" animate="show" className="flex flex-col gap-2">
        <AnimatePresence>
          {palettes.map((p) => (
            <motion.li
              key={p.paletteId}
              variants={itemVariants}
              layout
              exit={{ opacity: 0, height: 0 }}
              className={`flex items-center justify-between rounded-2xl border bg-white px-5 py-3 shadow-sm transition-shadow hover:shadow-md ${
                editingId === p.paletteId ? "border-gold" : "border-gold/30"
              }`}
            >
              <button
                type="button"
                onClick={() => startEdit(p)}
                className="flex cursor-pointer items-center gap-3 text-left"
              >
                <span className="flex -space-x-1" aria-hidden>
                  {[p.primary, p.secondary, p.background].map((color, i) => (
                    <span
                      key={i}
                      className="h-6 w-6 rounded-full border-2 border-white shadow"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </span>
                <strong className="text-maroon">{p.name}</strong>
              </button>
              <motion.button
                type="button"
                onClick={() => setPendingDelete(p)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="cursor-pointer text-sm text-red-700 transition-colors hover:text-red-800"
              >
                {t("delete")}
              </motion.button>
            </motion.li>
          ))}
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
