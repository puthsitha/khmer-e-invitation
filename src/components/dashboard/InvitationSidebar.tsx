"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import {
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
  slug?: string;
  status?: "draft" | "published";
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
  tStatus?: (status: string) => string;
}

export function InvitationSidebar({
  activeSection,
  onSelectSection,
  counts,
  shareUrl,
  isOpenMobile = false,
  onCloseMobile,
}: InvitationSidebarProps) {
  const t = useTranslations("dashboard.sidebar");

  const sections: {
    key: InvitationSectionKey;
    label: string;
    icon: React.ElementType;
    badge?: number;
  }[] = [
    { key: "content", label: t("content"), icon: FileText },
    { key: "story", label: t("story"), icon: BookHeart, badge: counts.story },
    { key: "agenda", label: t("agenda"), icon: CalendarClock, badge: counts.agenda },
    { key: "media", label: t("media"), icon: ImageIcon, badge: counts.gallery },
    { key: "publish", label: t("publish"), icon: Share2 },
    { key: "rsvp", label: t("rsvp"), icon: MailCheck, badge: counts.rsvps },
  ];

  const content = (
    <div className="flex h-full flex-col min-h-0">
      {/* Navigation Links to Sections */}
      <nav className="flex flex-1 flex-col gap-1.5 px-3 pt-2 overflow-y-auto">
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
                  ? "bg-maroon dark:bg-gold text-cream dark:text-maroon shadow-md shadow-maroon/15"
                  : "text-maroon/70 dark:text-[#f6eee8]/70 hover:bg-gold/15 dark:hover:bg-gold/20 hover:text-maroon dark:hover:text-[#f6eee8]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  size={16}
                  className={isActive ? "text-gold dark:text-maroon" : "text-maroon/60 dark:text-[#f6eee8]/60 group-hover:text-maroon dark:group-hover:text-[#f6eee8]"}
                />
                <span>{section.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {section.badge !== undefined && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      isActive
                        ? "bg-white/20 dark:bg-maroon/20 text-cream dark:text-maroon"
                        : "bg-gold/20 text-maroon dark:bg-gold/25 dark:text-gold group-hover:bg-gold/30"
                    }`}
                  >
                    {section.badge}
                  </span>
                )}
                {isActive && (
                  <ChevronRight size={12} className="text-gold dark:text-maroon" strokeWidth={3} />
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Live Preview / External Link Card at Bottom */}
      {shareUrl && (
        <div className="mt-auto shrink-0 border-t border-gold/20 dark:border-gold/20 p-4">
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl border border-gold/60 dark:border-gold/30 bg-white/70 dark:bg-[#1c161b] px-3 py-2 text-xs font-bold text-maroon dark:text-[#f6eee8] shadow-xs transition-colors hover:bg-maroon hover:text-cream dark:hover:bg-gold dark:hover:text-maroon hover:border-maroon"
          >
            <ExternalLink size={14} />
            <span>{t("viewLive")}</span>
          </a>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Left Sidebar */}
      <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-gold/30 dark:border-gold/20 bg-cream/95 dark:bg-[#140f13]/95 py-4 lg:flex">
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
              className="fixed inset-0 z-50 bg-black/50 lg:hidden"
              onClick={onCloseMobile}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-cream dark:bg-[#1c161b] py-4 pt-[max(1rem,env(safe-area-inset-top,0px))] pb-[max(1rem,env(safe-area-inset-bottom,0px))] shadow-2xl lg:hidden"
            >
              <div className="mb-2 flex items-center justify-between px-4">
                <span className="flex items-center gap-2 font-[family-name:var(--font-heading-km)] text-base text-maroon dark:text-[#f6eee8]">
                  <Sparkles className="h-4 w-4 text-gold" />
                  {t("dashboard")}
                </span>
                <button
                  type="button"
                  onClick={onCloseMobile}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-maroon dark:text-[#f6eee8] hover:bg-gold/15"
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
