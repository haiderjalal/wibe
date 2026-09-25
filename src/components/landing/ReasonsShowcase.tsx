"use client";

import { useRef } from "react";
import { Check, EyeOff, Heart } from "lucide-react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";

import { Cover } from "@/components/Cover";
import { Reveal, WordsRise } from "@/components/motion/Reveal";

const REASONS = ["You're into live music", "Starts tonight at 9:00 pm", "2.4 km from F-7"];

/** The product standard in one card: a pick, its reasons, and a one-tap correction. */
export function ReasonsShowcase() {
  const card = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-14, 14]), { stiffness: 150, damping: 18 });
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [12, -12]), { stiffness: 150, damping: 18 });

  const onMove = (e: React.PointerEvent) => {
    if (reduced || !card.current) return;
    const r = card.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <section className="relative overflow-hidden px-5 py-28 sm:px-8 md:py-40" aria-labelledby="reasons-title">
      <div aria-hidden className="absolute right-[-10%] top-1/4 size-[520px] rounded-full bg-violet/20 blur-[120px]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-16 md:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="eyebrow mb-4">Explainable picks</p>
          <h2 id="reasons-title" className="font-display text-[clamp(2.2rem,5vw,4.2rem)] font-bold leading-[0.95]" style={{ fontVariationSettings: '"wdth" 105' }}>
            <WordsRise text="Every pick shows its working." />
          </h2>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-haze">
              Vibe ranks what’s open, affordable and close to you, then tells you which of those reasons put each pick on your list. If one misses,
              tap <span className="text-jasmine">Not for me</span> and it’s gone.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-line pt-6">
              {[
                ["2–3", "reasons on every pick"],
                ["30 days", "before an unverified listing drops out"],
                ["1 tap", "to correct a miss"],
              ].map(([n, l]) => (
                <div key={l}>
                  <dt className="sr-only">{l}</dt>
                  <dd className="font-display text-2xl font-bold text-sodium">{n}</dd>
                  <dd className="mt-1 text-xs leading-snug text-haze">{l}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <div className="flex justify-center" style={{ perspective: 1200 }} onPointerMove={onMove} onPointerLeave={onLeave}>
          <motion.div
            ref={card}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            initial={{ opacity: 0, y: 60, rotateZ: -4 }}
            whileInView={{ opacity: 1, y: 0, rotateZ: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-[420px] rounded-[2rem] border border-line bg-ridge shadow-[0_50px_100px_-30px_rgb(0_0_0/0.7)]"
          >
            <Cover category="live_music" sector="F-6" className="h-52 rounded-t-[2rem]">
              <span className="absolute right-4 top-4 rounded-full bg-ink/60 px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-[0.14em] backdrop-blur">
                Event
              </span>
            </Cover>
            <div className="space-y-5 p-6" style={{ transform: "translateZ(30px)" }}>
              <div>
                <p className="font-display text-2xl font-bold">Monsoon Jazz Night</p>
                <p className="mt-1 text-sm text-haze">Tonight · 9:00 pm · Rs 2,500</p>
              </div>
              <div>
                <p className="eyebrow mb-3 !text-[0.62rem]">Why it’s here</p>
                <ul className="space-y-2">
                  {REASONS.map((r, i) => (
                    <motion.li
                      key={r}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + i * 0.15, duration: 0.5 }}
                      className="flex items-center gap-2.5 text-sm"
                    >
                      <span className="grid size-5 place-items-center rounded-full bg-pine/15 text-pine">
                        <Check className="size-3" aria-hidden />
                      </span>
                      {r}
                    </motion.li>
                  ))}
                </ul>
              </div>
              <div className="flex gap-2">
                <span className="btn btn-ghost flex-1 !py-2.5 text-sm">
                  <EyeOff className="size-4" aria-hidden /> Not for me
                </span>
                <span className="btn btn-primary flex-1 !py-2.5 text-sm">
                  <Heart className="size-4" aria-hidden /> Save
                </span>
              </div>
            </div>
            {/* Floating chips at different depths sell the parallax. */}
            <span className="glass absolute -left-6 top-40 hidden rounded-full px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-pine sm:block" style={{ transform: "translateZ(80px)" }}>
              Verified yesterday
            </span>
            <span className="glass absolute -right-6 top-[17rem] hidden rounded-full px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-sodium sm:block" style={{ transform: "translateZ(60px)" }}>
              34 spots left
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
