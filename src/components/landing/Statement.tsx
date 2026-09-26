"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";

const TEXT =
  "The plans are out there, scattered across venue pages, organizer accounts and group chats. Wibe gathers them in one place and ranks them for you.";
const HIGHLIGHT = new Set(["one", "place"]);

function Word({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  const bare = word.replace(/[^a-z]/gi, "").toLowerCase();
  return (
    <motion.span style={{ opacity }} className={HIGHLIGHT.has(bare) ? "accent text-sodium" : undefined}>
      {word}{" "}
    </motion.span>
  );
}

/** A statement that lights up word by word as it's scrubbed through the viewport. */
export function Statement() {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.4"] });
  const words = TEXT.split(" ");

  return (
    <section className="sector-grid relative px-5 py-32 sm:px-8 md:py-48">
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-ink via-transparent to-ink" />
      <div className="relative mx-auto max-w-5xl">
        <p className="eyebrow mb-8">Why Wibe</p>
        <p ref={ref} className="font-display text-[clamp(1.9rem,4.6vw,4rem)] font-semibold leading-[1.08] tracking-[-0.01em]" style={{ fontVariationSettings: '"wdth" 88' }}>
          {words.map((word, i) => (
            <Word key={`${word}-${i}`} word={word} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} />
          ))}
        </p>
      </div>
    </section>
  );
}
