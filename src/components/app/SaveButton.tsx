"use client";

import { Heart } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

/** Heart toggle with a small burst when an item is saved. */
export function SaveButton({
  saved,
  onToggle,
  label,
  className = "relative",
}: {
  saved: boolean;
  onToggle: () => void;
  label: string;
  className?: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      whileTap={{ scale: 0.85 }}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${label} from saved` : `Save ${label}`}
      className={`grid size-10 place-items-center rounded-full backdrop-blur transition-colors ${
        saved ? "bg-dusk text-jasmine" : "bg-ink/55 text-jasmine hover:bg-ink/75"
      } ${className}`}
    >
      <motion.span key={String(saved)} initial={{ scale: saved ? 0.4 : 1 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 14 }}>
        <Heart className="size-[18px]" fill={saved ? "currentColor" : "none"} aria-hidden />
      </motion.span>
      <AnimatePresence>
        {saved && (
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full border-2 border-dusk"
            initial={{ scale: 1, opacity: 0.9 }}
            animate={{ scale: 1.9, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
}
