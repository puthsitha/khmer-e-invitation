"use client";

import { motion } from "framer-motion";

export function SectionShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{ willChange: "transform, opacity" }}
      className={`flex w-full max-w-full flex-col items-center justify-center gap-6 px-4 py-8 sm:px-6 sm:py-16 text-center overflow-x-clip ${className}`}
    >
      {children}
    </motion.section>
  );
}
