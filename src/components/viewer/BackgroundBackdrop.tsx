import Image from "next/image";

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
          className="pointer-events-none absolute left-1/2 top-1/2 h-[130vh] w-[130vw] -translate-x-1/2 -translate-y-1/2 scale-105 blur-md"
        />
      ) : imageUrl ? (
        <Image
          src={imageUrl}
          alt=""
          fill
          sizes="100vw"
          priority
          className="scale-105 object-cover blur-md"
        />
      ) : null}
      <div className="absolute inset-0 bg-cream/35" />
    </div>
  );
}
