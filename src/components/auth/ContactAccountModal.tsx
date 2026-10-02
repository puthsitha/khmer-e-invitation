"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { X, Send, Mail, Phone, Copy, Check, ExternalLink } from "lucide-react";
import { OrnamentDivider } from "@/components/ui/OrnamentDivider";

interface ContactAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactAccountModal({ isOpen, onClose }: ContactAccountModalProps) {
  const t = useTranslations("auth");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const contactOptions = [
    {
      key: "telegram",
      label: t("telegram"),
      value: "@puthsitha",
      rawCopy: "@puthsitha",
      href: "https://t.me/puthsitha",
      actionText: t("open"),
      icon: Send,
      color: "from-sky-500 to-blue-600",
      accent: "text-sky-600 bg-sky-50 border-sky-200",
    },
    {
      key: "email",
      label: t("emailContact"),
      value: "puthsithamouern@gmail.com",
      rawCopy: "puthsithamouern@gmail.com",
      href: "mailto:puthsithamouern@gmail.com",
      actionText: t("open"),
      icon: Mail,
      color: "from-rose-500 to-red-600",
      accent: "text-rose-600 bg-rose-50 border-rose-200",
    },
    {
      key: "phone",
      label: t("phoneNumber"),
      value: "+855 92 389 947",
      rawCopy: "+85592389947",
      href: "tel:+85592389947",
      actionText: t("call"),
      icon: Phone,
      color: "from-emerald-500 to-green-600",
      accent: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
  ];

  const handleCopy = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            aria-hidden
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 14 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-gold/40 dark:border-gold/30 bg-[#fffdfa] dark:bg-[#1c151a] p-6 shadow-2xl sm:p-8"
            role="dialog"
            aria-modal="true">
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-2 text-maroon/60 dark:text-cream/60 transition-colors hover:bg-gold/15 hover:text-maroon dark:hover:text-gold focus:outline-hidden cursor-pointer"
              aria-label={t("close")}>
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="text-center">
              <span className="inline-block rounded-full bg-gold/15 px-3 py-1 font-[family-name:var(--font-heading-km)] text-xs font-semibold text-gold-light border border-gold/30">
                VIP Access & Custom Setup
              </span>
              <h2 className="mt-2 font-[family-name:var(--font-heading-km)] text-2xl text-maroon dark:text-cream sm:text-3xl">
                {t("contactModalTitle")}
              </h2>
              <p className="mt-1.5 text-xs text-maroon/75 dark:text-cream/75 sm:text-sm">
                {t("contactModalSubtitle")}
              </p>
              <div className="my-3 flex justify-center">
                <OrnamentDivider variant={2} />
              </div>
            </div>

            {/* Contact Channels List */}
            <div className="mt-5 space-y-3">
              {contactOptions.map((option) => {
                const Icon = option.icon;
                const isCopied = copiedKey === option.key;

                return (
                  <div
                    key={option.key}
                    className="group relative flex flex-col items-start justify-between gap-3 rounded-2xl border border-gold/25 dark:border-gold/20 bg-cream/70 dark:bg-[#251c23]/80 p-3.5 transition-all duration-200 hover:border-gold/60 hover:bg-cream dark:hover:bg-[#2c212a] hover:shadow-md sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border shadow-xs ${option.accent}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-[11px] font-medium uppercase tracking-wider text-maroon/60 dark:text-cream/60">
                          {option.label}
                        </div>
                        <div className="font-semibold text-maroon dark:text-cream text-sm select-all">
                          {option.value}
                        </div>
                      </div>
                    </div>

                    <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
                      {/* Copy Button */}
                      <button
                        type="button"
                        onClick={() => handleCopy(option.key, option.rawCopy)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gold/30 dark:border-gold/20 bg-white/80 dark:bg-[#1a1418] px-2.5 py-1.5 text-xs font-medium text-maroon/80 dark:text-cream/80 shadow-2xs transition-colors hover:border-gold hover:bg-gold/15 hover:text-maroon dark:hover:text-gold cursor-pointer">
                        {isCopied ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{t("copied")}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5 text-maroon/60 dark:text-cream/60" />
                            <span>{t("copy")}</span>
                          </>
                        )}
                      </button>

                      {/* Direct Action Link */}
                      <a
                        href={option.href}
                        target={option.key === "telegram" ? "_blank" : undefined}
                        rel={option.key === "telegram" ? "noopener noreferrer" : undefined}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-maroon dark:bg-gold px-3 py-1.5 text-xs font-medium text-cream dark:text-black shadow-xs transition-transform hover:bg-maroon/90 dark:hover:bg-gold-light active:scale-95 cursor-pointer">
                        <span>{option.actionText}</span>
                        <ExternalLink className="h-3 w-3 opacity-75" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Note banner */}
            <div className="mt-5 rounded-xl border border-gold/20 dark:border-gold/15 bg-gold/5 dark:bg-gold/10 p-3 text-center text-xs text-maroon/70 dark:text-cream/75">
              💡 Our team will quickly create your credentials so you can start customizing royal digital invitations right away!
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
