"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";

const SPARK_COUNT = 14;
const PRESS_COMBO_TIMEOUT = 2200; // Reset 3-press streak if idle for > 2.2s

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
  level: number; // 1, 2, or 3
  particles: Particle[];
};

type CelebrationEffect = {
  id: string;
  pressX: number;
  pressY: number;
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
  level: number,
): Particle[] {
  const count = level === 1 ? 12 : level === 2 ? 18 : 26;
  const baseDistance = level === 1 ? 55 : level === 2 ? 80 : 120;

  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const distance = baseDistance * (0.5 + Math.random() * 0.9);
    const particleType: "star" | "dot" | "diamond" =
      i % 4 === 0 ? "star" : i % 3 === 0 ? "diamond" : "dot";

    return {
      id: `${Date.now()}-${level}-${i}`,
      x: originX,
      y: originY,
      targetX: Math.cos(angle) * distance,
      targetY: Math.sin(angle) * distance + (Math.random() * 25), // slight gravity
      size: particleType === "star" ? 14 + Math.random() * 8 : 4 + Math.random() * 6,
      color: GOLD_PALETTE[Math.floor(Math.random() * GOLD_PALETTE.length)],
      type: particleType,
      duration: 0.7 + Math.random() * 0.35,
      delay: Math.random() * 0.08,
      rotation: (Math.random() - 0.5) * 360,
    };
  });
}

function createCelebrationParticles(pressX: number, pressY: number): Particle[] {
  const particles: Particle[] = [];
  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 800;
  const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 600;

  // 1. Radial super-shower from the 3rd press point (35 particles)
  for (let i = 0; i < 35; i++) {
    const angle = (i / 35) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
    const distance = 120 + Math.random() * 320;
    const particleType: "star" | "dot" | "diamond" =
      i % 3 === 0 ? "star" : i % 2 === 0 ? "diamond" : "dot";

    particles.push({
      id: `celeb-radial-${i}-${Date.now()}`,
      x: pressX,
      y: pressY,
      targetX: Math.cos(angle) * distance,
      targetY: Math.sin(angle) * distance + (80 + Math.random() * 120), // cascading drop
      size: particleType === "star" ? 16 + Math.random() * 12 : 5 + Math.random() * 7,
      color: GOLD_PALETTE[Math.floor(Math.random() * GOLD_PALETTE.length)],
      type: particleType,
      duration: 1.8 + Math.random() * 1.0,
      delay: Math.random() * 0.15,
      rotation: (Math.random() - 0.5) * 720,
    });
  }

  // 2. Full-page golden rain & fireworks cascading across the whole screen (50 particles)
  for (let i = 0; i < 50; i++) {
    const startX = Math.random() * viewportWidth;
    const startY = Math.random() * (viewportHeight * 0.45);
    const particleType: "star" | "dot" | "diamond" =
      i % 2 === 0 ? "star" : i % 3 === 0 ? "diamond" : "dot";

    particles.push({
      id: `celeb-rain-${i}-${Date.now()}`,
      x: startX,
      y: startY,
      targetX: (Math.random() - 0.5) * 160,
      targetY: 180 + Math.random() * 380, // gentle gravity cascade
      size: particleType === "star" ? 14 + Math.random() * 14 : 5 + Math.random() * 8,
      color: GOLD_PALETTE[Math.floor(Math.random() * GOLD_PALETTE.length)],
      type: particleType,
      duration: 2.0 + Math.random() * 1.2,
      delay: Math.random() * 0.35,
      rotation: (Math.random() - 0.5) * 540,
    });
  }

  return particles;
}

