"use client";

import { ChevronDown } from "lucide-react";
import type { SelectHTMLAttributes } from "react";

export function Select({
  className = "",
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className="relative inline-flex">
      <select
        {...props}
        className={`appearance-none rounded-xl border border-gold/40 bg-white py-1.5 pl-3 pr-9 text-sm text-maroon shadow-sm transition-colors hover:border-gold/70 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 ${className}`}
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        strokeWidth={2}
        aria-hidden
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-maroon/50"
      />
    </span>
  );
}
