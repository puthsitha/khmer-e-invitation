import Image from "next/image";
import type { CSSProperties } from "react";

/** Ornamental frame image with guest-facing greeting text overlaid inside
 * its rounded-rectangle band. */
export function GuestNameFrame({
  children,
  textStyle,
}: {
  children: React.ReactNode;
  textStyle?: CSSProperties;
}) {
  return (
    <div className="relative w-64 sm:w-80" style={{ aspectRatio: "1280 / 720" }}>
      <Image
        src="/images/GuestNameFrame.png"
        alt=""
        fill
        sizes="320px"
        className="object-contain"
        aria-hidden
      />
      <p
        className="absolute left-1/2 top-[56%] w-[75%] -translate-x-1/2 -translate-y-1/2 text-center text-maroon"
        style={textStyle}
      >
        {children}
      </p>
    </div>
  );
}
