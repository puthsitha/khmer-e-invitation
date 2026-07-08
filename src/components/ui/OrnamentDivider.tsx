export function OrnamentDivider() {
  return (
    <svg
      viewBox="0 0 200 24"
      className="h-6 w-40 text-gold"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path d="M0 12 H70 M130 12 H200" />
      <path d="M85 12 L100 2 L115 12 L100 22 Z" />
      <circle cx="100" cy="12" r="3" fill="currentColor" stroke="none" />
    </svg>
  );
}
