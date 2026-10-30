export function GlassCard({
  children,
  className = "",
  style,
  opacity,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Custom opacity (0 to 1, default 0.14) */
  opacity?: number | string;
}) {
  const customVars: React.CSSProperties = {
    ...(opacity !== undefined
      ? {
          ["--glass-opacity" as string]: String(opacity),
        }
      : {}),
  };

  return (
    <div
      className={`ultra-thin-material relative w-full max-w-[540px] @xl:max-w-[640px] rounded-2xl @xl:rounded-3xl px-5 py-7 @xl:px-10 @xl:py-10 text-maroon ${className}`}
      style={{
        ...customVars,
        ...style,
      }}
    >
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
