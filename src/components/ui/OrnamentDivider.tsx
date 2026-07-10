import Image from "next/image";

export type DividerVariant = 1 | 2 | 3 | 4 | 5 | 6;

const DIVIDER_SRC: Record<DividerVariant, string> = {
  1: "/images/divider_1.png",
  2: "/images/divider_2.png",
  3: "/images/divider_3.png",
  4: "/images/divider_4.png",
  5: "/images/divider_5.png",
  6: "/images/divider_6.png",
};

// divider_1/2 have their motif vertically centered in a tall transparent
// canvas; divider_3-6 have it anchored to the top of a much flatter
// canvas — each needs a different crop anchor so object-cover doesn't
// clip the motif.
const CENTERED_MOTIF: DividerVariant[] = [1, 2];

export function OrnamentDivider({
  variant = 2,
  mirrored = false,
  priority = false,
}: {
  variant?: DividerVariant;
  mirrored?: boolean;
  priority?: boolean;
}) {
  const objectPosition = CENTERED_MOTIF.includes(variant) ? "object-center" : "object-top";

  return (
    <div className="image-glow relative h-14 w-60 sm:h-16 sm:w-72">
      <Image
        src={DIVIDER_SRC[variant]}
        alt=""
        fill
        sizes="288px"
        priority={priority}
        className={`object-cover ${objectPosition}${mirrored ? " -scale-y-100" : ""}`}
        aria-hidden
      />
    </div>
  );
}
