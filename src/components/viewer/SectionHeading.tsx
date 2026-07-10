import { OrnamentDivider, type DividerVariant } from "@/components/ui/OrnamentDivider";

export function SectionHeading({
  icon,
  children,
  dividerVariant,
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
  dividerVariant?: DividerVariant;
}) {
  return (
    <div className="mb-6 flex flex-col items-center gap-3">
      <p className="text-glow flex items-center gap-2 text-sm uppercase tracking-[0.25em] text-maroon/80">
        {icon && <span className="icon-glow">{icon}</span>}
        {children}
      </p>
      <OrnamentDivider variant={dividerVariant} />
    </div>
  );
}
