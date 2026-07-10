"use client";

import { motion, useReducedMotion } from "framer-motion";

/** One entry in a vertical timeline (story milestones, agenda items) with a
 * glowing pulse dot, a line that grows into view, and a staggered reveal. */
export function TimelineItem({
  index,
  isLast,
  children,
}: {
  index: number;
  isLast: boolean;
  children: React.ReactNode;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.li
      className="flex gap-4"
      initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
    >
      <div className="flex flex-col items-center">
        <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
          {!reduceMotion && (
            <motion.span
              className="absolute h-4 w-4 rounded-full bg-gold/30"
              animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.2,
              }}
            />
          )}
          <span className="relative h-2.5 w-2.5 rounded-full bg-gold shadow-[0_0_8px_rgba(201,162,75,0.7)]" />
        </span>
        {!isLast && (
          <motion.span
            className="mt-1 w-px flex-1 origin-top bg-gradient-to-b from-gold/60 to-gold/10"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.7,
              delay: index * 0.1 + 0.2,
              ease: "easeOut",
            }}
          />
        )}
      </div>
      <div className="flex-1 pb-8 text-left">{children}</div>
    </motion.li>
  );
}
