"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserCheck,
  UserX,
  Search,
  MessageSquare,
  TrendingUp,
  X,
  Clock,
} from "lucide-react";
import type { RsvpResponse } from "@/types";

interface RsvpManagerProps {
  rsvps: RsvpResponse[];
  labels: {
    title: string;
    empty: string;
    attending: string;
    notAttending: string;
    total: string;
    attendingCount: string;
    declinedCount: string;
    rate: string;
    searchPlaceholder: string;
    filterAll: string;
    filterAttending: string;
    filterDeclined: string;
    noResults: string;
  };
}

export function RsvpManager({ rsvps, labels }: RsvpManagerProps) {
  const [filter, setFilter] = useState<"all" | "attending" | "declined">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const stats = useMemo(() => {
    const total = rsvps.length;
    const attending = rsvps.filter((r) => r.attending).length;
    const declined = total - attending;
    const rate = total > 0 ? Math.round((attending / total) * 100) : 0;
    return { total, attending, declined, rate };
  }, [rsvps]);

  const filteredRsvps = useMemo(() => {
    return rsvps.filter((r) => {
      const matchesFilter =
        filter === "all"
          ? true
          : filter === "attending"
            ? r.attending
            : !r.attending;
      const matchesSearch = searchQuery.trim()
        ? r.guestName.toLowerCase().includes(searchQuery.toLowerCase().trim())
        : true;
      return matchesFilter && matchesSearch;
    });
  }, [rsvps, filter, searchQuery]);


  function formatDate(timestamp: number) {
    if (!timestamp) return "";
    try {
      return new Date(timestamp).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Total */}
        <div className="flex flex-col gap-1 rounded-2xl border border-gold/30 bg-white/90 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-maroon/60">
              {labels.total}
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-gold/15 text-maroon">
              <Users className="h-4 w-4 text-maroon/80" />
            </span>
          </div>
          <span className="text-2xl font-bold text-maroon">{stats.total}</span>
        </div>

        {/* Attending */}
        <div className="flex flex-col gap-1 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">
              {labels.attendingCount}
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <UserCheck className="h-4 w-4" />
            </span>
          </div>
          <span className="text-2xl font-bold text-emerald-700">
            {stats.attending}
          </span>
        </div>

        {/* Declined */}
        <div className="flex flex-col gap-1 rounded-2xl border border-rose-200 bg-rose-50/50 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-800">
              {labels.declinedCount}
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
              <UserX className="h-4 w-4" />
            </span>
          </div>
          <span className="text-2xl font-bold text-rose-700">
            {stats.declined}
          </span>
        </div>

        {/* Rate */}
        <div className="flex flex-col gap-1 rounded-2xl border border-gold/30 bg-white/90 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-maroon/60">
              {labels.rate}
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-gold/15 text-gold">
              <TrendingUp className="h-4 w-4 text-maroon" />
            </span>
          </div>
          <span className="text-2xl font-bold text-maroon">{stats.rate}%</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      {rsvps.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Segmented Filter Buttons */}
          <div className="flex items-center rounded-xl border border-gold/30 bg-cream/50 p-1">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                filter === "all"
                  ? "bg-white text-maroon shadow-xs"
                  : "text-maroon/60 hover:text-maroon"
              }`}
            >
              {labels.filterAll} ({stats.total})
            </button>
            <button
              type="button"
              onClick={() => setFilter("attending")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                filter === "attending"
                  ? "bg-white text-emerald-700 shadow-xs"
                  : "text-maroon/60 hover:text-emerald-700"
              }`}
            >
              {labels.filterAttending} ({stats.attending})
            </button>
            <button
              type="button"
              onClick={() => setFilter("declined")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                filter === "declined"
                  ? "bg-white text-rose-700 shadow-xs"
                  : "text-maroon/60 hover:text-rose-700"
              }`}
            >
              {labels.filterDeclined} ({stats.declined})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 sm:max-w-xs">
            <div className="relative flex items-center">
              <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-maroon/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={labels.searchPlaceholder}
                className="w-full rounded-full border border-gold/50 bg-white py-2 pl-9 pr-9 text-xs font-medium text-maroon placeholder:text-maroon/35 shadow-xs outline-none transition-all hover:border-gold/80 focus:border-maroon focus:ring-2 focus:ring-maroon/15"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 text-maroon/40 hover:text-maroon cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Guest Response List */}
      {rsvps.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gold/40 bg-white/60 px-6 py-12 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-2xl">
            💌
          </span>
          <p className="mt-3 font-semibold text-maroon">{labels.empty}</p>
          <p className="mt-1 max-w-sm text-xs text-maroon/50">
            When guests open your link and reply to the invitation, their responses and blessings will appear here.
          </p>
        </div>
      ) : filteredRsvps.length === 0 ? (
        <div className="rounded-2xl border border-gold/25 bg-white/60 p-8 text-center text-xs text-maroon/60">
          {labels.noResults}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {filteredRsvps.map((rsvp) => (
              <motion.div
                key={rsvp.responseId}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-3 rounded-2xl border border-gold/30 bg-white p-4 shadow-xs transition-shadow hover:shadow-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-col gap-0.5">
                    {/* Guest Name & Subtle User Tag */}
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gold/15 text-maroon">
                        <Users className="h-3.5 w-3.5 text-maroon/80" />
                      </span>
                      <h4 className="text-sm font-bold text-maroon">
                        {rsvp.guestName}
                      </h4>
                    </div>

                    {/* Compact, subtle Date/Time */}
                    {rsvp.createdAt && (
                      <div className="flex items-center gap-1 pl-8 text-[11px] font-normal text-maroon/40">
                        <Clock className="h-2.5 w-2.5" />
                        <span>{formatDate(rsvp.createdAt)}</span>
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
                      {rsvp.attending ? labels.attending : labels.notAttending}
                    </span>
                  </span>
                </div>

                {/* Prominent Guest Message Card */}
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
        </div>
      )}
    </div>
  );
}
