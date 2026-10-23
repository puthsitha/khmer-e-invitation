export function GlassCard({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`w-full max-w-2xl rounded-2xl sm:rounded-3xl border border-gold/40 bg-black/40 p-5 shadow-2xl shadow-black/40 backdrop-blur-md sm:backdrop-blur-xl sm:p-8 md:p-10 text-[#fdf8f0] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_12px_36px_rgba(0,0,0,0.35)] ${className}`}
      style={{
        transform: "translateZ(0)",
        WebkitTransform: "translateZ(0)",
        ["--color-maroon" as string]: "#fdf8f0",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
