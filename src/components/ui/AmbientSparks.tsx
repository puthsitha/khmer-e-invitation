"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const SPARK_COUNT = 14;

type Spark = {
  id: number;
  left: string;
  top: string;
  size: number;
  duration: number;
  delay: number;
  gold: boolean;
};

function generateSparks(): Spark[] {
  return Array.from({ length: SPARK_COUNT }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: 1.5 + Math.random() * Math.random() * 7,
    duration: 2 + Math.random() * 2.5,
    delay: Math.random() * 4,
    gold: i % 3 !== 0,
  }));
}

/**
 * Ambient twinkling sparks drifting over the background backdrop, always on.
 * Positions are randomized client-side only (after mount) to avoid an
 * SSR/client hydration mismatch, since the server and client would otherwise
 * each roll their own independent Math.random() values.
 */
export function AmbientSparks() {
  const shouldReduceMotion = useReducedMotion();
  const [sparks, setSparks] = useState<Spark[] | null>(null);

  useEffect(() => {
    // Randomized positions must be rolled client-side only, after the
    // SSR-matching first paint, or server/client would each pick different
    // values and React would flag a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSparks(generateSparks());
  }, []);

  if (shouldReduceMotion || !sparks) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {sparks.map((s) => {
        const core = s.gold ? "var(--color-gold-light)" : "var(--color-gold)";
        return (
          <motion.span
            key={s.id}
            className="absolute rounded-full"
            style={{
              left: s.left,
              top: s.top,
              width: s.size * 5,
              height: s.size * 5,
              background: `radial-gradient(circle, rgba(255,255,255,0.95) 0%, ${core} 30%, transparent 72%)`,
            }}
            animate={{ opacity: [0, 1, 0], scale: [0.6, 1.15, 0.6] }}
            transition={{
              duration: s.duration,
              delay: s.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
}
