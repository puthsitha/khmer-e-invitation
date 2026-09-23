"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Copy,
  Check,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  MessageSquare,
  Send,
  QrCode,
} from "lucide-react";
import { GuestQrModal } from "./GuestQrModal";
import type { WeddingGuest } from "@/types";

interface GuestTableProps {
  guests: WeddingGuest[];
  slug?: string;
  onEditGuest: (guest: WeddingGuest) => void;
  onDeleteGuest: (guest: WeddingGuest) => void;
  onToggleInvited: (guestId: string, currentStatus: boolean) => void;
}

export function GuestTable({
  guests,
  slug,
  onEditGuest,
  onDeleteGuest,
  onToggleInvited,
}: GuestTableProps) {
  const t = useTranslations("dashboard.editor.rsvp");
  const locale = useLocale();
  const [copiedGuestId, setCopiedGuestId] = useState<string | null>(null);
  const [qrGuest, setQrGuest] = useState<WeddingGuest | null>(null);

  // Generate unique encrypted URL for each guest
  function getGuestUrl(token: string) {
    if (typeof window === "undefined") return "";
    const origin = window.location.origin;
    const pathPrefix = locale === "en" ? "/en" : "";
    return `${origin}${pathPrefix}/i/${slug || "invitation"}?g=${token}`;
  }

  async function handleCopy(guest: WeddingGuest) {
    const url = getGuestUrl(guest.token);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedGuestId(guest.guestId);
      setTimeout(() => setCopiedGuestId(null), 2000);

      // Auto mark as invited if not already invited
      if (!guest.isInvited) {
        onToggleInvited(guest.guestId, false);
      }
    } catch {
      // Fallback prompt if clipboard API blocked
      window.prompt(t("copyLink"), url);
    }
  }

  // Pill styling based on inviter name (By)
  function getByBadgeStyle(by?: string) {
    if (!by) return "bg-gray-100 text-gray-700 border-gray-200";
    const lower = by.toLowerCase();
    if (lower.includes("sitha") || lower.includes("groom") || lower.includes("កូនកំលោះ")) {
      return "bg-sky-50 text-sky-800 border-sky-200";
    }
    if (lower.includes("dalin") || lower.includes("bride") || lower.includes("កូនក្រមុំ")) {
      return "bg-rose-50 text-rose-800 border-rose-200";
    }
    return "bg-amber-50 text-amber-800 border-amber-200";
  }

  // RSVP Status styling & icons
  function renderRsvpBadge(status: WeddingGuest["rsvpStatus"]) {
    switch (status) {
      case "attending":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{t("attending")}</span>
          </span>
        );
      case "declined":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">
            <XCircle className="h-3.5 w-3.5" />
            <span>{t("notAttending")}</span>
          </span>
        );
      case "not_sure":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>{t("notSure")}</span>
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-400">
            <Clock className="h-3.5 w-3.5" />
            <span>{t("pending")}</span>
          </span>
        );
    }
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-gold/25 bg-white shadow-xs">
      <table className="w-full min-w-[760px] border-collapse text-left text-xs">
        {/* Table Header with subtle luxury warm styling */}
        <thead>
          <tr className="border-b border-gold/25 bg-[#fbf6ed] text-maroon/75">
            <th className="w-12 py-3 px-4 text-center font-bold">#</th>
            <th className="py-3 px-4 font-bold">{t("name")}</th>
            <th className="py-3 px-4 font-bold">{t("from")}</th>
            <th className="py-3 px-4 text-center font-bold">{t("by")}</th>
            <th className="py-3 px-4 text-center font-bold">{t("invitedStatus")}</th>
            <th className="py-3 px-4 text-center font-bold">{t("rsvpStatus")}</th>
            <th className="py-3 px-4 text-center font-bold">{t("copyLink")}</th>
            <th className="w-32 py-3 px-4 text-right font-bold">{t("actions")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gold/15">
          {guests.map((guest, idx) => {
            const isCopied = copiedGuestId === guest.guestId;

            return (
              <tr
                key={guest.guestId}
                className="group hover:bg-cream/40 transition-colors"
              >
                {/* Index / No. */}
                <td className="py-3.5 px-4 text-center font-semibold text-maroon/40 align-middle">
                  {guest.no ?? idx + 1}
                </td>

                {/* Name & RSVP Message */}
                <td className="py-3.5 px-4 align-middle">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="font-bold text-sm text-maroon">
                      {guest.name}
                    </span>
                    {guest.rsvpMessage ? (
                      <span
                        className="flex items-center gap-1 text-[11px] text-gold font-normal italic truncate max-w-sm"
                        title={guest.rsvpMessage}
                      >
                        <MessageSquare className="h-3 w-3 shrink-0" />
                        <span className="truncate">&ldquo;{guest.rsvpMessage}&rdquo;</span>
                      </span>
                    ) : guest.note ? (
                      <span
                        className="text-[11px] text-maroon/40 truncate max-w-xs"
                        title={guest.note}
                      >
                        {guest.note}
                      </span>
                    ) : null}
                  </div>
                </td>

                {/* From (Location) */}
                <td className="py-3.5 px-4 text-maroon/75 font-medium align-middle">
                  {guest.from || "—"}
                </td>

                {/* By (Host pill badge) */}
                <td className="py-3.5 px-4 text-center align-middle">
                  {guest.by ? (
                    <span
                      className={`inline-block rounded-md border px-2.5 py-0.5 text-[11px] font-semibold ${getByBadgeStyle(
                        guest.by,
                      )}`}
                    >
                      {guest.by}
                    </span>
                  ) : (
                    <span className="text-maroon/25">—</span>
                  )}
                </td>

                {/* Outreach / Invited Status Toggle */}
                <td className="py-3.5 px-4 text-center align-middle">
                  <button
                    type="button"
                    onClick={() => onToggleInvited(guest.guestId, guest.isInvited)}
                    title={guest.isInvited ? t("markNotInvited") : t("markInvited")}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                      guest.isInvited
                        ? "border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100"
                        : "border border-dashed border-gray-300 bg-gray-50 text-gray-400 hover:border-sky-300 hover:text-sky-600"
                    }`}
                  >
                    {guest.isInvited ? (
                      <>
                        <Send className="h-3 w-3 text-sky-600" />
                        <span>{t("invited")}</span>
                      </>
                    ) : (
                      <>
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                        <span>{t("notInvited")}</span>
                      </>
                    )}
                  </button>
                </td>

                {/* RSVP Status Badge */}
                <td className="py-3.5 px-4 text-center align-middle">
                  {renderRsvpBadge(guest.rsvpStatus)}
                </td>

                {/* Copy Link Button */}
                <td className="py-3.5 px-4 text-center align-middle">
                  <button
                    type="button"
                    onClick={() => handleCopy(guest)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                      isCopied
                        ? "bg-emerald-600 text-white shadow-2xs"
                        : "border border-gold/30 bg-white text-maroon hover:border-gold hover:bg-gold/10"
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>{t("copied")}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-maroon/60" />
                        <span>{t("copyLink")}</span>
                      </>
                    )}
                  </button>
                </td>

                {/* Actions (QR / Edit / Delete) */}
                <td className="py-3.5 px-4 text-right align-middle">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => setQrGuest(guest)}
                      title={t("showQrCode")}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-maroon/60 hover:bg-gold/15 hover:text-maroon transition-colors cursor-pointer"
                    >
                      <QrCode className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditGuest(guest)}
                      title={t("editGuest")}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-maroon/50 hover:bg-gold/15 hover:text-maroon transition-colors cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteGuest(guest)}
                      title={t("deleteGuest")}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Guest QR Code Modal */}
      <GuestQrModal
        isOpen={Boolean(qrGuest)}
        onClose={() => setQrGuest(null)}
        guest={qrGuest}
        url={qrGuest ? getGuestUrl(qrGuest.token) : ""}
      />
    </div>
  );
}
