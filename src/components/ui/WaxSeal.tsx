export function WaxSeal({ size = 88 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden className="drop-shadow-md">
      <defs>
        <radialGradient id="waxSealGradient" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="var(--color-gold-light)" />
          <stop offset="100%" stopColor="var(--color-gold)" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="52" r="42" fill="url(#waxSealGradient)" />
      <path
        d="M50 28 L50 76 M50 38 L36 50 M50 46 L64 58 M50 54 L38 64 M50 62 L62 70"
        stroke="var(--color-maroon)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity={0.7}
      />
    </svg>
  );
}
