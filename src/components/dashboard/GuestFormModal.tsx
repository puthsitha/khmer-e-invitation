"use client";

import { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import {
  X,
  User,
  MapPin,
  Tag,
  FileText,
  Send,
  AlertTriangle,
  RefreshCw,
  UserPlus,
  Ban,
} from "lucide-react";
import { findDuplicateGuest } from "@/lib/guestValidation";
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
  onReplace?: (
    existingGuestId: string,
    guestData: {
      name: string;
      from?: string;
      by?: string;
      note?: string;
      isInvited: boolean;
      rsvpStatus?: RsvpDecision;
    },
  ) => Promise<void>;
  initialGuest?: WeddingGuest | null;
  existingGuests?: WeddingGuest[];
}

const emptySubscribe = () => () => {};

export function GuestFormModal({
  isOpen,
  onClose,
  onSave,
  onReplace,
  initialGuest,
  existingGuests,
}: GuestFormModalProps) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  if (!isOpen || !mounted) return null;

  const portalTarget =
    typeof document !== "undefined"
      ? document.getElementById("portal-root") || document.body
      : null;

  if (!portalTarget) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/65 transition-opacity"
        onClick={onClose}
      />

      <GuestFormContent
        key={initialGuest?.guestId ?? "new-guest"}
        initialGuest={initialGuest}
        existingGuests={existingGuests}
        onClose={onClose}
        onSave={onSave}
        onReplace={onReplace}
      />
    </div>,
    portalTarget
  );
}

