export function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`w-full max-w-2xl rounded-2xl sm:rounded-3xl bg-cream/90 sm:bg-cream/75 p-5 shadow-lg sm:shadow-xl sm:backdrop-blur-md sm:p-8 md:p-10 ${className}`}
      style={{
        transform: "translateZ(0)",
        WebkitTransform: "translateZ(0)",
      }}
    >
      {children}
    </div>
  );
}
