"use client";

import { motion } from "framer-motion";

export function HeroReveal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: "easeOut" }}
      className="flex flex-col items-center gap-6"
    >
      {children}
    </motion.div>
  );
}
