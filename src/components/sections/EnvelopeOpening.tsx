"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { WaxSeal } from "@/components/ui/WaxSeal";

export function EnvelopeOpening({ onOpen }: { onOpen: () => void }) {
  const t = useTranslations("viewer");

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 1, ease: "easeInOut" }}
      className="paper-texture fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-cream px-6 text-center"
    >
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="relative h-56 w-80 sm:h-64 sm:w-96"
      >
        <div className="absolute inset-0 rounded-md bg-white shadow-2xl" />
        <div className="absolute left-1/2 top-0 h-0 w-0 -translate-x-1/2 border-x-[160px] border-t-[96px] border-x-transparent border-t-[#eee7da] sm:border-x-[192px] sm:border-t-[112px]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <WaxSeal size={72} />
        </div>
      </motion.div>

      <motion.p
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="text-sm uppercase tracking-widest text-maroon/70"
      >
        {t("tapToOpen")}
      </motion.p>
    </motion.button>
  );
}
