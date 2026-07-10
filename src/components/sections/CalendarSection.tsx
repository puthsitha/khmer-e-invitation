"use client";

import { useLocale, useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import { Calendar, CalendarPlus } from "lucide-react";
import { SectionShell } from "@/components/viewer/SectionShell";
import { GlassCard } from "@/components/viewer/GlassCard";
import { SectionHeading } from "@/components/viewer/SectionHeading";
import { headingFontStyle } from "@/lib/fonts";
import { pickBilingual } from "@/lib/bilingual";
import { downloadInvitationIcs } from "@/lib/ics";
import { dayLabel, monthGrid, monthLabel, weekdayLabels } from "@/lib/khmerCalendar";
import type { Invitation } from "@/types";

/** Loops a hand-drawn-looking circle stroke around the event day, drawing
 * in and resetting continuously. */
function DrawnCircle() {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <span className="absolute inset-0 rounded-full border-2 border-gold" />;
  }

  return (
    <svg
      viewBox="0 0 100 100"
      className="absolute inset-0 h-full w-full overflow-visible"
      style={{ transform: "rotate(-90deg)" }}
      aria-hidden
    >
      <motion.circle
        cx="50"
        cy="50"
        r="42"
        fill="none"
        stroke="var(--color-gold)"
        strokeWidth={5}
        strokeLinecap="round"
        pathLength={1}
        style={{ strokeDasharray: 1 }}
        initial={{ strokeDashoffset: 1, opacity: 0 }}
        animate={{ strokeDashoffset: 0, opacity: 1 }}
        transition={{
          duration: 1.2,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "loop",
          repeatDelay: 1.4,
        }}
      />
    </svg>
  );
}

/** The event day's circle plus a bounce that pops right as each draw
 * cycle finishes, timed to match DrawnCircle's own draw+pause period. */
function EventDayCell({ day, locale }: { day: number; locale: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.span
      className="relative flex h-10 w-10 items-center justify-center"
      animate={reduceMotion ? undefined : { scale: [1, 1, 1.25, 0.92, 1, 1] }}
      transition={
        reduceMotion
          ? undefined
          : {
              duration: 2.6,
              repeat: Infinity,
              times: [0, 0.44, 0.48, 0.53, 0.58, 1],
              ease: "easeOut",
            }
      }
    >
      <DrawnCircle />
      <span className="relative">{dayLabel(day, locale)}</span>
    </motion.span>
  );
}

export function CalendarSection({ invitation }: { invitation: Invitation }) {
  const t = useTranslations("viewer");
  const locale = useLocale();
  const eventDate = new Date(invitation.eventDate);
  const year = eventDate.getFullYear();
  const month = eventDate.getMonth();
  const eventDay = eventDate.getDate();
  const cells = monthGrid(year, month);
  const weekdays = weekdayLabels(locale);

  function handleAddToCalendar() {
    const groom = pickBilingual(invitation.content.groomName, locale);
    const bride = pickBilingual(invitation.content.brideName, locale);
    const title =
      groom && bride ? `${groom} ${t("and")} ${bride}` : t("weddingCeremony");

    downloadInvitationIcs({
      uid: invitation.invitationId,
      title,
      description: pickBilingual(invitation.content.invitationText, locale),
      location: pickBilingual(invitation.content.address, locale),
      startDate: eventDate,
    });
  }

  return (
    <SectionShell className="text-maroon">
      <SectionHeading icon={<Calendar className="h-4 w-4" />}>
        {t("calendarTitle")}
      </SectionHeading>

      <GlassCard className="max-w-sm">
        <p
          className="mb-6 text-center text-2xl tracking-[0.3em] text-gold"
          style={headingFontStyle(locale)}
        >
          {monthLabel(year, month, locale)}
        </p>
        <div className="grid grid-cols-7 gap-y-3 text-center">
          {weekdays.map((label, index) => (
            <span
              key={index}
              className="text-sm uppercase tracking-widest text-maroon/50"
            >
              {label}
            </span>
          ))}
          {cells.map((day, index) => (
            <span
              key={index}
              className="relative flex h-10 items-center justify-center text-maroon"
            >
              {day !== null &&
                (day === eventDay ? (
                  <EventDayCell day={day} locale={locale} />
                ) : (
                  <span className="relative">{dayLabel(day, locale)}</span>
                ))}
            </span>
          ))}
        </div>
      </GlassCard>

      <button
        type="button"
        onClick={handleAddToCalendar}
        className="flex items-center gap-2 rounded-full bg-cream/85 px-6 py-3 text-sm uppercase tracking-widest text-maroon shadow-md backdrop-blur-md"
      >
        <CalendarPlus className="h-4 w-4" />
        {t("addToCalendar")}
      </button>
    </SectionShell>
  );
}
