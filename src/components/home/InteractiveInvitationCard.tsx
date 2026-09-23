"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useLocale } from "next-intl";
import { WaxSeal } from "@/components/ui/WaxSeal";
import { headingFontStyle, scriptFontStyle } from "@/lib/fonts";

export function InteractiveInvitationCard() {
  const locale = useLocale();
  const cardRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);

  // Mouse position relative to center of card (-0.5 to 0.5)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Physics-based spring config for natural, ultra-fluid tilt
  const springConfig = { damping: 24, stiffness: 220, mass: 0.6 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // 3D rotation angles
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [16, -16]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-16, 16]);

  // Dynamic ground shadow that moves realistically opposite to the tilt direction
  const shadowX = useTransform(smoothX, [-0.5, 0.5], [24, -24]);
  const shadowY = useTransform(smoothY, [-0.5, 0.5], [28, 8]);
  const shadowBlur = useTransform([smoothX, smoothY], ([x, y]) => {
    const dist = Math.sqrt(Math.pow(x as number, 2) + Math.pow(y as number, 2));
    return 30 + dist * 35;
  });

  // Specular glare effect moving opposite to tilt
  const glareX = useTransform(smoothX, [-0.5, 0.5], [10, 90]);
  const glareY = useTransform(smoothY, [-0.5, 0.5], [10, 90]);
  const glareBackground = useTransform(
    [glareX, glareY],
    ([x, y]) =>
      `radial-gradient(420px circle at ${x}% ${y}%, rgba(255, 248, 220, 0.75) 0%, rgba(201, 162, 75, 0.35) 28%, transparent 65%)`
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduceMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center py-4"
      style={{ perspective: 1400 }}
    >
      {/* 3D Tilt Card Wrapper with Idle Float */}
      <motion.div
        animate={
          reduceMotion || isHovered
            ? { y: 0 }
            : { y: [0, -10, 0] }
        }
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative flex items-center justify-center"
      >
        {/* Dynamic Cast Floor Shadow */}
        <motion.div
          className="pointer-events-none absolute -bottom-8 h-12 w-[240px] rounded-full sm:w-[280px]"
          style={{
            x: reduceMotion ? 0 : shadowX,
            y: reduceMotion ? 0 : shadowY,
            background: "radial-gradient(ellipse, rgba(122, 31, 43, 0.28) 0%, rgba(201, 162, 75, 0.12) 50%, transparent 75%)",
            filter: useTransform(shadowBlur, (b) => `blur(${b}px)`),
          }}
        />

        {/* 3D Tilt Card Container */}
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            rotateX: reduceMotion ? 0 : rotateX,
            rotateY: reduceMotion ? 0 : rotateY,
            transformStyle: "preserve-3d",
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.3 }}
          className="relative h-[480px] w-[280px] cursor-grab select-none rounded-3xl border border-gold/50 bg-[#fffdfa] shadow-2xl transition-shadow sm:h-[530px] sm:w-[320px] hover:shadow-[0_30px_70px_-15px_rgba(122,31,43,0.35)] active:cursor-grabbing"
        >
          {/* Card Base Layer: Background Artwork & Texture */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl bg-[#fefcf8]">
            <Image
              src="/images/front_card.png"
              alt="Royal Khmer Invitation"
              fill
              sizes="(max-width: 640px) 280px, 320px"
              priority
              className="object-cover opacity-95 transition-opacity duration-300"
            />

            {/* Luxurious Double Gold Border */}
            <div className="pointer-events-none absolute inset-2 rounded-2xl border border-gold/40 shadow-inner" />
            <div className="pointer-events-none absolute inset-3 rounded-xl border border-dashed border-gold/30" />

            {/* Golden Corner Khmer Ornaments */}
            <div className="pointer-events-none absolute left-3 top-3 h-11 w-11 opacity-80 transition-transform duration-300 group-hover:scale-105">
              <Image src="/images/Frame_1.png" alt="" fill sizes="44px" className="object-contain drop-shadow-xs" aria-hidden />
            </div>
            <div className="pointer-events-none absolute right-3 top-3 h-11 w-11 scale-x-[-1] opacity-80 transition-transform duration-300 group-hover:scale-105">
              <Image src="/images/Frame_1.png" alt="" fill sizes="44px" className="object-contain drop-shadow-xs" aria-hidden />
            </div>
            <div className="pointer-events-none absolute bottom-3 left-3 h-11 w-11 scale-y-[-1] opacity-80 transition-transform duration-300 group-hover:scale-105">
              <Image src="/images/Frame_1.png" alt="" fill sizes="44px" className="object-contain drop-shadow-xs" aria-hidden />
            </div>
            <div className="pointer-events-none absolute bottom-3 right-3 h-11 w-11 scale-x-[-1] scale-y-[-1] opacity-80 transition-transform duration-300 group-hover:scale-105">
              <Image src="/images/Frame_1.png" alt="" fill sizes="44px" className="object-contain drop-shadow-xs" aria-hidden />
            </div>

            {/* Specular Glare / Metallic Foil Reflection */}
            {!reduceMotion && (
              <motion.div
                className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                style={{
                  opacity: isHovered ? 0.45 : 0.08,
                  background: glareBackground,
                }}
              />
            )}
          </div>

          {/* Parallax Content Layers in 3D Space */}
          <div
            className="relative flex h-full flex-col items-center justify-between p-6 text-center"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Top Layer: Traditional Header */}
            <div
              className="flex flex-col items-center gap-1 pt-5"
              style={{ transform: "translateZ(35px)" }}
            >
              <span className="text-[11px] font-bold tracking-[0.28em] text-gold uppercase drop-shadow-xs sm:text-xs">
                {locale === "km" ? "សិរីសួស្តីអាពាហ៍ពិពាហ៍" : "Wedding Invitation"}
              </span>
              <div className="relative h-7 w-36 sm:h-8 sm:w-40">
                <Image
                  src="/images/divider_6.png"
                  alt=""
                  fill
                  sizes="160px"
                  className="object-contain"
                  aria-hidden
                />
              </div>
            </div>

            {/* Middle Layer: Couple Names & Date with 3D Depth */}
            <div
              className="my-auto flex flex-col items-center gap-2.5 py-4"
              style={{ transform: "translateZ(55px)" }}
            >
              <div className="inline-block rounded-full bg-gold/10 px-3 py-0.5 text-[10px] font-semibold text-gold border border-gold/20">
                {locale === "km" ? "សូមគោរពអញ្ជើញ" : "Cordially Invites You"}
              </div>

              <h3
                className="text-2xl font-bold tracking-wide text-maroon drop-shadow-md sm:text-3xl"
                style={scriptFontStyle(locale)}
              >
                {locale === "km" ? "ចិន្តា & មុនីរ័ត្ន" : "Chenda & Monyroth"}
              </h3>

              <div className="h-px w-16 bg-gradient-to-r from-transparent via-gold to-transparent" />

              <span className="text-xs font-medium tracking-wider text-maroon/80 sm:text-sm" style={headingFontStyle(locale)}>
                {locale === "km" ? "ថ្ងៃអាទិត្យ ទី១៥ ខែវិច្ឆិកា ឆ្នាំ២០២៦" : "Sunday, November 15, 2026"}
              </span>
            </div>

            {/* Bottom Layer: Floating Wax Seal with Dynamic Hover Reaction */}
            <div
              className="flex flex-col items-center gap-2.5 pb-4"
              style={{ transform: "translateZ(75px)" }}
            >
              <motion.div
                animate={{
                  scale: isHovered ? 1.12 : 1,
                  rotate: isHovered ? [0, -4, 4, 0] : 0,
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="filter drop-shadow-[0_8px_16px_rgba(201,162,75,0.4)] cursor-pointer"
              >
                <WaxSeal size={74} />
              </motion.div>
              <span className="rounded-full bg-cream/95 px-3.5 py-1 text-[10px] font-medium tracking-wider text-gold-light border border-gold/40 shadow-xs backdrop-blur-sm transition-colors hover:border-gold hover:text-maroon">
                {locale === "km" ? "ចុចដើម្បីបើកទស្សនា" : "Tap to open invitation"}
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
