import Image from "next/image";
import { AmbientSparks } from "@/components/ui/AmbientSparks";

/**
 * Fixed, heavily blurred full-viewport photo/video that stays in place behind
 * the whole scrolling experience, so every section reads as a frosted-glass
 * card floating over one continuous backdrop rather than a stack of flat
 * blocks. Prefers the cover video embed, falls back to the first gallery
 * photo, falls back to a plain cream background.
 */
export function BackgroundBackdrop({
  embedUrl,
  imageUrl,
}: {
  embedUrl?: string | null;
  imageUrl?: string;
}) {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-cream">
      {embedUrl ? (
        <iframe
          src={embedUrl}
          title="Cover video"
          allow="autoplay; encrypted-media"
          className="pointer-events-none blur-[2px]"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "max(120vw, calc(120vh * 16 / 9))",
            height: "max(120vh, calc(120vw * 9 / 16))",
            minWidth: "100%",
            minHeight: "100%",
            border: 0,
          }}
        />
      ) : imageUrl ? (
        <Image
          src={imageUrl}
          alt=""
          fill
          sizes="100vw"
          priority
          className="scale-115 object-cover blur-[2px]"
        />
      ) : null}
      <div className="absolute inset-0 bg-cream/35" />
      <AmbientSparks />
    </div>
  );
}
