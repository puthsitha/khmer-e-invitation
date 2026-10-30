import Image from "next/image";
import { AmbientSparks } from "@/components/ui/AmbientSparks";

/**
 * Fixed full-viewport photo/video/color backdrop that stays in place behind
 * the scrolling experience, tinted with the template's background and secondary
 * colors so text and cards remain clean and legible.
 */
export function BackgroundBackdrop({
  embedUrl,
  imageUrl,
  contained = false,
}: {
  embedUrl?: string | null;
  imageUrl?: string;
  contained?: boolean;
}) {
  return (
    <div
      className={`pointer-events-none ${
        contained
          ? "absolute inset-0 h-full w-full"
          : "fixed inset-0 h-screen w-screen"
      } z-0 overflow-hidden max-w-full select-none`}
      style={{ backgroundColor: "var(--color-bg, var(--color-cream))" }}
      aria-hidden
    >
      {embedUrl ? (
        <>
          <iframe
            src={embedUrl}
            title="Cover video"
            allow="autoplay; fullscreen; encrypted-media"
            className="pointer-events-none opacity-45"
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
          <div
            className="absolute inset-0"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--color-bg, #fdf8f0) var(--bg-opacity, 85%), transparent)",
            }}
          />
        </>
      ) : imageUrl ? (
        <>
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="100vw"
            priority
            unoptimized={
              imageUrl.startsWith("blob:") || imageUrl.startsWith("data:")
            }
            className="scale-105 object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--color-bg, #fdf8f0) var(--bg-opacity, 85%), transparent)",
            }}
          />
        </>
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 20%, color-mix(in srgb, var(--color-secondary, #7a1f2b) 25%, var(--color-bg, #fdf8f0)) 0%, var(--color-bg, #fdf8f0) 80%)",
            opacity: "var(--bg-opacity, 85%)",
          }}
        />
      )}
      <AmbientSparks />
    </div>
  );
}
