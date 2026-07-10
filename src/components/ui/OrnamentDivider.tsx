import Image from "next/image";

const DIVIDER_SRC = {
  hero: "/images/divider_1.png",
  section: "/images/divider_2.png",
} as const;

export function OrnamentDivider({
  variant = "section",
  mirrored = false,
}: {
  variant?: "hero" | "section";
  mirrored?: boolean;
}) {
  return (
    <div className="image-glow relative h-14 w-60 sm:h-16 sm:w-72">
      <Image
        src={DIVIDER_SRC[variant]}
        alt=""
        fill
        sizes="288px"
        className={`object-cover${mirrored ? " -scale-y-100" : ""}`}
        aria-hidden
      />
    </div>
  );
}
