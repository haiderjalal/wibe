"use client";

import { useRef } from "react";
import { motion } from "motion/react";

/** Segmented one-time-code input: auto-advances, supports paste and backspace, and exposes one labelled group. */
export function OtpInput({
  length,
  value,
  onChange,
  onComplete,
  invalid,
  disabled,
}: {
  length: number;
  value: string;
  onChange: (value: string) => void;
  onComplete: (value: string) => void;
  invalid?: boolean;
  disabled?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  const commit = (next: string) => {
    const clean = next.replace(/\D/g, "").slice(0, length);
    onChange(clean);
    if (clean.length === length) onComplete(clean);
    refs.current[Math.min(clean.length, length - 1)]?.focus();
  };

  return (
    <motion.div
      role="group"
      aria-label={`${length}-digit code`}
      className="flex justify-between gap-2"
      animate={invalid ? { x: [0, -10, 10, -6, 6, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
    >
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={d}
          disabled={disabled}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${i + 1}`}
          aria-invalid={invalid || undefined}
          maxLength={length}
          onFocus={(e) => e.currentTarget.select()}
          onChange={(e) => {
            const typed = e.target.value.replace(/\D/g, "");
            if (!typed) return;
            // Typing replaces this box; pasting several digits fills forward.
            commit(value.slice(0, i) + typed + value.slice(i + typed.length));
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace") {
              e.preventDefault();
              const at = d ? i : Math.max(0, i - 1);
              onChange(value.slice(0, at) + value.slice(at + 1));
              refs.current[at]?.focus();
            } else if (e.key === "ArrowLeft") refs.current[i - 1]?.focus();
            else if (e.key === "ArrowRight") refs.current[i + 1]?.focus();
          }}
          onPaste={(e) => {
            e.preventDefault();
            commit(e.clipboardData.getData("text"));
          }}
          className={`h-14 w-full min-w-0 rounded-2xl border bg-ink-2 text-center font-display text-2xl font-bold text-jasmine transition-colors focus:border-sodium focus:outline-none sm:h-16 ${
            invalid ? "border-dusk" : d ? "border-haze/50" : "border-line"
          }`}
        />
      ))}
    </motion.div>
  );
}