function GuestFormContent({
  initialGuest,
  existingGuests,
  onClose,
  onSave,
  onReplace,
}: {
  initialGuest?: WeddingGuest | null;
  existingGuests?: WeddingGuest[];
  onClose: () => void;
  onSave: (guestData: {
    name: string;
    from?: string;
    by?: string;
    note?: string;
    isInvited: boolean;
    rsvpStatus?: RsvpDecision;
  }) => Promise<void>;
  onReplace?: (
    existingGuestId: string,
    guestData: {
      name: string;
      from?: string;
      by?: string;
      note?: string;
      isInvited: boolean;
      rsvpStatus?: RsvpDecision;
    },
  ) => Promise<void>;
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

  // Duplicate detection state
  const [duplicateGuest, setDuplicateGuest] = useState<WeddingGuest | null>(null);

  function getCandidateData() {
    return {
      name: name.trim(),
      from: from.trim() || undefined,
      by: by.trim() || undefined,
      note: note.trim() || undefined,
      isInvited,
      rsvpStatus,
    };
  }

  async function executeSave(candidate: ReturnType<typeof getCandidateData>) {
    setSaving(true);
    setError(null);
    try {
      await onSave(candidate);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Failed to save guest. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function executeReplace(
    existingGuestId: string,
    candidate: ReturnType<typeof getCandidateData>,
  ) {
    setSaving(true);
    setError(null);
    try {
      if (onReplace) {
        await onReplace(existingGuestId, candidate);
      } else {
        await onSave(candidate);
      }
      onClose();
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Failed to replace guest. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a guest name");
      return;
    }

    const candidate = getCandidateData();

    // Check duplicate against existing guests (all 4 info fields must match)
    if (existingGuests && existingGuests.length > 0) {
      const match = findDuplicateGuest(
        candidate,
        existingGuests,
        initialGuest?.guestId,
      );
      if (match) {
        setDuplicateGuest(match);
        return;
      }
    }

    await executeSave(candidate);
  }

  return (
    <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl border border-gold/40 dark:border-gold/30 bg-cream dark:bg-[#1c161b] p-5 sm:p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150">
      <div className="flex items-center justify-between border-b border-gold/20 pb-3">
        <h3 className="font-[family-name:var(--font-heading-km)] text-lg font-bold text-maroon dark:text-[#f6eee8]">
          {initialGuest ? t("editGuest") : t("addGuest")}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full text-maroon/60 dark:text-[#f6eee8]/60 hover:bg-gold/20 hover:text-maroon dark:hover:text-[#f6eee8] transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {duplicateGuest ? (
        /* Duplicate Warning & Options: Force Add, Don't Add, Replace */
        <div className="mt-4 flex flex-col gap-4 text-xs">
          {error && (
            <div className="rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 p-2.5 text-xs text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          <div className="flex items-start gap-3 rounded-2xl border border-amber-300 dark:border-amber-600/40 bg-amber-50 dark:bg-amber-950/40 p-3.5 text-amber-900 dark:text-amber-200 shadow-2xs">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="font-bold text-xs text-amber-900 dark:text-amber-200">
                {t("duplicateWarningTitle")}
              </span>
              <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                {t("duplicateWarningDesc")}
              </p>
            </div>
          </div>

          {/* Matched Existing Guest Info */}
          <div className="rounded-2xl border border-gold/30 dark:border-gold/20 bg-white/80 dark:bg-white/5 p-3.5 shadow-2xs flex flex-col gap-2">
            <span className="font-semibold text-[11px] text-maroon/60 dark:text-[#f6eee8]/60 uppercase tracking-wider">
              {t("matchedExisting")}
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-maroon/50 dark:text-[#f6eee8]/50">{t("guestNameLabel")}:</span>{" "}
                <strong className="text-maroon dark:text-[#f6eee8]">{duplicateGuest.name}</strong>
              </div>
              <div>
                <span className="text-maroon/50 dark:text-[#f6eee8]/50">{t("fromLabel")}:</span>{" "}
                <span className="text-maroon dark:text-[#f6eee8]">{duplicateGuest.from || "—"}</span>
              </div>
              <div>
                <span className="text-maroon/50 dark:text-[#f6eee8]/50">{t("byLabel")}:</span>{" "}
                <span className="text-maroon dark:text-[#f6eee8]">{duplicateGuest.by || "—"}</span>
              </div>
              <div>
                <span className="text-maroon/50 dark:text-[#f6eee8]/50">{t("noteLabel")}:</span>{" "}
                <span className="text-maroon dark:text-[#f6eee8]">{duplicateGuest.note || "—"}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Force Add, Replace, Don't Add */}
          <div className="flex flex-col gap-2 pt-2 border-t border-gold/20">
            {/* 1. Replace button */}
            <button
              type="button"
              disabled={saving}
              onClick={() =>
                executeReplace(duplicateGuest.guestId, getCandidateData())
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-amber-700 disabled:opacity-50 cursor-pointer transition-all"
            >
              <RefreshCw className={`h-4 w-4 ${saving ? "animate-spin" : ""}`} />
              <span>{t("replace")}</span>
            </button>

            {/* 2. Force Add button */}
            <button
              type="button"
              disabled={saving}
              onClick={() => executeSave(getCandidateData())}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-maroon dark:bg-gold px-4 py-2.5 text-xs font-bold text-cream dark:text-maroon shadow-xs hover:bg-maroon/90 dark:hover:bg-gold/90 disabled:opacity-50 cursor-pointer transition-all"
            >
              <UserPlus className="h-4 w-4" />
              <span>{t("forceAdd")}</span>
            </button>

            {/* 3. Don't Add button */}
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-gold/40 dark:border-gold/30 bg-white dark:bg-[#20181e] px-4 py-2.5 text-xs font-bold text-maroon/70 dark:text-[#f6eee8]/80 hover:bg-gold/10 hover:text-maroon dark:hover:text-[#f6eee8] cursor-pointer transition-all"
            >
              <Ban className="h-4 w-4" />
              <span>{t("dontAdd")}</span>
            </button>

            {/* Back to edit info */}
            <button
              type="button"
              disabled={saving}
              onClick={() => setDuplicateGuest(null)}
              className="mt-1 text-center text-[11px] font-medium text-maroon/60 dark:text-[#f6eee8]/60 underline hover:text-maroon dark:hover:text-[#f6eee8] cursor-pointer"
            >
              ← Back to edit info
            </button>
          </div>
        </div>
      ) : (
        /* Normal Guest Input Form */
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4 text-xs">
          {error && (
            <div className="rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 p-2.5 text-xs text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 font-semibold text-maroon dark:text-[#f6eee8]">
              <User className="h-3.5 w-3.5 text-gold" />
              <span>{t("guestNameLabel")} *</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("guestNamePlaceholder")}
              required
              className="w-full rounded-xl border border-gold/40 dark:border-gold/30 bg-white dark:bg-[#20181e] px-3.5 py-2.5 text-base sm:text-xs font-medium text-maroon dark:text-[#f6eee8] placeholder:text-maroon/30 dark:placeholder:text-[#f6eee8]/30 shadow-2xs outline-none focus:border-maroon dark:focus:border-gold focus:ring-2 focus:ring-maroon/15 dark:focus:ring-gold/15"
            />
          </div>

          {/* From */}
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 font-semibold text-maroon dark:text-[#f6eee8]">
              <MapPin className="h-3.5 w-3.5 text-gold" />
              <span>{t("fromLabel")}</span>
            </label>
            <input
              type="text"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder={t("fromPlaceholder")}
              className="w-full rounded-xl border border-gold/40 dark:border-gold/30 bg-white dark:bg-[#20181e] px-3.5 py-2.5 text-base sm:text-xs font-medium text-maroon dark:text-[#f6eee8] placeholder:text-maroon/30 dark:placeholder:text-[#f6eee8]/30 shadow-2xs outline-none focus:border-maroon dark:focus:border-gold focus:ring-2 focus:ring-maroon/15 dark:focus:ring-gold/15"
            />
          </div>

          {/* By */}
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 font-semibold text-maroon dark:text-[#f6eee8]">
              <Tag className="h-3.5 w-3.5 text-gold" />
              <span>{t("byLabel")}</span>
            </label>
            <input
              type="text"
              value={by}
              onChange={(e) => setBy(e.target.value)}
              placeholder={t("byPlaceholder")}
              className="w-full rounded-xl border border-gold/40 dark:border-gold/30 bg-white dark:bg-[#20181e] px-3.5 py-2.5 text-base sm:text-xs font-medium text-maroon dark:text-[#f6eee8] placeholder:text-maroon/30 dark:placeholder:text-[#f6eee8]/30 shadow-2xs outline-none focus:border-maroon dark:focus:border-gold focus:ring-2 focus:ring-maroon/15 dark:focus:ring-gold/15"
            />
          </div>

          {/* Note */}
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 font-semibold text-maroon dark:text-[#f6eee8]">
              <FileText className="h-3.5 w-3.5 text-gold" />
              <span>{t("noteLabel")}</span>
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("notePlaceholder")}
              className="w-full rounded-xl border border-gold/40 dark:border-gold/30 bg-white dark:bg-[#20181e] px-3.5 py-2.5 text-base sm:text-xs font-medium text-maroon dark:text-[#f6eee8] placeholder:text-maroon/30 dark:placeholder:text-[#f6eee8]/30 shadow-2xs outline-none focus:border-maroon dark:focus:border-gold focus:ring-2 focus:ring-maroon/15 dark:focus:ring-gold/15"
            />
          </div>

          {/* Status Options */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Is Invited Toggle */}
            <label className="flex items-center gap-2 rounded-xl border border-gold/30 dark:border-gold/20 bg-white/70 dark:bg-[#20181e] p-2.5 cursor-pointer hover:bg-white dark:hover:bg-[#241c22] transition-colors">
              <input
                type="checkbox"
                checked={isInvited}
                onChange={(e) => setIsInvited(e.target.checked)}
                className="h-4 w-4 rounded border-gold text-maroon focus:ring-maroon accent-maroon"
              />
              <span className="flex items-center gap-1 font-semibold text-maroon dark:text-[#f6eee8]">
                <Send className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                <span>{t("invited")}</span>
              </span>
            </label>

            {/* RSVP Status */}
            <div className="flex flex-col gap-1">
              <select
                value={rsvpStatus}
                onChange={(e) => setRsvpStatus(e.target.value as RsvpDecision)}
                className="h-full rounded-xl border border-gold/30 dark:border-gold/20 bg-white dark:bg-[#20181e] px-2 py-2 text-xs font-semibold text-maroon dark:text-[#f6eee8] outline-none"
              >
                <option value="pending" className="dark:bg-[#20181e]">{t("pending")}</option>
                <option value="attending" className="dark:bg-[#20181e]">{t("attending")}</option>
                <option value="not_sure" className="dark:bg-[#20181e]">{t("notSure")}</option>
                <option value="declined" className="dark:bg-[#20181e]">{t("notAttending")}</option>
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-2 flex items-center justify-end gap-2 border-t border-gold/20 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-gold/40 dark:border-gold/30 px-4 py-2 text-xs font-semibold text-maroon/70 dark:text-[#f6eee8]/70 hover:bg-gold/10 hover:text-maroon dark:hover:text-[#f6eee8] cursor-pointer"
            >
              {tCommon("cancel")}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-maroon dark:bg-gold px-5 py-2 text-xs font-bold text-cream dark:text-maroon shadow-xs hover:bg-maroon/90 dark:hover:bg-gold/90 disabled:opacity-50 cursor-pointer"
            >
              {saving ? "…" : t("saveGuest")}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
