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
      className={`mx-auto flex w-full max-w-[768px] flex-col items-center justify-center gap-6 px-3.5 py-8 @xl:px-8 @xl:py-12 text-center ${className}`}
    >
      {children}
    </section>
  );
}
