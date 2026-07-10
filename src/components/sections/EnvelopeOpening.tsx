"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { WaxSeal } from "@/components/ui/WaxSeal";
import { OrnamentDivider } from "@/components/ui/OrnamentDivider";

type Phase = "closed" | "flipping" | "flapOpen" | "cardOut" | "cardRotate" | "zoom";

const ORDER: Phase[] = ["flipping", "flapOpen", "cardOut", "cardRotate", "zoom"];
const DURATION_MS: Record<Phase, number> = {
  closed: 0,
  flipping: 800,
  flapOpen: 650,
  cardOut: 600,
  cardRotate: 700,
  zoom: 650,
};

export function EnvelopeOpening({ onOpen }: { onOpen: () => void }) {
  const t = useTranslations("viewer");
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

  const flipped = phase !== "closed";
  const flipDone = phase !== "closed" && phase !== "flipping";
  const flapOpen =
    phase === "flapOpen" || phase === "cardOut" || phase === "cardRotate" || phase === "zoom";
  const cardOut = phase === "cardOut" || phase === "cardRotate" || phase === "zoom";
  const cardRotating = phase === "cardRotate" || phase === "zoom";
  const zooming = phase === "zoom";

  return (
    <motion.div
      animate={{ opacity: zooming ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: zooming ? 0.2 : 0 }}
      className="paper-texture fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-cream px-6 text-center"
    >
      <button
        type="button"
        onClick={() => phase === "closed" && setPhase("flipping")}
        disabled={phase !== "closed"}
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
                phase === "closed" && !reduceMotion
                  ? { scale: [1, 1.08, 1] }
                  : { scale: 1 }
              }
              transition={
                phase === "closed" && !reduceMotion
                  ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 0.3, ease: "easeOut" }
              }
            >
              <WaxSeal size={72} />
            </motion.div>
          </div>

          <div
            className="absolute inset-0 flex items-center justify-center rounded-md bg-cream shadow-2xl"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <OrnamentDivider />
          </div>
        </motion.div>

        {/* flap — opens once the envelope has flipped to its back */}
        <motion.div
          animate={{ rotateX: flapOpen ? -170 : 0, opacity: flipDone ? 1 : 0 }}
          transition={{ duration: 0.65, ease: "easeInOut", opacity: { duration: 0.2 } }}
          style={{ transformOrigin: "top center", transformStyle: "preserve-3d" }}
          className="absolute left-1/2 top-0 h-0 w-0 -translate-x-1/2 border-x-[160px] border-t-[96px] border-x-transparent border-t-gold/60 sm:border-x-[192px] sm:border-t-[112px]"
        />

        {/* invitation card — slides out, rotates, then zooms to fill the screen */}
        <motion.div
          initial={{ y: 20, scale: 0.6, rotateY: 0, opacity: 0 }}
          animate={{
            y: cardOut ? -130 : 20,
            scale: zooming ? 7 : cardOut ? 0.95 : 0.6,
            rotateY: cardRotating ? 360 : 0,
            opacity: cardOut ? 1 : 0,
          }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="absolute left-1/2 top-1/2 h-40 w-28 -translate-x-1/2 -translate-y-1/2 rounded-md border border-gold/50 bg-cream shadow-xl"
        />
      </button>

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
