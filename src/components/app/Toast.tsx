"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";

const TOAST_MS = 5000;

export interface ToastMessage {
  id: string;
  text: string;
  action?: { label: string; onClick: () => void };
}

/** Single bottom toast with an optional action; dismisses itself after a few seconds. */
export function Toast({ message, onDismiss }: { message: ToastMessage | null; onDismiss: () => void }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onDismiss, TOAST_MS);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-28 z-50 flex justify-center px-4 md:bottom-8">
      <AnimatePresence>
        {message && (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="glass pointer-events-auto flex items-center gap-4 rounded-full py-2.5 pl-5 pr-2.5 text-sm shadow-2xl"
          >
            <span>{message.text}</span>
            {message.action && (
              <button
                type="button"
                onClick={() => {
                  message.action?.onClick();
                  onDismiss();
                }}
                className="rounded-full bg-jasmine px-3.5 py-1.5 text-xs font-semibold text-ink"
              >
                {message.action.label}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
