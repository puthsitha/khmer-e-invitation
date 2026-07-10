"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { WaxSeal } from "@/components/ui/WaxSeal";
import { bodyFontStyle } from "@/lib/fonts";

type Phase =
  | "closed"
  | "sealBreak"
  | "flipping"
  | "flapOpen"
  | "cardOut"
  | "cardRotate"
  | "zoom";

const ORDER: Phase[] = [
  "sealBreak",
  "flipping",
  "flapOpen",
  "cardOut",
  "cardRotate",
  "zoom",
];
const DURATION_MS: Record<Phase, number> = {
  closed: 0,
  sealBreak: 700,
  flipping: 800,
  flapOpen: 650,
  cardOut: 600,
  cardRotate: 700,
  zoom: 650,
};

export function EnvelopeOpening({ onOpen }: { onOpen: () => void }) {
  const t = useTranslations("viewer");
  const locale = useLocale();
  const guestName = useSearchParams().get("to")?.trim();
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("closed");

  useEffect(() => {
    if (phase === "closed") return;
    const index = ORDER.indexOf(phase);
    const timer = setTimeout(() => {
      if (index < ORDER.length - 1) {
        setPhase(ORDER[index + 1]);
      } else {
        onOpen();
      }
    }, DURATION_MS[phase]);
    return () => clearTimeout(timer);
  }, [phase, onOpen]);

  const sealBroken = phase !== "closed";
  const flipped = phase !== "closed" && phase !== "sealBreak";
  const flipDone = flipped && phase !== "flipping";
  const flapOpen =
    phase === "flapOpen" ||
    phase === "cardOut" ||
    phase === "cardRotate" ||
    phase === "zoom";
  const cardOut =
    phase === "cardOut" || phase === "cardRotate" || phase === "zoom";
  const cardRotating = phase === "cardRotate" || phase === "zoom";
  const zooming = phase === "zoom";

  const idlePulse = phase === "closed" && !reduceMotion;

  return (
    <motion.div
      animate={{ opacity: zooming ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: zooming ? 0.2 : 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-cream px-6 text-center"
    >
      <Image
        src="/images/bg.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover opacity-30"
        aria-hidden
      />
      <motion.button
        type="button"
        onClick={() => phase === "closed" && setPhase("sealBreak")}
        disabled={phase !== "closed"}
        animate={idlePulse ? { scale: [1, 1.06, 1] } : { scale: 1 }}
        transition={
          idlePulse
            ? { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.3, ease: "easeOut" }
        }
        className="relative h-56 w-80 sm:h-64 sm:w-96"
        style={{ perspective: 1400 }}
      >
        {/* envelope card — flips 180° to reveal its back */}
        <motion.div
          className="absolute inset-0"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <div
            className="absolute inset-0 rounded-md bg-white shadow-2xl"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="absolute left-1/2 top-0 h-0 w-0 -translate-x-1/2 border-x-[160px] border-t-[96px] border-x-transparent border-t-[#eee7da] sm:border-x-[192px] sm:border-t-[112px]" />
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={
                sealBroken
                  ? { rotate: reduceMotion ? 0 : 360, opacity: 0 }
                  : { rotate: 0, opacity: 1 }
              }
              transition={{
                duration: sealBroken ? (reduceMotion ? 0.2 : 0.6) : 0.3,
                ease: "easeInOut",
              }}
            >
              <WaxSeal size={72} />
            </motion.div>
          </div>

          <div
            className="absolute inset-0 flex items-center justify-center gap-1 rounded-md bg-cream shadow-2xl"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="image-glow relative h-8 w-20 sm:h-10 sm:w-24"
              >
                <Image
                  src="/images/divider_6.png"
                  alt=""
                  fill
                  sizes="96px"
                  priority={i === 1}
                  className="object-contain"
                  aria-hidden
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* flap — opens once the envelope has flipped to its back */}
        <motion.div
          animate={{ rotateX: flapOpen ? -170 : 0, opacity: flipDone ? 1 : 0 }}
          transition={{
            duration: 0.65,
            ease: "easeInOut",
            opacity: { duration: 0.2 },
          }}
          style={{
            transformOrigin: "top center",
            transformStyle: "preserve-3d",
          }}
          className="absolute left-1/2 top-0 h-0 w-0 -translate-x-1/2 border-x-[160px] border-t-[96px] border-x-transparent border-t-gold/60 sm:border-x-[192px] sm:border-t-[112px]"
        />

        {/* invitation card — slides out, rotates, then zooms to fill the screen */}
        <motion.div
          initial={{ y: 20, scale: 0.6, opacity: 0 }}
          animate={{
            y: cardOut ? -130 : 20,
            scale: zooming ? 7 : cardOut ? 0.95 : 0.6,
            opacity: cardOut ? 1 : 0,
          }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="absolute left-1/2 top-1/2 h-40 -translate-x-1/2 -translate-y-1/2 sm:h-48"
          style={{ aspectRatio: "961 / 1920" }}
        >
          <motion.div
            className="relative h-full w-full"
            style={{ transformStyle: "preserve-3d" }}
            animate={{ rotateY: cardRotating ? 360 : 0 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
          >
            <div
              className="absolute inset-0 overflow-hidden shadow-xl"
              style={{ backfaceVisibility: "hidden" }}
            >
              <Image
                src="/images/front_card.png"
                alt=""
                fill
                sizes="200px"
                className="object-cover"
              />
              <div className="absolute inset-x-0 top-[64%] flex flex-col items-center gap-1 px-2 text-center">
                <p className="text-[6px] uppercase tracking-[0.3em] text-gold sm:text-[7px]">
                  {t("invitationLabel")}
                </p>
                <p
                  className="text-[7px] leading-tight text-maroon sm:text-[8px]"
                  style={bodyFontStyle(locale)}
                >
                  {guestName
                    ? t("guestGreeting", { name: guestName })
                    : t("guestGreetingDefault")}
                </p>
              </div>
            </div>
            <div
              className="absolute inset-0 overflow-hidden shadow-xl"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <Image
                src="/images/back_card.png"
                alt=""
                fill
                sizes="200px"
                className="object-cover"
              />
            </div>
          </motion.div>
        </motion.div>
      </motion.button>

      {phase === "closed" && (
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-sm uppercase tracking-widest text-maroon/70"
        >
          {t("tapToOpen")}
        </motion.p>
      )}
    </motion.div>
  );
}
