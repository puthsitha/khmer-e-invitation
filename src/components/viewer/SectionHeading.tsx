import { OrnamentDivider } from "@/components/ui/OrnamentDivider";

export function SectionHeading({
  icon,
  children,
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col items-center gap-3">
      <p className="flex items-center gap-2 text-sm uppercase tracking-[0.25em] text-maroon/80">
        {icon}
        {children}
      </p>
      <OrnamentDivider />
    </div>
  );
}
