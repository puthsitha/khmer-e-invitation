"use client";

import { useState } from "react";
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
} from "lucide-react";
import { SectionShell } from "@/components/viewer/SectionShell";
import { SectionHeading } from "@/components/viewer/SectionHeading";
import { bodyFontStyle, headingFontStyle } from "@/lib/fonts";
import { submitGuestRsvp } from "@/lib/firebase/firestore";
import type { Invitation, RsvpDecision } from "@/types";

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

  const activeName = initialGuestName || enteredName.trim();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeName) {
      setError(locale === "km" ? "សូមបញ្ចូលឈ្មោះរបស់អ្នក" : "Please enter your name");
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

  return (
    <SectionShell className="text-maroon">
      <SectionHeading icon={<MailCheck className="h-4 w-4" />} dividerVariant={2}>
        {t("rsvpTitle")}
      </SectionHeading>

      <p
        className="text-glow max-w-sm text-center text-xs leading-relaxed text-maroon/80 sm:text-sm"
        style={bodyFontStyle(locale)}
      >
        {t("rsvpSubtitle")}
      </p>

      {/* Main RSVP Card */}
      <div className="relative mt-6 w-full max-w-md overflow-hidden rounded-3xl border border-gold/40 bg-gradient-to-b from-white/95 via-cream/95 to-white/95 p-6 shadow-xl backdrop-blur-md sm:p-8">
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
                  {locale === "km" ? "ការសម្រេចចិត្តរបស់អ្នក" : "Your Decision"} *
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
                        decision === "declined" ? "text-rose-600" : "text-maroon/40"
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
    </SectionShell>
  );
}
