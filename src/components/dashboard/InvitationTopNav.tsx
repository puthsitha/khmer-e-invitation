"use client";

import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/ui/LocaleSwitcher";
import { Menu, ChevronRight, ExternalLink, ArrowLeft } from "lucide-react";

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
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-gold/30 bg-cream/90 px-4 py-3 sm:px-6 backdrop-blur-md"
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
            className="group flex items-center gap-1 font-semibold text-maroon/60 transition-colors hover:text-maroon"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline">All Invitations</span>
            <span className="sm:hidden">Back</span>
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
            title="Open live invitation page in a new tab"
          >
            <ExternalLink size={13} />
            <span className="hidden sm:inline">Preview Live</span>
          </a>
        )}

        <LocaleSwitcher />
      </div>
    </motion.header>
  );
}
