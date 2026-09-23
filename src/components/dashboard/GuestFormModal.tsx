"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { X, User, MapPin, Tag, FileText, Send } from "lucide-react";
import type { WeddingGuest, RsvpDecision } from "@/types";

interface GuestFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (guestData: {
    name: string;
    from?: string;
    by?: string;
    note?: string;
    isInvited: boolean;
    rsvpStatus?: RsvpDecision;
  }) => Promise<void>;
  initialGuest?: WeddingGuest | null;
}

export function GuestFormModal({
  isOpen,
  onClose,
  onSave,
  initialGuest,
}: GuestFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <GuestFormContent
        key={initialGuest?.guestId ?? "new-guest"}
        initialGuest={initialGuest}
        onClose={onClose}
        onSave={onSave}
      />
    </div>
  );
}

function GuestFormContent({
  initialGuest,
  onClose,
  onSave,
}: {
  initialGuest?: WeddingGuest | null;
  onClose: () => void;
  onSave: (guestData: {
    name: string;
    from?: string;
    by?: string;
    note?: string;
    isInvited: boolean;
    rsvpStatus?: RsvpDecision;
  }) => Promise<void>;
}) {
  const t = useTranslations("dashboard.editor.rsvp");
  const tCommon = useTranslations("common");

  const [name, setName] = useState(initialGuest?.name || "");
  const [from, setFrom] = useState(initialGuest?.from || "");
  const [by, setBy] = useState(initialGuest?.by || "");
  const [note, setNote] = useState(initialGuest?.note || "");
  const [isInvited, setIsInvited] = useState(initialGuest?.isInvited ?? false);
  const [rsvpStatus, setRsvpStatus] = useState<RsvpDecision>(
    initialGuest?.rsvpStatus || "pending",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a guest name");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave({
        name: name.trim(),
        from: from.trim() || undefined,
        by: by.trim() || undefined,
        note: note.trim() || undefined,
        isInvited,
        rsvpStatus,
      });
      onClose();
    } catch {
      setError("Failed to save guest. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative w-full max-w-md rounded-3xl border border-gold/40 bg-cream p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150">
      <div className="flex items-center justify-between border-b border-gold/20 pb-3">
        <h3 className="font-[family-name:var(--font-heading-km)] text-lg font-bold text-maroon">
          {initialGuest ? t("editGuest") : t("addGuest")}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full text-maroon/60 hover:bg-gold/20 hover:text-maroon transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4 text-xs">
        {error && (
          <div className="rounded-xl border border-rose-300 bg-rose-50 p-2.5 text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1.5 font-semibold text-maroon">
            <User className="h-3.5 w-3.5 text-gold" />
            <span>{t("guestNameLabel")} *</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("guestNamePlaceholder")}
            required
            className="w-full rounded-xl border border-gold/40 bg-white px-3.5 py-2.5 text-xs font-medium text-maroon placeholder:text-maroon/30 shadow-2xs outline-none focus:border-maroon focus:ring-2 focus:ring-maroon/15"
          />
        </div>

        {/* From */}
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1.5 font-semibold text-maroon">
            <MapPin className="h-3.5 w-3.5 text-gold" />
            <span>{t("fromLabel")}</span>
          </label>
          <input
            type="text"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder={t("fromPlaceholder")}
            className="w-full rounded-xl border border-gold/40 bg-white px-3.5 py-2.5 text-xs font-medium text-maroon placeholder:text-maroon/30 shadow-2xs outline-none focus:border-maroon focus:ring-2 focus:ring-maroon/15"
          />
        </div>

        {/* By */}
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1.5 font-semibold text-maroon">
            <Tag className="h-3.5 w-3.5 text-gold" />
            <span>{t("byLabel")}</span>
          </label>
          <input
            type="text"
            value={by}
            onChange={(e) => setBy(e.target.value)}
            placeholder={t("byPlaceholder")}
            className="w-full rounded-xl border border-gold/40 bg-white px-3.5 py-2.5 text-xs font-medium text-maroon placeholder:text-maroon/30 shadow-2xs outline-none focus:border-maroon focus:ring-2 focus:ring-maroon/15"
          />
        </div>

        {/* Note */}
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1.5 font-semibold text-maroon">
            <FileText className="h-3.5 w-3.5 text-gold" />
            <span>{t("noteLabel")}</span>
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("notePlaceholder")}
            className="w-full rounded-xl border border-gold/40 bg-white px-3.5 py-2.5 text-xs font-medium text-maroon placeholder:text-maroon/30 shadow-2xs outline-none focus:border-maroon focus:ring-2 focus:ring-maroon/15"
          />
        </div>

        {/* Status Options */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {/* Is Invited Toggle */}
          <label className="flex items-center gap-2 rounded-xl border border-gold/30 bg-white/70 p-2.5 cursor-pointer hover:bg-white transition-colors">
            <input
              type="checkbox"
              checked={isInvited}
              onChange={(e) => setIsInvited(e.target.checked)}
              className="h-4 w-4 rounded border-gold text-maroon focus:ring-maroon accent-maroon"
            />
            <span className="flex items-center gap-1 font-semibold text-maroon">
              <Send className="h-3.5 w-3.5 text-sky-600" />
              <span>{t("invited")}</span>
            </span>
          </label>

          {/* RSVP Status */}
          <div className="flex flex-col gap-1">
            <select
              value={rsvpStatus}
              onChange={(e) => setRsvpStatus(e.target.value as RsvpDecision)}
              className="h-full rounded-xl border border-gold/30 bg-white px-2 py-2 text-xs font-semibold text-maroon outline-none"
            >
              <option value="pending">{t("pending")}</option>
              <option value="attending">{t("attending")}</option>
              <option value="not_sure">{t("notSure")}</option>
              <option value="declined">{t("notAttending")}</option>
            </select>
          </div>
        </div>

        {/* Form Actions */}
        <div className="mt-2 flex items-center justify-end gap-2 border-t border-gold/20 pt-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-gold/40 px-4 py-2 text-xs font-semibold text-maroon/70 hover:bg-gold/10 hover:text-maroon cursor-pointer"
          >
            {tCommon("cancel")}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-maroon px-5 py-2 text-xs font-bold text-cream shadow-xs hover:bg-maroon/90 disabled:opacity-50 cursor-pointer"
          >
            {saving ? "…" : t("saveGuest")}
          </button>
        </div>
      </form>
    </div>
  );
}
