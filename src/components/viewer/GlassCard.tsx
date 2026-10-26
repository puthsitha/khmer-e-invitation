export function GlassCard({
  children,
  className = "",
  style,
  blur,
  opacity,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Custom blur value in px or CSS unit (e.g. 24, "32px") */
  blur?: number | string;
  /** Custom opacity (0 to 1, default 0.14) */
  opacity?: number | string;
}) {
  const customVars: React.CSSProperties = {
    ...(blur !== undefined
      ? {
          ["--glass-blur" as string]:
            typeof blur === "number" ? `${blur}px` : blur,
        }
      : {}),
    ...(opacity !== undefined
      ? {
          ["--glass-opacity" as string]: String(opacity),
        }
      : {}),
  };

  return (
    <div
      className={`ultra-thin-material relative w-full max-w-2xl rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 text-[#fdf8f0] ${className}`}
      style={{
        ["--color-maroon" as string]: "#fdf8f0",
        ...customVars,
        ...style,
      }}
    >
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
