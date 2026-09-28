"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/ui/LocaleSwitcher";
import { Menu, ChevronRight, ExternalLink } from "lucide-react";
import Image from "next/image";

interface InvitationTopNavProps {
  slug: string;
  shareUrl?: string;
  onOpenMobileMenu: () => void;
}

export function InvitationTopNav({
  slug,
  shareUrl,
  onOpenMobileMenu,
}: InvitationTopNavProps) {
  const t = useTranslations("dashboard.topNav");

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-gold/30 bg-cream/90 px-4 sm:px-6 backdrop-blur-md"
    >
      {/* Left: Mobile hamburger & breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-maroon hover:bg-gold/15 lg:hidden"
        >
          <Menu size={20} strokeWidth={1.75} />
        </button>

        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <Link
            href="/dashboard"
            className="group flex items-center gap-1.5 font-semibold text-maroon/70 transition-colors hover:text-maroon"
          >
            <div className="relative h-5 w-5 shrink-0 transition-transform group-hover:scale-110">
              <Image
                src="/images/Frame_1.png"
                alt="Logo"
                fill
                sizes="20px"
                className="object-contain drop-shadow-xs"
              />
            </div>
            <span className="hidden sm:inline">{t("allInvitations")}</span>
            <span className="sm:hidden">{t("back")}</span>
          </Link>

          <ChevronRight size={14} className="text-maroon/30" />

          <span className="max-w-[150px] truncate font-bold text-maroon sm:max-w-xs">
            {slug}
          </span>
        </div>
      </div>

      {/* Right: View Live Invitation + LocaleSwitcher */}
      <div className="flex items-center gap-2.5">
        {shareUrl && (
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1.5 text-xs font-bold text-maroon transition-colors hover:bg-gold/25"
            title={t("previewLiveTitle")}
          >
            <ExternalLink size={13} />
            <span className="hidden sm:inline">{t("previewLive")}</span>
          </a>
        )}

        <LocaleSwitcher />
      </div>
    </motion.header>
  );
}
