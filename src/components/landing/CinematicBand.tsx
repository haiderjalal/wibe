"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";

import { PHOTOS } from "@/lib/media";

const PHOTO = PHOTOS["city-night"];
const SECTORS = ["F-6", "F-7", "E-7", "G-9", "E-11", "Saidpur", "Margalla"];

/** The real city at night: a framed photo that opens to full bleed as you scroll into it. */
export function CinematicBand() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });

  const inset = useTransform(scrollYProgress, [0.15, 0.6], reduced ? [0, 0] : [12, 0]);
  const radius = useTransform(scrollYProgress, [0.15, 0.6], reduced ? [0, 0] : [40, 0]);
  const clipPath = useTransform(() => `inset(${inset.get()}% ${inset.get() * 0.7}% round ${radius.get()}px)`);
  const scale = useTransform(scrollYProgress, [0, 1], reduced ? [1, 1] : [1.3, 1]);
  // Sprung, so the headline settles in; it also keeps opacity off the accelerated scroll path, which left it stuck at 0.
  const reveal = useSpring(useTransform(scrollYProgress, [0.5, 0.78], reduced ? [1, 1] : [0, 1]), { stiffness: 140, damping: 28 });
  const textY = useTransform(reveal, [0, 1], [70, 0]);

  return (
    <section ref={ref} className="relative h-[230vh]" aria-labelledby="after-dark-title">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <motion.div className="absolute inset-0" style={{ clipPath }}>
          <motion.div className="absolute inset-0" style={{ scale }}>
            <Image src={PHOTO.src} alt={PHOTO.alt} fill sizes="100vw" quality={75} placeholder="blur" blurDataURL={PHOTO.blurDataURL} className="object-cover" />
          </motion.div>
          <div aria-hidden className="absolute inset-0 mix-blend-soft-light" style={{ background: "linear-gradient(180deg, rgb(140 123 255 / 0.5), transparent 45%, rgb(255 181 71 / 0.35))" }} />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-ink/50" />
        </motion.div>

        <motion.div style={{ opacity: reveal, y: textY }} className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-16 sm:px-8 md:pb-24">
          <p className="eyebrow !text-jasmine/80">Islamabad · after dark</p>
          <h2
            id="after-dark-title"
            className="mt-5 max-w-5xl font-display text-[clamp(2.6rem,7.4vw,7rem)] font-extrabold leading-[0.9] tracking-[-0.02em]"
            style={{ fontVariationSettings: '"wdth" 108' }}
          >
            The city <span className="accent pr-2 text-sodium">comes alive</span> after eight.
          </h2>
          <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <p className="max-w-md text-lg leading-relaxed text-jasmine/80">
              Courtyards fill up, kitchens fire up and the Margallas turn violet. Wibe keeps track of what’s on, sector by sector.
            </p>
            <ul className="flex flex-wrap gap-2" aria-label="Sectors in the pilot">
              {SECTORS.map((s) => (
                <li key={s} className="glass rounded-full px-3.5 py-1.5 font-mono text-[0.7rem] tracking-[0.14em] text-jasmine">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
