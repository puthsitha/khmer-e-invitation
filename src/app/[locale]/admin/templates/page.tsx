"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  createTemplate,
  deleteTemplate,
  listTemplates,
} from "@/lib/firebase/firestore";
import { PALETTE_IDS, PALETTE_LABELS } from "@/lib/palettes";
import type { InvitationCategory, Template } from "@/types";

const CATEGORIES: InvitationCategory[] = ["wedding", "birthday", "event"];

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<InvitationCategory>("wedding");
  const [previewImage, setPreviewImage] = useState("");
  const [colorPalette, setColorPalette] = useState("royal-gold");

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
      defaultColorPalette: colorPalette,
      defaultFonts: { heading: "Moul", body: "Kantumruy Pro" },
    });
    setName("");
    setPreviewImage("");
    refresh();
  }

  async function handleDelete(templateId: string) {
    await deleteTemplate(templateId);
    refresh();
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-6 font-[family-name:var(--font-heading-km)] text-2xl text-maroon">
        Templates
      </h1>

      <form
        onSubmit={handleSubmit}
        className="mb-8 flex flex-wrap items-end gap-3 rounded-xl border border-gold/30 bg-white p-4"
      >
        <label className="flex flex-col gap-1 text-sm text-maroon">
          Name
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-gold/40 px-3 py-1.5"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-maroon">
          Category
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as InvitationCategory)}
            className="rounded-lg border border-gold/40 px-3 py-1.5"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-maroon">
          Preview image URL
          <input
            value={previewImage}
            onChange={(e) => setPreviewImage(e.target.value)}
            className="rounded-lg border border-gold/40 px-3 py-1.5"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-maroon">
          Palette
          <select
            value={colorPalette}
            onChange={(e) => setColorPalette(e.target.value)}
            className="rounded-lg border border-gold/40 px-3 py-1.5"
          >
            {PALETTE_IDS.map((p) => (
              <option key={p} value={p}>
                {PALETTE_LABELS[p]}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded-full bg-maroon px-5 py-2 text-sm text-cream"
        >
          Add template
        </button>
      </form>

      <ul className="flex flex-col gap-2">
        {templates.map((t) => (
          <li
            key={t.templateId}
            className="flex items-center justify-between rounded-xl border border-gold/30 bg-white px-4 py-3"
          >
            <span>
              <strong className="text-maroon">{t.name}</strong>{" "}
              <span className="text-sm text-maroon/60">
                ({t.category}, {t.defaultColorPalette})
              </span>
            </span>
            <button
              type="button"
              onClick={() => handleDelete(t.templateId)}
              className="text-sm text-red-700"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
