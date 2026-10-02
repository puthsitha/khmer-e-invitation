"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export interface InteractiveAuthHeroProps {
  activeField: "email" | "password" | null;
  typedLength?: number;
  isTyping?: boolean;
  passwordVisible?: boolean;
  isSubmitting?: boolean;
  hasError?: boolean;
  isSuccess?: boolean;
  className?: string;
}

export function InteractiveAuthHero({
  activeField,
  typedLength = 0,
  isTyping = false,
  passwordVisible = false,
  isSubmitting = false,
  hasError = false,
  isSuccess = false,
  className = "",
}: InteractiveAuthHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);

  // Natural blink loop every 3.5 - 4.5 seconds
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 140);
    }, 3800);
    return () => clearInterval(blinkInterval);
  }, []);

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

  // Typing cursor tracking: eyes follow character length to the right
  const typeTrackX = Math.min(8, (typedLength || 0) * 0.4);
  const typeTrackY = Math.min(4, (typedLength || 0) * 0.15);

  // Eye gaze calculation: override with field gaze or follow mouse/typing
  const gazeX = isEmail
    ? 5 + typeTrackX
    : isPasswordHidden
      ? -5
      : isPasswordRevealed
        ? 6 + typeTrackX
        : hasError
          ? 0
          : pupilOffset.x;

  const gazeY = isEmail
    ? 2 + typeTrackY
    : isPasswordHidden
      ? 5
      : isPasswordRevealed
        ? 3 + typeTrackY
        : hasError
          ? 4
          : pupilOffset.y;

  return (
    <div
      ref={containerRef}
      className={`relative flex items-end justify-center bg-transparent p-2 ${className}`}>
      {/* SVG Characters Canvas with error shake & success bounce */}
      <motion.svg
        viewBox="0 0 360 280"
        animate={
          hasError
            ? { x: [0, -10, 10, -8, 8, -4, 4, 0] }
            : isSuccess
              ? { y: [0, -14, 0, -8, 0] }
              : { x: 0, y: 0 }
        }
        transition={{
          duration: hasError ? 0.6 : isSuccess ? 0.7 : 0.3,
          ease: "easeInOut",
        }}
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
            x: isEmail ? 12 : isPasswordHidden ? -12 : isPasswordRevealed ? 10 : 0,
            y: isSubmitting
              ? [0, -12, 0]
              : isTyping
                ? -3
                : hasError
                  ? 4
                  : 0,
            rotate: isEmail
              ? 5
              : isPasswordHidden
                ? -9
                : isPasswordRevealed
                  ? 4
                  : hasError
                    ? -2
                    : 0,
          }}
          transition={{
            x: { type: "spring", stiffness: 220, damping: 18 },
            rotate: { type: "spring", stiffness: 220, damping: 18 },
            y: isSubmitting
              ? { type: "tween", duration: 0.6, repeat: Infinity, ease: "easeInOut" }
              : { type: "spring", stiffness: 300, damping: 14 },
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

          {/* Sweat drop on error */}
          {hasError && (
            <motion.path
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              d="M 125 76 C 125 76 120 84 120 88 A 5 5 0 0 0 130 88 C 130 84 125 76 125 76 Z"
              fill="#60a5fa"
            />
          )}

          {/* Purple Blushing Cheeks (shown during password or error) */}
          {(isPassword || hasError) && (
            <>
              <circle cx="132" cy="128" r="6.5" fill="#f43f5e" opacity="0.4" />
              <circle cx="184" cy="128" r="6.5" fill="#f43f5e" opacity="0.4" />
            </>
          )}

          {/* Purple Eyes */}
          {hasError ? (
            // Sad / Dizzy droopy eyes
            <g
              stroke="#1e1e24"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none">
              {/* Left droop */}
              <path d="M 136 114 Q 146 122 154 114" />
              {/* Right droop */}
              <path d="M 166 114 Q 176 122 184 114" />
            </g>
          ) : isPasswordHidden ? (
            // Closed / Shy "No peeking" eyes
            <g
              stroke="#ffffff"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none">
              <path d="M 135 118 Q 146 108 156 118" />
              <path d="M 166 118 Q 176 108 186 118" />
            </g>
          ) : isBlinking ? (
            // Natural blink (brief horizontal slits)
            <g stroke="#ffffff" strokeWidth="3" strokeLinecap="round">
              <line x1="134" y1="116" x2="156" y2="116" />
              <line x1="164" y1="116" x2="186" y2="116" />
            </g>
          ) : (
            // Open expressive eyes
            <g>
              {/* Left Eye */}
              <circle
                cx="145"
                cy="115"
                r={isPasswordRevealed ? "13.5" : "11"}
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
                r={isPasswordRevealed ? "13.5" : "11"}
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

          {/* Purple Cute Hands covering eyes when password hidden */}
          {isPasswordHidden && (
            <motion.g
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.25 }}>
              {/* Left little hand */}
              <circle cx="140" cy="116" r="11" fill="#818cf8" stroke="#ffffff" strokeWidth="2" />
              {/* Right little hand */}
              <circle cx="180" cy="116" r="11" fill="#818cf8" stroke="#ffffff" strokeWidth="2" />
            </motion.g>
          )}

          {/* Purple Mouth */}
          {hasError ? (
            // Wavy squiggly sad frown
            <path
              d="M 150 144 Q 155 137 160 144 Q 165 151 170 144"
              stroke="#1e1e24"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          ) : isPasswordRevealed ? (
            // Surprised "O" mouth when password is shown
            <ellipse cx="160" cy="141" rx="5.5" ry="7.5" fill="#1e1e24" />
          ) : isPasswordHidden ? (
            // Shy straight line
            <line
              x1="154"
              y1="140"
              x2="166"
              y2="140"
              stroke="#1e1e24"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          ) : isTyping ? (
            // Engaged curious mouth
            <ellipse cx="160" cy="140" rx="3.5" ry="4.5" fill="#1e1e24" />
          ) : (
            // Cheerful smile
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
            y: hasError
              ? 28
              : isPasswordHidden
                ? 54
                : isPasswordRevealed
                  ? -18
                  : isEmail
                    ? -8
                    : 0,
            x: isPasswordRevealed ? 4 : isEmail ? 8 : 0,
            rotate: isPasswordRevealed ? -3 : isEmail ? 4 : hasError ? 3 : 0,
          }}
          transition={{ type: "spring", stiffness: 240, damping: 20 }}>
          {/* Black body */}
          <path
            d="M 180 145 L 235 125 L 245 260 L 180 260 Z"
            fill="#1e1e24"
            rx="12"
          />

          {/* Peeker Eyes (Angled) */}
          {hasError ? (
            // Worried squint
            <g stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round">
              <line x1="200" y1="165" x2="212" y2="165" />
              <line x1="220" y1="160" x2="232" y2="160" />
            </g>
          ) : (
            <g>
              <circle
                cx="205"
                cy="165"
                r={isPasswordRevealed ? "9.5" : "8"}
                fill="#ffffff"
              />
              <motion.circle
                cx={205 + gazeX * 0.8}
                cy={165 + gazeY * 0.8}
                r={isPasswordRevealed ? "5.5" : "4.5"}
                fill="#1e1e24"
              />
              <circle
                cx={203 + gazeX * 0.8}
                cy={163 + gazeY * 0.8}
                r="1.5"
                fill="#ffffff"
              />

              <circle
                cx="225"
                cy="160"
                r={isPasswordRevealed ? "9.5" : "8"}
                fill="#ffffff"
              />
              <motion.circle
                cx={225 + gazeX * 0.8}
                cy={160 + gazeY * 0.8}
                r={isPasswordRevealed ? "5.5" : "4.5"}
                fill="#1e1e24"
              />
              <circle
                cx={223 + gazeX * 0.8}
                cy={158 + gazeY * 0.8}
                r="1.5"
                fill="#ffffff"
              />
            </g>
          )}
        </motion.g>

        {/* ---------------- 3. ORANGE DOME (Bottom-left) ---------------- */}
        <motion.g
          animate={{
            scaleY: isSubmitting ? [1, 0.9, 1] : isTyping ? 0.96 : 1,
            x: isEmail ? 6 : isPasswordHidden ? -6 : isPasswordRevealed ? 4 : 0,
            rotate: isPasswordHidden ? -2 : 0,
          }}
          transition={{
            x: { type: "spring", stiffness: 220, damping: 18 },
            rotate: { type: "spring", stiffness: 220, damping: 18 },
            scaleY: isSubmitting
              ? { type: "tween", duration: 0.4, repeat: Infinity, ease: "easeInOut" }
              : { type: "spring", stiffness: 300, damping: 14 },
          }}>
          {/* Orange Half Dome */}
          <path d="M 35 260 A 75 75 0 0 1 185 260 Z" fill="#ff7849" />

          {/* Sweat drop on error */}
          {hasError && (
            <motion.path
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              d="M 76 215 C 76 215 72 222 72 225 A 4 4 0 0 0 80 225 C 80 222 76 215 76 215 Z"
              fill="#60a5fa"
            />
          )}

          {/* Orange Blushing Cheeks */}
          {(isPassword || hasError) && (
            <>
              <circle cx="85" cy="228" r="8" fill="#ff4d4f" opacity="0.45" />
              <circle cx="135" cy="228" r="8" fill="#ff4d4f" opacity="0.45" />
            </>
          )}

          {/* Orange Eyes */}
          {hasError ? (
            // Stressed `> <` closed eyes
            <g stroke="#1e1e24" strokeWidth="2.5" strokeLinecap="round">
              <path d="M 94 212 L 102 216 L 94 220" />
              <path d="M 128 212 L 120 216 L 128 220" />
            </g>
          ) : isPasswordHidden ? (
            // Shy squinting lines
            <g
              stroke="#1e1e24"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none">
              <path d="M 94 216 L 102 216" />
              <path d="M 120 216 L 128 216" />
            </g>
          ) : isBlinking ? (
            // Quick natural blink
            <g stroke="#1e1e24" strokeWidth="2.5" strokeLinecap="round">
              <line x1="93" y1="216" x2="103" y2="216" />
              <line x1="119" y1="216" x2="129" y2="216" />
            </g>
          ) : (
            // Small friendly round eyes
            <g>
              <motion.circle
                cx={98 + gazeX * 0.7}
                cy={215 + gazeY * 0.7}
                r={isPasswordRevealed ? "5.5" : "4.5"}
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
                r={isPasswordRevealed ? "5.5" : "4.5"}
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
            // Sad downturned mouth
            <path
              d="M 106 235 Q 111 228 116 235"
              stroke="#1e1e24"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          ) : isPasswordRevealed ? (
            // Big open happy smile
            <path
              d="M 104 229 Q 111 241 118 229 Z"
              fill="#1e1e24"
            />
          ) : isPasswordHidden ? (
            // Shy little pout
            <path
              d="M 107 232 Q 111 230 115 232"
              stroke="#1e1e24"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          ) : (
            // Regular cute smile
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
            x: isEmail
              ? 10
              : isPasswordHidden
                ? 12
                : isPasswordRevealed
                  ? -4
                  : 0,
            y: isSubmitting
              ? [0, -8, 0]
              : isTyping
                ? -2
                : hasError
                  ? 3
                  : 0,
            rotate: isPasswordRevealed ? -3 : 0,
          }}
          transition={{
            x: { type: "spring", stiffness: 250, damping: 18 },
            rotate: { type: "spring", stiffness: 250, damping: 18 },
            y: isSubmitting
              ? { type: "tween", duration: 0.5, repeat: Infinity, ease: "easeInOut", delay: 0.1 }
              : { type: "spring", stiffness: 300, damping: 14 },
          }}>
          {/* Yellow pill/arch body */}
          <path
            d="M 230 260 L 230 190 A 35 35 0 0 1 300 190 L 300 260 Z"
            fill="#facc15"
          />

          {/* Yellow Eyes */}
          {hasError ? (
            // Worried droopy eyes
            <g stroke="#1e1e24" strokeWidth="2.5" strokeLinecap="round">
              <path d="M 252 201 Q 257 197 262 201" fill="none" />
              <path d="M 272 201 Q 277 197 282 201" fill="none" />
            </g>
          ) : isBlinking ? (
            <g stroke="#1e1e24" strokeWidth="2.5" strokeLinecap="round">
              <line x1="250" y1="200" x2="260" y2="200" />
              <line x1="272" y1="200" x2="282" y2="200" />
            </g>
          ) : (
            <g>
              <motion.circle
                cx={
                  isPasswordHidden
                    ? 262
                    : isPasswordRevealed
                      ? 250
                      : 252 + gazeX * 0.7
                }
                cy={200 + gazeY * 0.7}
                r={isPasswordRevealed ? "5.5" : "4.5"}
                fill="#1e1e24"
              />
              <circle
                cx={
                  isPasswordHidden
                    ? 260
                    : isPasswordRevealed
                      ? 248
                      : 250 + gazeX * 0.7
                }
                cy={198 + gazeY * 0.7}
                r="1.5"
                fill="#ffffff"
              />

              <motion.circle
                cx={
                  isPasswordHidden
                    ? 286
                    : isPasswordRevealed
                      ? 274
                      : 276 + gazeX * 0.7
                }
                cy={200 + gazeY * 0.7}
                r={isPasswordRevealed ? "5.5" : "4.5"}
                fill="#1e1e24"
              />
              <circle
                cx={
                  isPasswordHidden
                    ? 284
                    : isPasswordRevealed
                      ? 272
                      : 274 + gazeX * 0.7
                }
                cy={198 + gazeY * 0.7}
                r="1.5"
                fill="#ffffff"
              />
            </g>
          )}

          {/* Yellow Smile / Expression */}
          <path
            d={
              hasError
                ? "M 258 222 Q 264 214 270 222"
                : isPasswordHidden
                  ? "M 264 218 L 272 218"
                  : isPasswordRevealed
                    ? "M 258 215 Q 264 224 270 215"
                    : "M 260 216 Q 264 222 268 216"
            }
            stroke="#1e1e24"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </motion.g>
      </motion.svg>
    </div>
  );
}
