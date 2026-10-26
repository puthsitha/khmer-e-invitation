"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";

const SPARK_COUNT = 14;

type AmbientSpark = {
  id: number;
  left: string;
  top: string;
  size: number;
  duration: number;
  delay: number;
  gold: boolean;
};

type Particle = {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  size: number;
  color: string;
  type: "star" | "dot" | "diamond";
  duration: number;
  delay: number;
  rotation: number;
};

type PressBurst = {
  id: string;
  x: number;
  y: number;
  particles: Particle[];
};

const GOLD_PALETTE = [
  "rgba(201, 162, 75, 0.95)", // Khmer Gold
  "rgba(230, 205, 138, 0.98)", // Gold Light
  "rgba(255, 245, 214, 1.0)", // Warm Champagne
  "rgba(255, 255, 255, 0.95)", // Sparkling White
  "rgba(242, 208, 138, 0.95)", // Soft Amber
];

function generateAmbientSparks(): AmbientSpark[] {
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

function SparkleStar({ size, color }: { size: number; color: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      style={{ filter: `drop-shadow(0 0 ${Math.max(2, size / 3)}px ${color})` }}
      aria-hidden
    >
      <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
    </svg>
  );
}

function StardustDot({ size, color }: { size: number; color: string }) {
  return (
    <span
      className="block rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        boxShadow: `0 0 ${size}px ${color}, 0 0 ${size * 2}px ${color}`,
      }}
      aria-hidden
    />
  );
}

function createBurstParticles(
  originX: number,
  originY: number,
): Particle[] {
  const count = 12;
  const baseDistance = 55;

  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const distance = baseDistance * (0.5 + Math.random() * 0.9);
    const particleType: "star" | "dot" | "diamond" =
      i % 4 === 0 ? "star" : i % 3 === 0 ? "diamond" : "dot";

    return {
      id: `${Date.now()}-${i}`,
      x: originX,
      y: originY,
      targetX: Math.cos(angle) * distance,
      targetY: Math.sin(angle) * distance + (Math.random() * 20),
      size: particleType === "star" ? 12 + Math.random() * 6 : 4 + Math.random() * 4,
      color: GOLD_PALETTE[Math.floor(Math.random() * GOLD_PALETTE.length)],
      type: particleType,
      duration: 0.6 + Math.random() * 0.3,
      delay: Math.random() * 0.05,
      rotation: (Math.random() - 0.5) * 360,
    };
  });
}

/**
 * Ambient twinkling sparks drifting over the background backdrop.
 */
export function AmbientSparks({
  interactive = false,
}: {
  interactive?: boolean;
} = {}) {
  const shouldReduceMotion = useReducedMotion();
  const [ambientSparks, setAmbientSparks] = useState<AmbientSpark[] | null>(null);
  const [mounted, setMounted] = useState(false);
  const [bursts, setBursts] = useState<PressBurst[]>([]);

  useEffect(() => {
    // Randomized positions must be rolled client-side only
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAmbientSparks(generateAmbientSparks());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!interactive || shouldReduceMotion) return;

    const handlePointerDown = (e: PointerEvent) => {
      // Ignore right/middle clicks
      if (e.button !== 0 && e.pointerType === "mouse") return;

      // Ignore inputs/textareas
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      const now = performance.now();
      const x = e.clientX;
      const y = e.clientY;

      // Spawn simple local press burst
      const burstId = `burst-${now}-${Math.random()}`;
      const newBurst: PressBurst = {
        id: burstId,
        x,
        y,
        particles: createBurstParticles(x, y),
      };

      setBursts((prev) => [...prev.slice(-3), newBurst]);
      setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== burstId));
      }, 900);
    };

    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [interactive, shouldReduceMotion]);

  if (shouldReduceMotion) return null;

  const interactiveOverlay =
    interactive && mounted && typeof document !== "undefined"
      ? createPortal(
          <div
            className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden select-none"
            aria-hidden
          >
            {/* Individual press bursts */}
            {bursts.map((burst) => (
              <div key={burst.id} className="absolute inset-0">
                {/* Burst particles */}
                {burst.particles.map((p) => (
                  <motion.div
                    key={p.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: p.x, top: p.y }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 0.3, rotate: 0 }}
                    animate={{
                      x: p.targetX,
                      y: p.targetY,
                      opacity: [1, 1, 0],
                      scale: [0.3, 1.2, 0.1],
                      rotate: p.rotation,
                    }}
                    transition={{
                      duration: p.duration,
                      delay: p.delay,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    {p.type === "star" ? (
                      <SparkleStar size={p.size} color={p.color} />
                    ) : p.type === "diamond" ? (
                      <div
                        className="rotate-45"
                        style={{
                          width: p.size,
                          height: p.size,
                          backgroundColor: p.color,
                          boxShadow: `0 0 ${p.size}px ${p.color}`,
                        }}
                      />
                    ) : (
                      <StardustDot size={p.size} color={p.color} />
                    )}
                  </motion.div>
                ))}
              </div>
            ))}
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      {/* Background ambient drifting sparks */}
      {ambientSparks && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          {ambientSparks.map((s) => {
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
      )}

      {/* Reactive press bursts & 3-press celebration overlay */}
      {interactiveOverlay}
    </>
  );
}
