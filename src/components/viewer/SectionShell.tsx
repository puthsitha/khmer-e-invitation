"use client";

export function SectionShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`flex w-full max-w-full flex-col items-center justify-center gap-6 px-4 py-8 sm:px-6 sm:py-16 text-center ${className}`}
    >
      {children}
    </section>
  );
}
