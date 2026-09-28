"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  size: number;
  color: string;
}

export function InteractiveMouseGlow() {
  const reduceMotion = useReducedMotion();
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const lastSpawnRef = useRef<number>(0);
  const nextIdRef = useRef<number>(0);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (reduceMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });

      // Reset idle timer to cleanup settled particles after 1.2s of inactivity
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      idleTimerRef.current = setTimeout(() => {
        setParticles([]);
      }, 1200);

      // Spawn stardust sparkle particle throttled to every 65ms
      const now = performance.now();
      if (now - lastSpawnRef.current > 65) {
        lastSpawnRef.current = now;
        const id = nextIdRef.current++;
        const colors = [
          "rgba(201, 162, 75, 0.85)", // Khmer Gold
          "rgba(230, 205, 138, 0.95)", // Gold light
          "rgba(255, 235, 180, 0.95)", // Warm stardust
        ];
        const initialX = e.clientX + (Math.random() - 0.5) * 20;
        const initialY = e.clientY + (Math.random() - 0.5) * 20;

        const newParticle: Particle = {
          id,
          x: initialX,
          y: initialY,
          targetX: initialX + (Math.random() - 0.5) * 24,
          targetY: initialY - 25 - Math.random() * 22,
          size: Math.random() * 4 + 2,
          color: colors[Math.floor(Math.random() * colors.length)],
        };

        setParticles((prev) => [...prev.slice(-14), newParticle]);
      }
    };

    const handleMouseLeave = () => {
      setMousePos(null);
      setParticles([]);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [reduceMotion]);

  if (reduceMotion) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden" aria-hidden>
      {/* Radial gold spotlight following the cursor */}
      {mousePos && (
        <div
          className="absolute inset-0 transition-opacity duration-500 ease-out"
          style={{
            background: `radial-gradient(550px circle at ${mousePos.x}px ${mousePos.y}px, rgba(201, 162, 75, 0.14) 0%, rgba(230, 205, 138, 0.06) 35%, transparent 70%)`,
          }}
        />
      )}

      {/* Interactive stardust particles */}
      {particles.map((p) => (
        <motion.span
          key={p.id}
          initial={{ opacity: 0.9, scale: 1, x: p.x, y: p.y }}
          animate={{
            opacity: 0,
            scale: 0.2,
            y: p.targetY,
            x: p.targetX,
          }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
          }}
        />
      ))}
    </div>
  );
}
