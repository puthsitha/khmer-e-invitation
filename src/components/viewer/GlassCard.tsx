export function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`w-full max-w-2xl rounded-3xl bg-cream/75 p-6 shadow-xl backdrop-blur-md sm:p-10 ${className}`}
    >
      {children}
    </div>
  );
}
