"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface InteractiveAuthHeroProps {
  activeField: "email" | "password" | null;
  passwordVisible?: boolean;
  isSubmitting?: boolean;
  hasError?: boolean;
  className?: string;
}

export function InteractiveAuthHero({
  activeField,
  passwordVisible = false,
  isSubmitting = false,
  hasError = false,
  className = "",
}: InteractiveAuthHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });

  // Track mouse coordinates relative to the illustration center
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const angle = Math.atan2(deltaY, deltaX);
      const distance = Math.min(6, Math.hypot(deltaX, deltaY) / 40);

      setPupilOffset({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Compute specific eye / body reaction based on active field
  const isEmail = activeField === "email";
  const isPassword = activeField === "password";
  const isPasswordHidden = isPassword && !passwordVisible;
  const isPasswordRevealed = isPassword && passwordVisible;

  // Eye gaze calculation: override with field gaze or follow mouse
  const gazeX = isEmail ? 6 : isPasswordHidden ? -4 : pupilOffset.x;
  const gazeY = isEmail ? 2 : isPasswordHidden ? 4 : pupilOffset.y;

  return (
    <div
      ref={containerRef}
      className={`relative flex items-end justify-center bg-transparent p-2 ${className}`}>
      {/* SVG Characters Canvas */}
      <svg
        viewBox="0 0 360 280"
        className="w-full max-w-[340px] drop-shadow-sm select-none"
        style={{ overflow: "visible" }}>
        {/* Ground baseline */}
        <line
          x1="20"
          y1="260"
          x2="340"
          y2="260"
          stroke="#c9a24b"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.35"
        />

        {/* ---------------- 1. PURPLE PILLAR (Back-center) ---------------- */}
        <motion.g
          animate={{
            x: isEmail ? 12 : isPasswordHidden ? -10 : 0,
            y: isSubmitting ? [0, -12, 0] : 0,
            rotate: isEmail ? 6 : isPasswordHidden ? -8 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 220,
            damping: 18,
            y: isSubmitting ? { repeat: Infinity, duration: 0.6 } : undefined,
          }}>
          {/* Purple Body */}
          <rect
            x="115"
            y="65"
            width="85"
            height="195"
            rx="20"
            fill="#6366f1"
            className="transition-colors duration-300"
          />

          {/* Purple Eyes */}
          {isPasswordHidden ? (
            // Closed / Shy "No peeking" eyes
            <g
              stroke="#ffffff"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none">
              <path d="M 135 118 Q 147 108 157 118" />
              <path d="M 167 118 Q 177 108 187 118" />
            </g>
          ) : (
            // Open expressive eyes
            <g>
              {/* Left Eye */}
              <circle
                cx="145"
                cy="115"
                r={isPasswordRevealed ? "13" : "11"}
                fill="#ffffff"
              />
              <motion.circle
                cx={145 + gazeX}
                cy={115 + gazeY}
                r={isPasswordRevealed ? "7" : "5.5"}
                fill="#1e1e24"
              />
              <circle cx={143 + gazeX} cy={113 + gazeY} r="2" fill="#ffffff" />

              {/* Right Eye */}
              <circle
                cx="175"
                cy="115"
                r={isPasswordRevealed ? "13" : "11"}
                fill="#ffffff"
              />
              <motion.circle
                cx={175 + gazeX}
                cy={115 + gazeY}
                r={isPasswordRevealed ? "7" : "5.5"}
                fill="#1e1e24"
              />
              <circle cx={173 + gazeX} cy={113 + gazeY} r="2" fill="#ffffff" />
            </g>
          )}

          {/* Purple Mouth */}
          {hasError ? (
            <path
              d="M 152 142 Q 160 135 168 142"
              stroke="#1e1e24"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          ) : isPasswordRevealed ? (
            <ellipse cx="160" cy="140" rx="5" ry="7" fill="#1e1e24" />
          ) : (
            <path
              d="M 154 138 Q 160 144 166 138"
              stroke="#1e1e24"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          )}
        </motion.g>

        {/* ---------------- 2. BLACK PEEKER (Behind orange, next to purple) ---------------- */}
        <motion.g
          animate={{
            y: isPasswordHidden ? 48 : isEmail ? -8 : 0,
            x: isEmail ? 8 : 0,
            rotate: isEmail ? 4 : 0,
          }}
          transition={{ type: "spring", stiffness: 240, damping: 20 }}>
          {/* Black body */}
          <path
            d="M 180 145 L 235 125 L 245 260 L 180 260 Z"
            fill="#1e1e24"
            rx="12"
          />

          {/* Peeker Eyes (Angled) */}
          <g>
            <circle cx="205" cy="165" r="8" fill="#ffffff" />
            <motion.circle
              cx={205 + gazeX * 0.8}
              cy={165 + gazeY * 0.8}
              r="4.5"
              fill="#1e1e24"
            />
            <circle
              cx={203 + gazeX * 0.8}
              cy={163 + gazeY * 0.8}
              r="1.5"
              fill="#ffffff"
            />

            <circle cx="225" cy="160" r="8" fill="#ffffff" />
            <motion.circle
              cx={225 + gazeX * 0.8}
              cy={160 + gazeY * 0.8}
              r="4.5"
              fill="#1e1e24"
            />
            <circle
              cx={223 + gazeX * 0.8}
              cy={158 + gazeY * 0.8}
              r="1.5"
              fill="#ffffff"
            />
          </g>
        </motion.g>

        {/* ---------------- 3. ORANGE DOME (Bottom-left) ---------------- */}
        <motion.g
          animate={{
            scaleY: isSubmitting ? [1, 0.9, 1] : 1,
            x: isEmail ? 6 : isPasswordHidden ? -4 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 220,
            damping: 18,
            scaleY: isSubmitting
              ? { repeat: Infinity, duration: 0.4 }
              : undefined,
          }}>
          {/* Orange Half Dome */}
          <path d="M 35 260 A 75 75 0 0 1 185 260 Z" fill="#ff7849" />

          {/* Orange Blushing Cheeks (shown during password or error) */}
          {(isPassword || hasError) && (
            <>
              <circle cx="85" cy="228" r="8" fill="#ff4d4f" opacity="0.35" />
              <circle cx="135" cy="228" r="8" fill="#ff4d4f" opacity="0.35" />
            </>
          )}

          {/* Orange Eyes */}
          {isPasswordHidden ? (
            // Looking away / closed squint
            <g
              stroke="#1e1e24"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none">
              <path d="M 94 216 L 102 216" />
              <path d="M 120 216 L 128 216" />
            </g>
          ) : (
            // Small friendly eyes tracking mouse
            <g>
              <motion.circle
                cx={98 + gazeX * 0.7}
                cy={215 + gazeY * 0.7}
                r="4.5"
                fill="#1e1e24"
              />
              <circle
                cx={96 + gazeX * 0.7}
                cy={213 + gazeY * 0.7}
                r="1.5"
                fill="#ffffff"
              />

              <motion.circle
                cx={124 + gazeX * 0.7}
                cy={215 + gazeY * 0.7}
                r="4.5"
                fill="#1e1e24"
              />
              <circle
                cx={122 + gazeX * 0.7}
                cy={213 + gazeY * 0.7}
                r="1.5"
                fill="#ffffff"
              />
            </g>
          )}

          {/* Orange Smile / Frown */}
          {hasError ? (
            <path
              d="M 106 235 Q 111 229 116 235"
              stroke="#1e1e24"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          ) : (
            <path
              d="M 106 231 Q 111 237 116 231"
              stroke="#1e1e24"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          )}
        </motion.g>

        {/* ---------------- 4. YELLOW PILL (Bottom-right) ---------------- */}
        <motion.g
          animate={{
            x: isEmail ? 10 : isPasswordHidden ? 6 : 0,
            y: isSubmitting ? [0, -8, 0] : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 250,
            damping: 18,
            y: isSubmitting
              ? { repeat: Infinity, duration: 0.5, delay: 0.1 }
              : undefined,
          }}>
          {/* Yellow pill/arch body */}
          <path
            d="M 230 260 L 230 190 A 35 35 0 0 1 300 190 L 300 260 Z"
            fill="#facc15"
          />

          {/* Yellow Eyes */}
          <g>
            <motion.circle
              cx={isPasswordHidden ? 258 : 252 + gazeX * 0.7}
              cy={200 + gazeY * 0.7}
              r="4.5"
              fill="#1e1e24"
            />
            <circle
              cx={isPasswordHidden ? 256 : 250 + gazeX * 0.7}
              cy={198 + gazeY * 0.7}
              r="1.5"
              fill="#ffffff"
            />

            <motion.circle
              cx={isPasswordHidden ? 282 : 276 + gazeX * 0.7}
              cy={200 + gazeY * 0.7}
              r="4.5"
              fill="#1e1e24"
            />
            <circle
              cx={isPasswordHidden ? 280 : 274 + gazeX * 0.7}
              cy={198 + gazeY * 0.7}
              r="1.5"
              fill="#ffffff"
            />
          </g>

          {/* Yellow Smile / Expression */}
          <path
            d={
              hasError
                ? "M 260 220 Q 264 215 268 220"
                : isPasswordHidden
                  ? "M 264 218 L 270 218"
                  : "M 260 216 Q 264 222 268 216"
            }
            stroke="#1e1e24"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </motion.g>
      </svg>
    </div>
  );
}
