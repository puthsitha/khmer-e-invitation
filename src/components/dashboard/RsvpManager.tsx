"use client";

import { useState, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserCheck,
  UserX,
  Search,
  MessageSquare,
  X,
  Clock,
  Plus,
  FileSpreadsheet,
  Download,
  Upload,
  Send,
} from "lucide-react";
import { formatDateTime, formatRelativeTime } from "@/lib/khmerDate";
import { GuestTable } from "./GuestTable";
import { GuestFormModal } from "./GuestFormModal";
import { GuestExcelImportModal } from "./GuestExcelImportModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { downloadGuestExcelTemplate, exportGuestsToExcel, type ParsedGuestRow } from "@/lib/excel";
import type { RsvpResponse, WeddingGuest, RsvpDecision } from "@/types";

interface RsvpManagerProps {
  guests: WeddingGuest[];
  rsvps: RsvpResponse[];
  slug?: string;
  onAddGuest: (guestData: {
    name: string;
    from?: string;
    by?: string;
    note?: string;
    isInvited: boolean;
    rsvpStatus?: RsvpDecision;
  }) => Promise<void>;
  onUpdateGuest: (guestId: string, patch: Partial<WeddingGuest>) => Promise<void>;
  onDeleteGuest: (guestId: string) => Promise<void>;
  onToggleInvited: (guestId: string, currentStatus: boolean) => Promise<void>;
  onBatchImportGuests: (importedRows: ParsedGuestRow[]) => Promise<void>;
}

