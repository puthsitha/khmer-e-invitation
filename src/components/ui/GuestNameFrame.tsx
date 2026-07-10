import Image from "next/image";
import type { CSSProperties } from "react";
import { TypewriterText } from "@/components/viewer/TypewriterText";

/** Ornamental frame image with guest-facing greeting text overlaid inside
 * its rounded-rectangle band. */
export function GuestNameFrame({
  text,
  textStyle,
}: {
  text: string;
  textStyle?: CSSProperties;
}) {
  return (
    <div className="relative w-64 sm:w-80" style={{ aspectRatio: "1280 / 720" }}>
      <Image
        src="/images/GuestNameFrame.png"
        alt=""
        fill
        sizes="320px"
        className="image-glow object-contain"
        aria-hidden
      />
      <TypewriterText
        text={text}
        className="absolute left-1/2 top-[56%] w-[75%] -translate-x-1/2 -translate-y-1/2 text-center text-maroon"
        style={textStyle}
        letterDelay={0.07}
        letterDuration={0.5}
      />
    </div>
  );
}
