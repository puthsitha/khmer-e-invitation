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
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`flex min-h-screen w-full flex-col items-center justify-center gap-6 px-6 py-16 text-center ${className}`}
    >
      {children}
    </motion.section>
  );
}
