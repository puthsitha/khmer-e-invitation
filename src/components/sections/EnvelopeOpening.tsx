"use client";

import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { OrnamentDivider } from "@/components/ui/OrnamentDivider";
import { pickBilingual } from "@/lib/bilingual";
import type { Invitation } from "@/types";

export function EnvelopeOpening({
  invitation,
  onOpen,
}: {
  invitation: Invitation;
  onOpen: () => void;
}) {
  const t = useTranslations("viewer");
  const locale = useLocale();
  const names = [
    pickBilingual(invitation.content.groomName, locale),
    pickBilingual(invitation.content.brideName, locale),
  ]
    .filter(Boolean)
    .join(" & ");

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 1.4, ease: "easeInOut" }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-maroon px-6 text-center text-cream"
    >
      <motion.div
        initial={{ rotateY: 0 }}
        animate={{ rotateY: [0, 6, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="flex w-72 flex-col items-center gap-4 rounded-2xl border-2 border-gold/60 bg-maroon px-8 py-10 shadow-2xl"
      >
        <OrnamentDivider />
        <p className="font-[family-name:var(--font-heading-km)] text-2xl text-gold">
          {names || t("weddingCeremony")}
        </p>
        <OrnamentDivider />
      </motion.div>
      <motion.p
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="font-[family-name:var(--font-body-km)] text-sm uppercase tracking-widest text-gold"
      >
        {t("tapToOpen")}
      </motion.p>
    </motion.button>
  );
}
