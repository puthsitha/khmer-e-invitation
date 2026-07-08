"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "@/i18n/navigation";
import { createInvitation, listTemplates } from "@/lib/firebase/firestore";
import { generateUniqueSlug } from "@/lib/slug";
import type { InvitationCategory, Template } from "@/types";

const CATEGORIES: InvitationCategory[] = ["wedding", "birthday", "event"];

export default function NewInvitationPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [category, setCategory] = useState<InvitationCategory>("wedding");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateId, setTemplateId] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listTemplates(category).then((list) => {
      setTemplates(list);
      setTemplateId(list[0]?.templateId ?? "");
    });
  }, [category]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    setError(null);

    if (!templateId) {
      setError("No template available for this category yet. Ask an admin to add one.");
      return;
    }

    setSubmitting(true);
    try {
      const slug = await generateUniqueSlug(title || category);
      const invitation = await createInvitation(user.uid, {
        slug,
        category,
        templateId,
        defaultLocale: "km",
      });
      router.push(`/dashboard/${invitation.invitationId}`);
    } catch {
      setError("Could not create the invitation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-10">
      <h1 className="mb-6 font-[family-name:var(--font-heading-km)] text-2xl text-maroon">
        New invitation
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm text-maroon">
          Category
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as InvitationCategory)}
            className="rounded-lg border border-gold/40 bg-white px-4 py-2"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-maroon">
          Template
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            className="rounded-lg border border-gold/40 bg-white px-4 py-2"
          >
            {templates.length === 0 && <option value="">No templates yet</option>}
            {templates.map((t) => (
              <option key={t.templateId} value={t.templateId}>
                {t.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-maroon">
          Title (used to generate the link, e.g. couple names)
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="sokha-dara"
            className="rounded-lg border border-gold/40 bg-white px-4 py-2"
          />
        </label>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-maroon px-6 py-2 text-cream disabled:opacity-60"
        >
          Create invitation
        </button>
      </form>
    </main>
  );
}
