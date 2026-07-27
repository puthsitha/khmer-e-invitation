const LABELS: Record<string, string> = {
  dev: "DEV",
  uat: "UAT",
};

/** Small corner badge so dev/UAT deploys are never mistaken for production. Renders nothing when NEXT_PUBLIC_APP_ENV is unset (production). */
export function EnvTag() {
  const env = process.env.NEXT_PUBLIC_APP_ENV;
  const label = env ? LABELS[env] : undefined;

  if (!label) return null;

  return (
    <div
      className="fixed bottom-3 right-3 z-50 rounded-full border border-white/20 bg-black/70 px-3 py-1 text-xs font-semibold tracking-wide text-white shadow-lg backdrop-blur-sm pointer-events-none select-none"
      aria-hidden="true"
    >
      {label}
    </div>
  );
}
