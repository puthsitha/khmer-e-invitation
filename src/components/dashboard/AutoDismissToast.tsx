"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

interface AutoDismissToastProps {
  message: string | null;
  onClose: () => void;
  duration?: number;
}

export function AutoDismissToast({
  message,
  onClose,
  duration = 3000,
}: AutoDismissToastProps) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  const isError = message?.toLowerCase().includes("error") || message?.includes("បរាជ័យ");

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          key="toast"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
        >
          <div
            className={`flex items-center gap-2.5 rounded-full px-4 py-2.5 text-xs font-semibold shadow-xl backdrop-blur-md transition-all ${
              isError
                ? "border border-red-300 bg-red-600 text-white"
                : "border border-gold/40 bg-maroon text-cream"
            }`}
          >
            {isError ? (
              <AlertCircle className="h-4 w-4 shrink-0 text-red-200" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-gold" />
            )}

            <span>{message}</span>

            <button
              type="button"
              onClick={onClose}
              className="ml-1 rounded-full p-0.5 opacity-70 transition-opacity hover:opacity-100"
              aria-label="Close notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
