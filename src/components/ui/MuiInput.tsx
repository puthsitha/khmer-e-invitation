"use client";

import { useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

export interface MuiInputProps {
  id?: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  error?: string | null;
  required?: boolean;
  autoComplete?: string;
  disabled?: boolean;
  showPasswordToggle?: boolean;
  onPasswordVisibilityChange?: (visible: boolean) => void;
  className?: string;
}

export function MuiInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  onFocus,
  onBlur,
  error,
  required,
  autoComplete,
  disabled,
  showPasswordToggle = false,
  onPasswordVisibilityChange,
  className = "",
}: MuiInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password" || showPasswordToggle;
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  const isFloating = focused || value.length > 0;
  const hasError = Boolean(error);

  const handleTogglePassword = () => {
    const nextState = !showPassword;
    setShowPassword(nextState);
    onPasswordVisibilityChange?.(nextState);
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`group relative rounded-xl transition-all duration-200 ${
          hasError
            ? "border-2 border-red-500 bg-white/95 shadow-[0_0_0_3px_rgba(239,68,68,0.12)]"
            : focused
              ? "border-2 border-maroon bg-white shadow-[0_0_0_3px_rgba(122,31,43,0.12)]"
              : "border border-gold/40 bg-white/80 hover:border-gold/70"
        } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}>
        {/* Floating Label */}
        <label
          htmlFor={inputId}
          className={`pointer-events-none absolute transition-all duration-200 ease-out select-none ${
            isFloating
              ? `-top-2.5 left-3 px-1.5 text-xs font-semibold rounded bg-white ${
                  hasError
                    ? "text-red-600"
                    : focused
                      ? "text-maroon"
                      : "text-maroon/70"
                }`
              : `left-4 top-3 text-sm ${
                  hasError ? "text-red-500" : "text-maroon/60"
                }`
          }`}>
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>

        {/* Text Input */}
        <input
          id={inputId}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            setFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          required={required}
          autoComplete={autoComplete}
          disabled={disabled}
          className={`w-full rounded-xl bg-transparent px-4 py-3 text-sm text-maroon caret-maroon outline-none transition-colors ${
            isPassword ? "pr-11" : ""
          }`}
        />

        {/* Password visibility toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={handleTogglePassword}
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-maroon/60 transition-colors hover:bg-gold/10 hover:text-maroon cursor-pointer">
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* Error helper text */}
      <AnimatePresence>
        {hasError && (
          <motion.p
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.18 }}
            className="mt-1 flex items-center gap-1.5 px-1 text-xs font-medium text-red-600">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{error}</span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
