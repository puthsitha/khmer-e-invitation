"use client";

import { AnimatePresence, motion } from "framer-motion";

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
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
          onClick={onCancel}
        >
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
          >
            <h2
              id="confirm-dialog-title"
              className="font-[family-name:var(--font-heading-km)] text-lg text-maroon"
            >
              {title}
            </h2>
            {body && <p className="mt-2 text-sm text-maroon/70">{body}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <motion.button
                type="button"
                onClick={onCancel}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="rounded-full border border-gold/60 px-4 py-1.5 text-sm text-maroon transition-colors hover:bg-gold/10"
              >
                {cancelLabel}
              </motion.button>
              <motion.button
                type="button"
                onClick={onConfirm}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={
                  destructive
                    ? "rounded-full bg-red-700 px-4 py-1.5 text-sm text-cream transition-colors hover:bg-red-800"
                    : "rounded-full bg-maroon px-4 py-1.5 text-sm text-cream transition-colors hover:bg-maroon/90"
                }
              >
                {confirmLabel}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
