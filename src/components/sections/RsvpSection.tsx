"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  MailCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  MessageSquare,
  User,
  Loader2,
  Sparkles,
  Heart,
  Clock,
} from "lucide-react";
import { SectionShell } from "@/components/viewer/SectionShell";
import { SectionHeading } from "@/components/viewer/SectionHeading";
import { bodyFontStyle, headingFontStyle } from "@/lib/fonts";
import { submitGuestRsvp, listRsvpResponses } from "@/lib/firebase/firestore";
import { formatRelativeTime } from "@/lib/khmerDate";
import type { Invitation, RsvpDecision, RsvpResponse } from "@/types";

interface RsvpSectionProps {
  invitation: Invitation;
  guestId?: string;
  guestName?: string;
}

export function RsvpSection({
  invitation,
  guestId,
  guestName: initialGuestName,
}: RsvpSectionProps) {
  const t = useTranslations("viewer");
  const locale = useLocale();

  const [enteredName, setEnteredName] = useState(initialGuestName || "");
  const [decision, setDecision] = useState<RsvpDecision>("attending");
  const [wishes, setWishes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // RSVP List state
  const [rsvps, setRsvps] = useState<RsvpResponse[]>([]);
  const [loadingRsvps, setLoadingRsvps] = useState(true);
  const [showAllWishes, setShowAllWishes] = useState(false);

  const activeName = initialGuestName || enteredName.trim();

  // Load RSVP responses list
  useEffect(() => {
    let cancelled = false;

    listRsvpResponses(invitation.invitationId)
      .then((data) => {
        if (!cancelled) {
          setRsvps(data);
          setLoadingRsvps(false);
        }
      })
      .catch((err) => {
        console.warn("Could not load RSVPs for viewer:", err);
        if (!cancelled) setLoadingRsvps(false);
      });

    return () => {
      cancelled = true;
    };
  }, [invitation.invitationId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeName) {
      setError(
        locale === "km" ? "សូមបញ្ចូលឈ្មោះរបស់អ្នក" : "Please enter your name",
      );
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await submitGuestRsvp(invitation.invitationId, {
        guestId,
        guestName: activeName,
        status: decision,
        message: wishes.trim(),
      });
      setSubmitted(true);

      // Instantly prepend new response to local list
      const newResponse: RsvpResponse = {
        responseId: `temp-${Date.now()}`,
        guestId: guestId || undefined,
        guestName: activeName,
        attending: decision === "attending",
        status: decision,
        message: wishes.trim() || undefined,
        createdAt: Date.now(),
      };
      setRsvps((prev) => [
        newResponse,
        ...prev.filter(
          (r) => r.guestName.toLowerCase() !== activeName.toLowerCase(),
        ),
      ]);
    } catch {
      setError(
        locale === "km"
          ? "មានបញ្ហាក្នុងការផ្ញើការឆ្លើយតប។ សូមព្យាយាមម្តងទៀត។"
          : "Failed to submit response. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Display first 5 responses unless expanded
  const displayedRsvps = showAllWishes ? rsvps : rsvps.slice(0, 5);

  return (
    <SectionShell className="text-maroon">
      <SectionHeading
        icon={<MailCheck className="h-4 w-4" />}
        dividerVariant={2}
      >
        {t("rsvpTitle")}
      </SectionHeading>

      <p
        className="text-glow max-w-sm text-center text-xs leading-relaxed text-maroon/80 sm:text-sm"
        style={bodyFontStyle(locale)}
      >
        {t("rsvpSubtitle")}
      </p>

      {/* Main RSVP Form Card */}
      <div className="relative mt-6 w-full max-w-lg overflow-hidden rounded-2xl border border-gold/40 bg-gradient-to-b from-white/95 via-cream/95 to-white/95 p-5 shadow-xl backdrop-blur-md sm:rounded-3xl sm:p-8">
        {/* Subtle decorative background glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-gold/15 blur-3xl"
        />

        <AnimatePresence mode="wait">
          {submitted ? (
            /* Celebration Success State */
            <motion.div
              key="submitted-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center text-center py-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gold/25 via-gold-light/35 to-gold/15 text-maroon shadow-md"
              >
                <Heart className="h-8 w-8 text-maroon fill-maroon/20" />
              </motion.div>

              <h3
                className="mt-4 text-lg font-bold text-maroon sm:text-xl"
                style={headingFontStyle(locale)}
              >
                {t("rsvpSuccessTitle")}
              </h3>

              <p
                className="mt-2 text-xs leading-relaxed text-maroon/80 sm:text-sm"
                style={bodyFontStyle(locale)}
              >
                {t("rsvpSuccessMessage")}
              </p>

              {/* Status Confirmation Pill */}
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-cream/70 px-4 py-1.5 text-xs font-semibold text-maroon">
                <Sparkles className="h-3.5 w-3.5 text-gold" />
                <span>
                  {activeName}:{" "}
                  {decision === "attending"
                    ? t("attendingOption")
                    : decision === "not_sure"
                      ? t("notSureOption")
                      : t("declinedOption")}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-6 text-xs text-maroon/60 underline hover:text-maroon transition-colors cursor-pointer"
                style={bodyFontStyle(locale)}
              >
                {t("rsvpUpdateNotice")}
              </button>
            </motion.div>
          ) : (
            /* Interactive RSVP Form */
            <motion.form
              key="rsvp-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="flex flex-col gap-5 text-left"
            >
              {error && (
                <div className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs text-rose-700">
                  {error}
                </div>
              )}

              {/* Guest Greeting Header */}
              {initialGuestName ? (
                <div className="rounded-2xl border border-gold/35 bg-cream/60 p-4 text-center">
                  <span className="text-[11px] uppercase tracking-wider text-gold font-bold">
                    {locale === "km" ? "សូមគោរពអញ្ជើញ" : "Cordially Invited"}
                  </span>
                  <h4
                    className="mt-0.5 text-base font-bold text-maroon sm:text-lg"
                    style={headingFontStyle(locale)}
                  >
                    {initialGuestName}
                  </h4>
                </div>
              ) : (
                /* Name input for non-token visitors */
                <div className="flex flex-col gap-1.5">
                  <label
                    className="flex items-center gap-1.5 text-xs font-semibold text-maroon"
                    style={bodyFontStyle(locale)}
                  >
                    <User className="h-3.5 w-3.5 text-gold" />
                    <span>{t("yourName")} *</span>
                  </label>
                  <input
                    type="text"
                    value={enteredName}
                    onChange={(e) => setEnteredName(e.target.value)}
                    placeholder={t("yourNamePlaceholder")}
                    required
                    className="w-full rounded-xl border border-gold/45 bg-white px-3.5 py-2.5 text-xs font-medium text-maroon placeholder:text-maroon/30 shadow-2xs outline-none focus:border-maroon focus:ring-2 focus:ring-maroon/15"
                    style={bodyFontStyle(locale)}
                  />
                </div>
              )}

              {/* 3 Decision Options: Attending, Not Sure, Declined */}
              <div className="flex flex-col gap-2">
                <span
                  className="text-xs font-semibold text-maroon"
                  style={bodyFontStyle(locale)}
                >
                  {locale === "km" ? "ការសម្រេចចិត្តរបស់អ្នក" : "Your Decision"}{" "}
                  *
                </span>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  {/* Option 1: Attending */}
                  <button
                    type="button"
                    onClick={() => setDecision("attending")}
                    className={`flex flex-col items-center justify-center gap-1 rounded-2xl border p-3 text-center transition-all cursor-pointer ${
                      decision === "attending"
                        ? "border-emerald-500 bg-emerald-50/90 text-emerald-800 shadow-md ring-2 ring-emerald-500/20"
                        : "border-gold/30 bg-white/60 text-maroon/70 hover:bg-emerald-50/40 hover:border-emerald-300"
                    }`}
                  >
                    <CheckCircle2
                      className={`h-5 w-5 ${
                        decision === "attending"
                          ? "text-emerald-600"
                          : "text-maroon/40"
                      }`}
                    />
                    <span
                      className="text-xs font-bold leading-tight"
                      style={headingFontStyle(locale)}
                    >
                      {t("attendingOption")}
                    </span>
                    <span className="text-[10px] opacity-75">
                      {t("attendingDesc")}
                    </span>
                  </button>

                  {/* Option 2: Not Sure */}
                  <button
                    type="button"
                    onClick={() => setDecision("not_sure")}
                    className={`flex flex-col items-center justify-center gap-1 rounded-2xl border p-3 text-center transition-all cursor-pointer ${
                      decision === "not_sure"
                        ? "border-amber-500 bg-amber-50/90 text-amber-800 shadow-md ring-2 ring-amber-500/20"
                        : "border-gold/30 bg-white/60 text-maroon/70 hover:bg-amber-50/40 hover:border-amber-300"
                    }`}
                  >
                    <HelpCircle
                      className={`h-5 w-5 ${
                        decision === "not_sure"
                          ? "text-amber-600"
                          : "text-maroon/40"
                      }`}
                    />
                    <span
                      className="text-xs font-bold leading-tight"
                      style={headingFontStyle(locale)}
                    >
                      {t("notSureOption")}
                    </span>
                    <span className="text-[10px] opacity-75">
                      {t("notSureDesc")}
                    </span>
                  </button>

                  {/* Option 3: Declined */}
                  <button
                    type="button"
                    onClick={() => setDecision("declined")}
                    className={`flex flex-col items-center justify-center gap-1 rounded-2xl border p-3 text-center transition-all cursor-pointer ${
                      decision === "declined"
                        ? "border-rose-500 bg-rose-50/90 text-rose-800 shadow-md ring-2 ring-rose-500/20"
                        : "border-gold/30 bg-white/60 text-maroon/70 hover:bg-rose-50/40 hover:border-rose-300"
                    }`}
                  >
                    <XCircle
                      className={`h-5 w-5 ${
                        decision === "declined"
                          ? "text-rose-600"
                          : "text-maroon/40"
                      }`}
                    />
                    <span
                      className="text-xs font-bold leading-tight"
                      style={headingFontStyle(locale)}
                    >
                      {t("declinedOption")}
                    </span>
                    <span className="text-[10px] opacity-75">
                      {t("declinedDesc")}
                    </span>
                  </button>
                </div>
              </div>

              {/* Blessings & Wishes Text Area */}
              <div className="flex flex-col gap-1.5">
                <label
                  className="flex items-center gap-1.5 text-xs font-semibold text-maroon"
                  style={bodyFontStyle(locale)}
                >
                  <MessageSquare className="h-3.5 w-3.5 text-gold" />
                  <span>{t("wishesLabel")}</span>
                </label>
                <textarea
                  rows={3}
                  value={wishes}
                  onChange={(e) => setWishes(e.target.value)}
                  placeholder={t("wishesPlaceholder")}
                  className="w-full rounded-2xl border border-gold/45 bg-white p-3 text-xs font-medium leading-relaxed text-maroon placeholder:text-maroon/30 shadow-2xs outline-none focus:border-maroon focus:ring-2 focus:ring-maroon/15"
                  style={bodyFontStyle(locale)}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold via-[#d4af37] to-gold py-3 text-xs font-bold uppercase tracking-widest text-cream shadow-lg hover:shadow-xl transition-all disabled:opacity-50 cursor-pointer"
                style={headingFontStyle(locale)}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t("submittingRsvp")}</span>
                  </>
                ) : (
                  <>
                    <MailCheck className="h-4 w-4" />
                    <span>{t("submitRsvp")}</span>
                  </>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* RSVP Responses & Wishes Guestbook List under RsvpSection */}
      <div className="relative mt-10 w-full max-w-lg flex flex-col gap-4">
        {/* Section Sub-heading */}
        <div className="flex items-center justify-between border-b border-gold/30 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold/15 text-maroon">
              <Heart className="h-4 w-4 fill-gold/30 text-gold" />
            </span>
            <h3
              className="text-glow text-base font-bold text-maroon sm:text-lg"
              style={headingFontStyle(locale)}
            >
              {t("guestListTitle")}
            </h3>
          </div>

          {rsvps.length > 0 && (
            <span className="rounded-full border border-gold/30 bg-white/80 px-2.5 py-0.5 text-xs font-semibold text-maroon shadow-2xs">
              {rsvps.length}
            </span>
          )}
        </div>

        <p
          className="text-glow text-xs text-maroon/70 -mt-1"
          style={bodyFontStyle(locale)}
        >
          {t("guestListSubtitle")}
        </p>

        {loadingRsvps ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gold" />
          </div>
        ) : rsvps.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gold/40 bg-white/70 p-6 text-center shadow-xs backdrop-blur-xs">
            <span className="text-2xl" aria-hidden>
              🌸
            </span>
            <p
              className="mt-2 text-xs text-maroon/70 sm:text-sm"
              style={bodyFontStyle(locale)}
            >
              {t("noRsvpYet")}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <AnimatePresence initial={false}>
              {displayedRsvps.map((rsvp) => {
                const isAttending =
                  rsvp.status === "attending" || rsvp.attending;
                const isDeclined = rsvp.status === "declined";
                const isNotSure = rsvp.status === "not_sure";

                return (
                  <motion.div
                    key={rsvp.responseId}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col gap-2 rounded-2xl border border-gold/30 bg-white/90 p-4 shadow-xs backdrop-blur-sm transition-all hover:border-gold/50 hover:shadow-sm"
                  >
                    {/* Header Row: Guest Name + Attendance Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col min-w-0">
                        <span
                          className="font-bold text-sm text-maroon sm:text-base truncate"
                          style={headingFontStyle(locale)}
                        >
                          {rsvp.guestName}
                        </span>
                        {rsvp.createdAt && (
                          <div className="flex items-center gap-1 text-[10px] text-maroon/50 mt-0.5">
                            <Clock className="h-2.5 w-2.5 text-maroon/40" />
                            <span>
                              {formatRelativeTime(rsvp.createdAt, locale)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                          isAttending
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : isDeclined
                              ? "border-rose-200 bg-rose-50 text-rose-700"
                              : isNotSure
                                ? "border-amber-200 bg-amber-50 text-amber-700"
                                : "border-gray-200 bg-gray-50 text-gray-500"
                        }`}
                      >
                        {isAttending ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : isDeclined ? (
                          <XCircle className="h-3 w-3" />
                        ) : (
                          <HelpCircle className="h-3 w-3" />
                        )}
                        <span>
                          {isAttending
                            ? t("attendingOption")
                            : isDeclined
                              ? t("declinedOption")
                              : t("notSureOption")}
                        </span>
                      </span>
                    </div>

                    {/* Wishes / Message quote */}
                    {rsvp.message && (
                      <div className="mt-1 rounded-xl border border-gold/20 bg-cream/50 p-3 text-xs leading-relaxed text-maroon/85">
                        <p className="italic break-words">
                          &ldquo;{rsvp.message}&rdquo;
                        </p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Pagination / Expand Toggle */}
            {rsvps.length > 5 && (
              <button
                type="button"
                onClick={() => setShowAllWishes(!showAllWishes)}
                className="mt-2 flex items-center justify-center gap-1.5 rounded-full border border-gold/40 bg-white/80 py-2 px-5 text-xs font-semibold text-maroon hover:bg-gold/15 transition-all cursor-pointer shadow-2xs self-center"
                style={bodyFontStyle(locale)}
              >
                <span>
                  {showAllWishes
                    ? t("showLessWishes")
                    : t("showMoreWishes", { count: rsvps.length - 5 })}
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </SectionShell>
  );
}
