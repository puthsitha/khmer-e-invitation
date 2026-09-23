"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, AlertCircle } from "lucide-react";

const emptySubscribe = () => () => {};

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel,
  destructive = true,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body?: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  // Lock body scroll and close on Escape key press
  useEffect(() => {
    if (!open) return;

    // Lock scroll on body to keep viewport perfectly centered
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onCancel]);

  if (!mounted) return null;

  const portalTarget =
    typeof document !== "undefined"
      ? document.getElementById("portal-root") || document.body
      : null;

  if (!portalTarget) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="confirm-dialog-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          style={{
            position: "fixed",
            inset: 0,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 99999,
            backgroundColor: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={onCancel}
        >
          <motion.div
            key="confirm-dialog-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              zIndex: 100000,
              backgroundColor: "#fdfaf5",
            }}
            className="w-full max-w-sm overflow-hidden rounded-3xl border border-gold/50 p-6 text-center shadow-[0_25px_60px_-15px_rgba(122,31,43,0.4)] sm:p-7"
          >
            {/* Top Icon Badge */}
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/40 bg-gradient-to-br from-gold/20 via-gold-light/25 to-gold/10 text-maroon shadow-xs">
              {destructive ? (
                <LogOut className="h-6 w-6 text-maroon" />
              ) : (
                <AlertCircle className="h-6 w-6 text-gold" />
              )}
            </div>

            {/* Title & Body */}
            <h2
              id="confirm-dialog-title"
              className="font-[family-name:var(--font-heading-km)] text-xl text-maroon"
            >
              {title}
            </h2>
            {body && (
              <p className="font-[family-name:var(--font-body-km)] mt-2 text-sm leading-relaxed text-maroon/75">
                {body}
              </p>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-center">
              <motion.button
                type="button"
                onClick={onCancel}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full cursor-pointer rounded-full border border-gold/50 bg-cream px-5 py-2.5 font-[family-name:var(--font-body-km)] text-sm font-semibold text-maroon transition-colors hover:bg-gold/15 sm:w-auto"
              >
                {cancelLabel}
              </motion.button>
              <motion.button
                type="button"
                onClick={onConfirm}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={
                  destructive
                    ? "w-full cursor-pointer rounded-full border border-red-700 bg-red-700 px-6 py-2.5 font-[family-name:var(--font-heading-km)] text-sm font-semibold text-cream shadow-md transition-colors hover:bg-red-800 sm:w-auto"
                    : "w-full cursor-pointer rounded-full border border-maroon bg-maroon px-6 py-2.5 font-[family-name:var(--font-heading-km)] text-sm font-semibold text-cream shadow-md transition-colors hover:bg-maroon/90 sm:w-auto"
                }
              >
                {confirmLabel}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    portalTarget
  );
}
