"use client";

import { useRef } from "react";
import type { CSSProperties } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

/** Splits by grapheme cluster (not raw UTF-16 code units) so combining
 * marks in complex scripts like Khmer don't get separated from their base
 * character mid-animation. */
function graphemes(text: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    return Array.from(segmenter.segment(text), (entry) => entry.segment);
  }
  return Array.from(text);
}

/** Reveals text character-by-character once scrolled into view, like it's
 * being written out. */
export function TypewriterText({
  text,
  className,
  style,
}: {
  text: string;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <p ref={ref} className={className} style={style}>
        {text}
      </p>
    );
  }

  return (
    <p ref={ref} className={className} style={style}>
      {inView &&
        graphemes(text).map((unit, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.01, delay: index * 0.02 }}
          >
            {unit}
          </motion.span>
        ))}
    </p>
  );
}
