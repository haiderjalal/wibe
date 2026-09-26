"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";

import { Reveal, WordsRise } from "@/components/motion/Reveal";
import { PHOTOS, type PhotoName } from "@/lib/media";

interface Moment {
  photo: PhotoName;
  caption: string;
  sector: string;
  aspect: string;
}

const COLUMNS: Moment[][] = [
  [
    { photo: "tabla", caption: "Tabla, harmonium, and nobody checking the time.", sector: "Saidpur", aspect: "aspect-[4/5]" },
    { photo: "chai-pour", caption: "The second round of chai.", sector: "F-7", aspect: "aspect-[3/4]" },
    { photo: "trail-run", caption: "First light on Trail 5.", sector: "Margalla", aspect: "aspect-[4/3]" },
  ],
  [
    { photo: "shared-feast", caption: "Came solo. Left with a table of friends.", sector: "E-11", aspect: "aspect-[4/3]" },
    { photo: "faisal-night", caption: "The long way home.", sector: "E-7", aspect: "aspect-[3/4]" },
    { photo: "grill-market", caption: "Tikka smoke and string lights.", sector: "I-8", aspect: "aspect-[4/5]" },
  ],
  [
    { photo: "string-lights", caption: "A courtyard full of strangers, for now.", sector: "Saidpur", aspect: "aspect-[3/4]" },
    { photo: "jazz-stage", caption: "Two sets and a late jam.", sector: "F-6", aspect: "aspect-[4/3]" },
    { photo: "kulhad", caption: "Kulhad, never paper cups.", sector: "G-9", aspect: "aspect-[4/5]" },
  ],
];

// Each column drifts at its own speed, so the wall of photos feels layered.
const DRIFT: [number, number][] = [
  [40, -90],
  [140, -200],
  [70, -60],
];

function MomentTile({ moment, sizes }: { moment: Moment; sizes: string }) {
  const photo = PHOTOS[moment.photo];
  return (
    <figure className={`group relative overflow-hidden rounded-[1.75rem] ${moment.aspect}`}>
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes={sizes}
        placeholder="blur"
        blurDataURL={photo.blurDataURL}
        className="object-cover transition-transform duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/5 to-transparent opacity-80 transition-opacity duration-700 group-hover:opacity-100" />
      <span className="absolute left-4 top-4 rounded-full bg-ink/40 px-2.5 py-1 font-mono text-[0.66rem] tracking-[0.14em] text-jasmine backdrop-blur-md">
        {moment.sector}
      </span>
      <figcaption className="absolute inset-x-0 bottom-0 translate-y-2 p-5 font-serif text-xl italic leading-snug text-jasmine transition-transform duration-700 group-hover:translate-y-0 md:text-2xl">
        {moment.caption}
      </figcaption>
    </figure>
  );
}

function Column({ moments, progress, drift, reduced }: { moments: Moment[]; progress: MotionValue<number>; drift: [number, number]; reduced: boolean }) {
  const y = useTransform(progress, [0, 1], reduced ? [0, 0] : drift);
  return (
    <motion.div style={{ y }} className="flex flex-col gap-5">
      {moments.map((m) => (
        <MomentTile key={m.photo} moment={m} sizes="(min-width: 768px) 33vw, 80vw" />
      ))}
    </motion.div>
  );
}

export function Moments() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  return (
    <section ref={ref} className="relative overflow-hidden px-5 py-28 sm:px-8 md:py-40" aria-labelledby="moments-title">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow mb-4">Moments</p>
            <h2 id="moments-title" className="max-w-3xl font-display text-[clamp(2.4rem,5.6vw,4.8rem)] font-bold leading-[0.95]" style={{ fontVariationSettings: '"wdth" 105' }}>
              <WordsRise text="Evenings that turn into" /> <span className="accent text-sodium">stories.</span>
            </h2>
          </div>
          <Reveal delay={0.2}>
            <p className="max-w-sm text-lg leading-relaxed text-haze">
              The best plans end with people you didn’t know at the start. Wibe points you at the room; the rest is up to the evening.
            </p>
          </Reveal>
        </div>

        {/* Desktop: three drifting columns. Mobile: a swipeable strip. */}
        <div className="hidden grid-cols-3 gap-5 md:grid">
          {COLUMNS.map((col, i) => (
            <Column key={i} moments={col} progress={scrollYProgress} drift={DRIFT[i]} reduced={reduced} />
          ))}
        </div>
        <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:none] md:hidden">
          {COLUMNS.flat().map((m) => (
            <div key={m.photo} className="w-[78vw] shrink-0 snap-center">
              <MomentTile moment={{ ...m, aspect: "aspect-[4/5]" }} sizes="78vw" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
