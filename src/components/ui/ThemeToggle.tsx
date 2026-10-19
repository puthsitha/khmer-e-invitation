"use client";

import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "@/contexts/ThemeContext";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const t = useTranslations("common");

  const isDark = resolvedTheme === "dark";

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      transition={{ duration: 0.15 }}
      aria-label={t("themeToggle")}
      title={isDark ? t("themeLight") : t("themeDark")}
      className={`relative flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-cream/70 text-maroon backdrop-blur-xs transition-colors hover:border-gold hover:bg-gold/15 dark:border-gold/30 dark:bg-black/40 dark:text-gold dark:hover:bg-gold/20 cursor-pointer ${className}`}
    >
      <motion.div
        key={isDark ? "dark" : "light"}
        initial={{ rotate: -45, opacity: 0, scale: 0.7 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 45, opacity: 0, scale: 0.7 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {isDark ? (
          <Moon size={16} strokeWidth={2} className="text-gold sm:h-[18px] sm:w-[18px]" />
        ) : (
          <Sun size={17} strokeWidth={2} className="text-maroon sm:h-[19px] sm:w-[19px]" />
        )}
      </motion.div>
    </motion.button>
  );
}