/**
 * Ambient twinkling sparks drifting over the background backdrop, always on.
 * When `interactive` is enabled (used in ViewerExperience):
 * - Each tap/click spawns a reactive golden spark burst at the pointer coordinates.
 * - If pressed 3 times consecutively, triggers a full-page celebratory spark explosion!
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
  const [celebrations, setCelebrations] = useState<CelebrationEffect[]>([]);

  const pressCountRef = useRef(0);
  const lastPressTimeRef = useRef(0);

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

      // Ignore inputs/textareas to prevent visual clutter while typing
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

      // Check combo streak
      if (now - lastPressTimeRef.current < PRESS_COMBO_TIMEOUT) {
        pressCountRef.current += 1;
      } else {
        pressCountRef.current = 1;
      }
      lastPressTimeRef.current = now;

      const currentCount = pressCountRef.current;
      const isCelebration = currentCount >= 3;

      // Spawn local press burst
      const burstId = `burst-${now}-${Math.random()}`;
      const newBurst: PressBurst = {
        id: burstId,
        x,
        y,
        level: isCelebration ? 3 : currentCount,
        particles: createBurstParticles(x, y, isCelebration ? 3 : currentCount),
      };

      setBursts((prev) => [...prev.slice(-4), newBurst]);
      setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== burstId));
      }, 1200);

      // Trigger full-page celebration on 3rd press
      if (isCelebration) {
        pressCountRef.current = 0; // reset streak for next combo
        const celebrationId = `celeb-${now}`;
        const newCelebration: CelebrationEffect = {
          id: celebrationId,
          pressX: x,
          pressY: y,
          particles: createCelebrationParticles(x, y),
        };

        setCelebrations((prev) => [...prev.slice(-2), newCelebration]);
        setTimeout(() => {
          setCelebrations((prev) => prev.filter((c) => c.id !== celebrationId));
        }, 3400);
      }
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
            {/* Full-page celebratory effects */}
            {celebrations.map((celeb) => (
              <div key={celeb.id} className="absolute inset-0">
                {/* Golden ambient bloom across viewport */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.45, 0.15, 0] }}
                  transition={{ duration: 2.2, ease: "easeOut" }}
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(circle at center, rgba(230, 205, 138, 0.45) 0%, rgba(201, 162, 75, 0.22) 50%, transparent 80%)",
                  }}
                />

                {/* Expanding shockwave ring from 3rd press */}
                <motion.div
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    left: celeb.pressX,
                    top: celeb.pressY,
                    border: "2px solid rgba(245, 230, 184, 0.85)",
                    boxShadow:
                      "0 0 28px rgba(201, 162, 75, 0.65), inset 0 0 18px rgba(230, 205, 138, 0.4)",
                    width: 100,
                    height: 100,
                  }}
                  initial={{ scale: 0.2, opacity: 1 }}
                  animate={{ scale: 8, opacity: 0 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />

                {/* Celebratory particles cascading full screen */}
                {celeb.particles.map((p) => (
                  <motion.div
                    key={p.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: p.x, top: p.y }}
                    initial={{ x: 0, y: 0, opacity: 0, scale: 0.2, rotate: 0 }}
                    animate={{
                      x: p.targetX,
                      y: p.targetY,
                      opacity: [0, 1, 1, 0],
                      scale: [0.2, 1.35, 0.9, 0.1],
                      rotate: p.rotation,
                    }}
                    transition={{
                      duration: p.duration,
                      delay: p.delay,
                      ease: "easeOut",
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
                          boxShadow: `0 0 ${p.size * 1.5}px ${p.color}`,
                        }}
                      />
                    ) : (
                      <StardustDot size={p.size} color={p.color} />
                    )}
                  </motion.div>
                ))}
              </div>
            ))}

            {/* Individual press bursts */}
            {bursts.map((burst) => (
              <div key={burst.id} className="absolute inset-0">
                {/* Ripple ring on 2nd and 3rd press */}
                {burst.level >= 2 && (
                  <motion.div
                    className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{
                      left: burst.x,
                      top: burst.y,
                      border: "2px solid rgba(230, 205, 138, 0.8)",
                      boxShadow: "0 0 16px rgba(201, 162, 75, 0.5)",
                      width: 50,
                      height: 50,
                    }}
                    initial={{ scale: 0.3, opacity: 0.85 }}
                    animate={{ scale: burst.level === 3 ? 3.2 : 2.0, opacity: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                  />
                )}

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
                      scale: [0.3, 1.25, 0.1],
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
