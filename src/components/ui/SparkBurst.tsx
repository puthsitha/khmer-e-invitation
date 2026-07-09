"use client";

import { motion, AnimatePresence } from "framer-motion";

const PARTICLE_COUNT = 18;

const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
  const angle = (i / PARTICLE_COUNT) * Math.PI * 2;
  const distance = 55 + Math.random() * 45;
  return {
    id: i,
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
    delay: Math.random() * 0.12,
    gold: i % 3 !== 0,
  };
});

/** Celebratory spark burst radiating from center, played once when `active`. */
export function SparkBurst({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <div
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
          aria-hidden
        >
          {particles.map((p) => (
            <motion.span
              key={p.id}
              className={`absolute h-1.5 w-1.5 rounded-full ${
                p.gold ? "bg-gold-light" : "bg-maroon"
              }`}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.2 }}
              transition={{ duration: 0.8, delay: p.delay, ease: "easeOut" }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
