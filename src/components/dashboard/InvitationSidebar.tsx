"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/i18n/navigation";
import {
  ArrowLeft,
  FileText,
  BookHeart,
  CalendarClock,
  Image as ImageIcon,
  Share2,
  MailCheck,
  ExternalLink,
  ChevronRight,
  X,
  Sparkles,
} from "lucide-react";

export type InvitationSectionKey =
  | "content"
  | "story"
  | "agenda"
  | "media"
  | "publish"
  | "rsvp";

interface InvitationSidebarProps {
  slug: string;
  status: "draft" | "published";
  activeSection: string;
  onSelectSection: (sectionKey: InvitationSectionKey) => void;
  counts: {
    story: number;
    agenda: number;
    gallery: number;
    rsvps: number;
  };
  shareUrl?: string;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  tStatus: (status: string) => string;
}

export function InvitationSidebar({
  slug,
  status,
  activeSection,
  onSelectSection,
  counts,
  shareUrl,
  isOpenMobile = false,
  onCloseMobile,
  tStatus,
}: InvitationSidebarProps) {
  const sections: {
    key: InvitationSectionKey;
    label: string;
    icon: React.ElementType;
    badge?: number;
  }[] = [
    { key: "content", label: "Content", icon: FileText },
    { key: "story", label: "Our Story", icon: BookHeart, badge: counts.story },
    { key: "agenda", label: "Agenda", icon: CalendarClock, badge: counts.agenda },
    { key: "media", label: "Media", icon: ImageIcon, badge: counts.gallery },
    { key: "publish", label: "Publish & Share", icon: Share2 },
    { key: "rsvp", label: "RSVPs", icon: MailCheck, badge: counts.rsvps },
  ];

  const content = (
    <div className="flex h-full flex-col">
      {/* Top Back Navigation */}
      <div className="mb-4 px-4">
        <Link
          href="/dashboard"
          className="group inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-maroon/70 transition-all hover:bg-gold/15 hover:text-maroon"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Invitations</span>
        </Link>
      </div>

      {/* Current Invitation Card */}
      <div className="mx-4 mb-6 rounded-2xl border border-gold/30 bg-white/80 p-3.5 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-bold text-maroon" title={slug}>
            {slug}
          </span>

          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
              status === "published"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-gold/20 text-maroon"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                status === "published" ? "bg-emerald-600" : "bg-gold"
              }`}
            />
            {tStatus(status)}
          </span>
        </div>
      </div>

      {/* Navigation Links to Sections */}
      <nav className="flex flex-1 flex-col gap-1.5 px-3">
        <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-maroon/40">
          Invitation Sections
        </p>

        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.key;

          return (
            <button
              key={section.key}
              type="button"
              onClick={() => {
                onSelectSection(section.key);
                onCloseMobile?.();
              }}
              className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-maroon text-cream shadow-md shadow-maroon/15"
                  : "text-maroon/70 hover:bg-gold/15 hover:text-maroon"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  size={16}
                  className={isActive ? "text-gold" : "text-maroon/60 group-hover:text-maroon"}
                />
                <span>{section.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {section.badge !== undefined && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      isActive
                        ? "bg-white/20 text-cream"
                        : "bg-gold/20 text-maroon group-hover:bg-gold/30"
                    }`}
                  >
                    {section.badge}
                  </span>
                )}
                {isActive && (
                  <ChevronRight size={12} className="text-gold" strokeWidth={3} />
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Live Preview / External Link Card at Bottom */}
      {shareUrl && (
        <div className="mt-auto border-t border-gold/20 p-4">
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl border border-gold/60 bg-white/70 px-3 py-2 text-xs font-bold text-maroon shadow-xs transition-colors hover:bg-maroon hover:text-cream hover:border-maroon"
          >
            <ExternalLink size={14} />
            <span>View Live Invitation</span>
          </a>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Left Sidebar */}
      <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 flex-col border-r border-gold/30 bg-cream/90 py-4 backdrop-blur-md lg:flex">
        {content}
      </aside>

      {/* Mobile Slide-Out Drawer */}
      <AnimatePresence>
        {isOpenMobile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-maroon/40 backdrop-blur-xs lg:hidden"
              onClick={onCloseMobile}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-cream py-4 shadow-2xl lg:hidden"
            >
              <div className="mb-2 flex items-center justify-between px-4">
                <span className="flex items-center gap-2 font-[family-name:var(--font-heading-km)] text-base text-maroon">
                  <Sparkles className="h-4 w-4 text-gold" />
                  Dashboard
                </span>
                <button
                  type="button"
                  onClick={onCloseMobile}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-maroon hover:bg-gold/15"
                >
                  <X size={18} />
                </button>
              </div>

              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
