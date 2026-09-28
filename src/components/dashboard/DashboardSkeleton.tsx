"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

interface DashboardSkeletonProps {
  type?: "list" | "editor";
}

export function DashboardSkeleton({ type = "list" }: DashboardSkeletonProps) {
  const t = useTranslations("dashboard");
  if (type === "list") {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10 sm:py-14">
        {/* Header Shimmer */}
        <div className="mb-8 flex items-center justify-between">
          <div className="h-8 w-48 animate-pulse rounded-xl bg-gold/20" />
          <div className="h-10 w-36 animate-pulse rounded-full bg-gold/20" />
        </div>

        {/* List Card Shimmers */}
        <div className="flex flex-col gap-3.5">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center justify-between rounded-2xl border border-gold/20 bg-white/80 p-5 shadow-xs"
            >
              <div className="flex flex-col gap-2">
                <div className="h-5 w-44 animate-pulse rounded-lg bg-gold/20" />
                <div className="flex items-center gap-2">
                  <div className="h-4 w-16 animate-pulse rounded-full bg-cream" />
                  <div className="h-4 w-20 animate-pulse rounded-full bg-gold/15" />
                </div>
              </div>
              <div className="h-4 w-12 animate-pulse rounded-md bg-gold/20" />
            </motion.div>
          ))}
        </div>

        {/* Subtle loading badge */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs font-medium text-maroon/50">
          <Sparkles className="h-3.5 w-3.5 text-gold animate-spin" />
          <span>{t("list.fetching")}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 sm:py-14">
      {/* Top back button and title shimmer */}
      <div className="mb-8 flex flex-col gap-4">
        <div className="h-4 w-28 animate-pulse rounded-lg bg-gold/20" />
        <div className="flex items-center justify-between">
          <div className="h-9 w-64 animate-pulse rounded-xl bg-gold/20" />
          <div className="h-6 w-24 animate-pulse rounded-full bg-gold/15" />
        </div>
      </div>

      {/* Editor Section Skeletons */}
      <div className="flex flex-col gap-8">
        {[1, 2, 3].map((sectionIndex) => (
          <div
            key={sectionIndex}
            className="flex flex-col gap-5 rounded-3xl border border-gold/25 bg-white/80 p-6 shadow-xs sm:p-8"
          >
            <div className="h-6 w-40 animate-pulse rounded-lg bg-gold/25" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="h-20 animate-pulse rounded-2xl bg-cream/70" />
              <div className="h-20 animate-pulse rounded-2xl bg-cream/70" />
            </div>

            <div className="h-24 animate-pulse rounded-2xl bg-cream/60" />
            <div className="h-10 w-48 animate-pulse rounded-xl bg-gold/20" />
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-center gap-2 text-xs font-medium text-maroon/50">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gold/30 border-t-maroon" />
        <span>{t("editor.loadingDetails")}</span>
      </div>
    </div>
  );
}
