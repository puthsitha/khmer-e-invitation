"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";

export type SelectOption = {
  value: string;
  label: string;
  /** Small color dots rendered before the label (e.g. a palette preview). */
  swatches?: string[];
};

function Swatches({ colors }: { colors: string[] }) {
  return (
    <span className="flex -space-x-1" aria-hidden>
      {colors.map((color, i) => (
        <span
          key={i}
          className="h-3.5 w-3.5 rounded-full border border-white shadow-sm"
          style={{ backgroundColor: color }}
        />
      ))}
    </span>
  );
}

export function CustomSelect({
  value,
  onChange,
  options,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-gold/40 bg-white py-1.5 pl-3 pr-2.5 text-sm text-maroon shadow-sm transition-colors hover:border-gold/70 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
      >
        <span className="flex items-center gap-2 truncate">
          {selected?.swatches && <Swatches colors={selected.swatches} />}
          {selected?.label ?? ""}
        </span>
        <ChevronDown
          size={16}
          strokeWidth={2}
          aria-hidden
          className={`shrink-0 text-maroon/50 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-20 mt-1.5 w-full min-w-max overflow-hidden rounded-xl border border-gold/30 bg-white p-1 shadow-lg"
          >
            {options.map((option) => (
              <li key={option.value} role="option" aria-selected={option.value === value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    option.value === value
                      ? "bg-gold/15 text-maroon"
                      : "text-maroon/80 hover:bg-cream"
                  }`}
                >
                  {option.swatches && <Swatches colors={option.swatches} />}
                  <span className="flex-1 truncate">{option.label}</span>
                  {option.value === value && (
                    <Check size={14} strokeWidth={2.5} className="shrink-0 text-maroon" />
                  )}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