export function RsvpManager({
  guests,
  rsvps,
  slug,
  onAddGuest,
  onUpdateGuest,
  onDeleteGuest,
  onToggleInvited,
  onBatchImportGuests,
}: RsvpManagerProps) {
  const t = useTranslations("dashboard.editor.rsvp");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  // Active Tab: "guests" | "wishes"
  const [activeTab, setActiveTab] = useState<"guests" | "wishes">("guests");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [rsvpFilter, setRsvpFilter] = useState<"all" | RsvpDecision>("all");
  const [invitedFilter, setInvitedFilter] = useState<"all" | "yes" | "no">("all");
  const [byFilter, setByFilter] = useState<string>("all");

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<WeddingGuest | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [deletingGuest, setDeletingGuest] = useState<WeddingGuest | null>(null);

  // Extract unique "By" inviter tags for filtering
  const uniqueByList = useMemo(() => {
    const set = new Set<string>();
    for (const g of guests) {
      if (g.by?.trim()) set.add(g.by.trim());
    }
    return Array.from(set).sort();
  }, [guests]);

  // Overall Guest & RSVP Metrics
  const stats = useMemo(() => {
    const total = guests.length;
    const invited = guests.filter((g) => g.isInvited).length;
    const remaining = total - invited;
    const attending = guests.filter((g) => g.rsvpStatus === "attending").length;
    const declined = guests.filter((g) => g.rsvpStatus === "declined").length;
    const notSure = guests.filter((g) => g.rsvpStatus === "not_sure").length;
    const pending = guests.filter((g) => !g.rsvpStatus || g.rsvpStatus === "pending").length;
    const rate = total > 0 ? Math.round((attending / total) * 100) : 0;

    return { total, invited, remaining, attending, declined, notSure, pending, rate };
  }, [guests]);

  // Filtered Guest List
  const filteredGuests = useMemo(() => {
    return guests.filter((g) => {
      // RSVP Filter
      if (rsvpFilter !== "all" && g.rsvpStatus !== rsvpFilter) {
        return false;
      }
      // Outreach Filter
      if (invitedFilter === "yes" && !g.isInvited) return false;
      if (invitedFilter === "no" && g.isInvited) return false;

      // By Filter
      if (byFilter !== "all" && g.by?.trim() !== byFilter) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = g.name.toLowerCase().includes(q);
        const matchesFrom = g.from?.toLowerCase().includes(q) ?? false;
        const matchesBy = g.by?.toLowerCase().includes(q) ?? false;
        const matchesNote = g.note?.toLowerCase().includes(q) ?? false;
        if (!matchesName && !matchesFrom && !matchesBy && !matchesNote) return false;
      }

      return true;
    });
  }, [guests, rsvpFilter, invitedFilter, byFilter, searchQuery]);

  function getRelativeDate(timestamp?: number) {
    if (!timestamp) return "";
    return formatRelativeTime(timestamp, locale);
  }

  function getFullDate(timestamp?: number) {
    if (!timestamp) return "";
    return formatDateTime(timestamp, locale, "medium");
  }

  const hasActiveFilters =
    invitedFilter !== "all" || rsvpFilter !== "all" || byFilter !== "all";

  return (
    <div className="flex flex-col gap-6">
      {/* Summary Metrics Cards — equal height, consistent borders & spacing */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Total Guests */}
        <div className="flex flex-col justify-between gap-3 rounded-2xl border border-gold/25 bg-white p-4 shadow-xs hover:border-gold/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-maroon/70">{t("total")}</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold/15 text-maroon">
              <Users className="h-4 w-4" />
            </span>
          </div>
          <span className="text-2xl font-bold leading-none text-maroon">{stats.total}</span>
        </div>

        {/* Outreach (Invited vs Remaining) */}
        <div className="flex flex-col justify-between gap-3 rounded-2xl border border-gold/25 bg-white p-4 shadow-xs hover:border-gold/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-maroon/70">
              {t("invitedCount")} / {t("remainingCount")}
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
              <Send className="h-4 w-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold leading-none text-maroon">{stats.invited}</span>
            <span className="text-xs font-medium text-maroon/50">/ {stats.remaining} {t("remainingCount")}</span>
          </div>
        </div>

        {/* Attending & Rate */}
        <div className="flex flex-col justify-between gap-3 rounded-2xl border border-gold/25 bg-white p-4 shadow-xs hover:border-gold/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-maroon/70">{t("attendingCount")}</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <UserCheck className="h-4 w-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold leading-none text-emerald-700">{stats.attending}</span>
            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
              {stats.rate}%
            </span>
          </div>
        </div>

        {/* Declined & Not Sure */}
        <div className="flex flex-col justify-between gap-3 rounded-2xl border border-gold/25 bg-white p-4 shadow-xs hover:border-gold/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-maroon/70">
              {t("declinedCount")} / {t("notSureCount")}
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
              <UserX className="h-4 w-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold leading-none text-rose-700">{stats.declined}</span>
            <span className="text-xs font-medium text-amber-700">
              (+{stats.notSure} {t("notSureCount")})
            </span>
          </div>
        </div>
      </div>

      {/* Tabs + Actions Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gold/20 pb-4">
        {/* Tab Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("guests")}
            className={`flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "guests"
                ? "bg-maroon text-cream shadow-xs"
                : "border border-gold/30 bg-white text-maroon/70 hover:bg-gold/10 hover:text-maroon"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>{t("tabGuests")} ({guests.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("wishes")}
            className={`flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "wishes"
                ? "bg-maroon text-cream shadow-xs"
                : "border border-gold/30 bg-white text-maroon/70 hover:bg-gold/10 hover:text-maroon"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>{t("tabWishes")} ({rsvps.length})</span>
          </button>
        </div>

        {/* Quick Toolbar Action Buttons */}
        {activeTab === "guests" && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setEditingGuest(null);
                setFormModalOpen(true);
              }}
              className="flex h-9 items-center gap-1.5 rounded-xl bg-maroon px-3.5 text-xs font-bold text-cream shadow-xs hover:bg-maroon/90 transition-all cursor-pointer"
            >
              <Plus size={15} />
              <span>{t("addGuest")}</span>
            </button>

            <button
              type="button"
              onClick={() => setImportModalOpen(true)}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-all cursor-pointer"
            >
              <Upload size={14} />
              <span>{t("importExcel")}</span>
            </button>

            <button
              type="button"
              onClick={downloadGuestExcelTemplate}
              title={t("downloadTemplate")}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-gold/40 bg-white px-3 text-xs font-semibold text-maroon/80 hover:bg-gold/15 hover:text-maroon transition-all cursor-pointer"
            >
              <Download size={14} />
              <span className="hidden sm:inline">{t("downloadTemplate")}</span>
            </button>

            {guests.length > 0 && (
              <button
                type="button"
                onClick={() => exportGuestsToExcel(guests, `${slug || "wedding"}-guests.xlsx`)}
                title={t("exportExcel")}
                className="flex h-9 items-center gap-1.5 rounded-xl border border-gold/40 bg-white px-3 text-xs font-semibold text-maroon/80 hover:bg-gold/15 hover:text-maroon transition-all cursor-pointer"
              >
                <FileSpreadsheet size={14} />
                <span className="hidden sm:inline">{t("exportExcel")}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tab 1: Guest List Table & Filters */}
      {activeTab === "guests" && (
        <div className="flex flex-col gap-3.5">
          {/* Search Bar (Full Width) */}
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-maroon/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="h-10 w-full rounded-xl border border-gold/30 bg-white pl-10 pr-10 text-xs font-medium text-maroon placeholder:text-maroon/40 shadow-2xs outline-none hover:border-gold/60 focus:border-maroon focus:ring-1 focus:ring-maroon/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-maroon/40 hover:text-maroon cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns (Under Search) */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Outreach Filter */}
            <select
              value={invitedFilter}
              onChange={(e) => setInvitedFilter(e.target.value as "all" | "yes" | "no")}
              className="h-9 rounded-xl border border-gold/30 bg-white px-3 text-xs font-semibold text-maroon shadow-2xs outline-none hover:border-gold/60 focus:border-maroon cursor-pointer"
            >
              <option value="all">{t("filterInvitedAll")}</option>
              <option value="yes">{t("filterInvitedYes")}</option>
              <option value="no">{t("filterInvitedNo")}</option>
            </select>

            {/* RSVP Status Filter */}
            <select
              value={rsvpFilter}
              onChange={(e) => setRsvpFilter(e.target.value as "all" | RsvpDecision)}
              className="h-9 rounded-xl border border-gold/30 bg-white px-3 text-xs font-semibold text-maroon shadow-2xs outline-none hover:border-gold/60 focus:border-maroon cursor-pointer"
            >
              <option value="all">{t("filterAll")}</option>
              <option value="attending">{t("filterAttending")}</option>
              <option value="not_sure">{t("filterNotSure")}</option>
              <option value="declined">{t("filterDeclined")}</option>
              <option value="pending">{t("filterPending")}</option>
            </select>

            {/* Host Filter (By) */}
            {uniqueByList.length > 0 && (
              <select
                value={byFilter}
                onChange={(e) => setByFilter(e.target.value)}
                className="h-9 rounded-xl border border-gold/30 bg-white px-3 text-xs font-semibold text-maroon shadow-2xs outline-none hover:border-gold/60 focus:border-maroon cursor-pointer"
              >
                <option value="all">{t("filterByAll")}</option>
                {uniqueByList.map((by) => (
                  <option key={by} value={by}>
                    {by}
                  </option>
                ))}
              </select>
            )}

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setInvitedFilter("all");
                  setRsvpFilter("all");
                  setByFilter("all");
                }}
                className="flex h-9 items-center gap-1.5 rounded-xl border border-maroon/20 bg-maroon/5 px-3 text-xs font-semibold text-maroon hover:bg-maroon/10 cursor-pointer transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                <span>{tCommon("clearFilters")}</span>
              </button>
            )}
          </div>

          {/* Guest Table or Empty State */}
          {guests.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gold/40 bg-white/60 px-6 py-14 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/15 text-3xl">
                💌
              </span>
              <p className="mt-4 font-bold text-maroon text-base">{t("empty")}</p>
              <p className="mt-1.5 max-w-md text-xs text-maroon/60">
                {t("emptyDescription")}
              </p>
              <div className="mt-5 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingGuest(null);
                    setFormModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-maroon px-4 py-2.5 text-xs font-bold text-cream shadow-xs hover:bg-maroon/90 cursor-pointer"
                >
                  <Plus size={15} />
                  <span>{t("addGuest")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImportModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 cursor-pointer"
                >
                  <Upload size={15} />
                  <span>{t("importExcel")}</span>
                </button>
              </div>
            </div>
          ) : filteredGuests.length === 0 ? (
            <div className="rounded-2xl border border-gold/25 bg-white p-8 text-center text-xs text-maroon/60 shadow-2xs">
              {t("noResults")}
            </div>
          ) : (
            <GuestTable
              guests={filteredGuests}
              slug={slug}
              onEditGuest={(guest) => {
                setEditingGuest(guest);
                setFormModalOpen(true);
              }}
              onDeleteGuest={(guest) => setDeletingGuest(guest)}
              onToggleInvited={(guestId, currentStatus) =>
                onToggleInvited(guestId, currentStatus)
              }
            />
          )}
        </div>
      )}

      {/* Tab 2: Wishes & Comments Cards */}
      {activeTab === "wishes" && (
        <div className="flex flex-col gap-3">
          {rsvps.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gold/40 bg-white/60 px-6 py-12 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 text-2xl">
                🌸
              </span>
              <p className="mt-3 font-semibold text-maroon">{t("emptyWishes")}</p>
              <p className="mt-1 max-w-sm text-xs text-maroon/50">
                {t("emptyWishesDescription")}
              </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {rsvps.map((rsvp) => (
                <motion.div
                  key={rsvp.responseId}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-3 rounded-2xl border border-gold/25 bg-white p-4 shadow-xs transition-shadow hover:shadow-md"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gold/15 text-maroon">
                          <Users className="h-3.5 w-3.5 text-maroon/80" />
                        </span>
                        <h4 className="text-sm font-bold text-maroon">
                          {rsvp.guestName}
                        </h4>
                      </div>

                      {rsvp.createdAt && (
                        <div
                          className="flex items-center gap-1 pl-8 text-[11px] font-normal text-maroon/50 cursor-help"
                          title={getFullDate(rsvp.createdAt)}
                        >
                          <Clock className="h-2.5 w-2.5 text-maroon/40" />
                          <span>{getRelativeDate(rsvp.createdAt)}</span>
                        </div>
                      )}
                    </div>

                    {/* Status Pill Badge */}
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold shadow-xs ${
                        rsvp.attending
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {rsvp.attending ? (
                        <UserCheck className="h-3.5 w-3.5" />
                      ) : (
                        <UserX className="h-3.5 w-3.5" />
                      )}
                      <span>
                        {rsvp.attending ? t("attending") : t("notAttending")}
                      </span>
                    </span>
                  </div>

                  {rsvp.message && (
                    <div className="mt-1 rounded-2xl border border-gold/25 bg-cream/40 p-4 shadow-2xs">
                      <div className="flex items-start gap-2.5">
                        <MessageSquare className="h-4 w-4 shrink-0 text-gold mt-0.5" />
                        <p className="text-sm font-medium leading-relaxed text-maroon">
                          &ldquo;{rsvp.message}&rdquo;
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      )}

      {/* Add / Edit Guest Modal */}
      <GuestFormModal
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setEditingGuest(null);
        }}
        initialGuest={editingGuest}
        onSave={async (guestData) => {
          if (editingGuest) {
            await onUpdateGuest(editingGuest.guestId, guestData);
          } else {
            await onAddGuest(guestData);
          }
        }}
      />

      {/* Excel Import Modal */}
      <GuestExcelImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={async (rows) => {
          await onBatchImportGuests(rows);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deletingGuest)}
        title={t("deleteGuest")}
        body={`${t("deleteConfirm")} (${deletingGuest?.name})`}
        confirmLabel={tCommon("delete")}
        cancelLabel={tCommon("cancel")}
        destructive={true}
        onCancel={() => setDeletingGuest(null)}
        onConfirm={async () => {
          if (deletingGuest) {
            await onDeleteGuest(deletingGuest.guestId);
            setDeletingGuest(null);
          }
        }}
      />
    </div>
  );
}
