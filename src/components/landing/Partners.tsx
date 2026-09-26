"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChartColumn, Lock, ScanLine } from "lucide-react";
import { motion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";

import { Reveal, WordsRise } from "@/components/motion/Reveal";
import { PHOTOS } from "@/lib/media";

// The listing lifecycle from the blueprint, in order.
const FLOW = [
  { state: "Draft", note: "You write the listing in the partner portal." },
  { state: "Submitted", note: "It joins the city team's review queue." },
  { state: "Approved", note: "An editor checks the time, place and capacity." },
  { state: "Published", note: "It starts appearing in members' picks." },
];

const FEATURES = [
  {
    icon: ChartColumn,
    title: "Attribution you can reconcile",
    body: "See which bookings and visits came through Wibe, in a report that matches your invoice line for line.",
  },
  {
    icon: ScanLine,
    title: "QR check-in, one scan per ticket",
    body: "Staff scan at the door. A ticket can't be used twice, even if two phones scan it at the same moment.",
  },
  {
    icon: Lock,
    title: "Guest privacy built in",
    body: "You see what check-in needs. Members' preference profiles and locations stay with them.",
  },
];

function FlowNode({ index, progress, state, note }: { index: number; progress: MotionValue<number>; state: string; note: string }) {
  const threshold = index / (FLOW.length - 1);
  const lit = useTransform(progress, [threshold - 0.08, threshold], [0, 1]);
  const scale = useTransform(lit, [0, 1], [0.7, 1]);
  return (
    <li className="relative flex flex-col items-start gap-4 md:items-center md:text-center">
      <span className="relative grid size-11 place-items-center rounded-full border border-line bg-ink">
        <motion.span className="absolute inset-0 rounded-full bg-sodium shadow-[0_0_30px_6px_rgb(255_181_71/0.4)]" style={{ opacity: lit, scale }} />
        <span className="relative font-mono text-xs text-jasmine mix-blend-difference">{index + 1}</span>
      </span>
      <div>
        <p className="font-display text-lg font-bold">{state}</p>
        <p className="mt-1 max-w-[16rem] text-sm text-haze">{note}</p>
      </div>
    </li>
  );
}

const STRIP = PHOTOS["long-table"];

/** Wide supper-table photo that drifts inside its frame as it crosses the viewport. */
function PhotoStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  return (
    <div ref={ref} className="relative mt-24 aspect-[16/10] overflow-hidden rounded-[2rem] md:aspect-[21/9]">
      <motion.div className="absolute inset-x-0 -inset-y-[14%]" style={{ y }}>
        <Image src={STRIP.src} alt={STRIP.alt} fill sizes="(min-width: 1280px) 1280px, 100vw" placeholder="blur" blurDataURL={STRIP.blurDataURL} className="object-cover" />
      </motion.div>
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/40 to-transparent" />
      <div className="absolute inset-y-0 left-0 flex max-w-lg flex-col justify-end p-7 md:p-12">
        <p className="eyebrow !text-sodium">Supper clubs · studios · courts · stages</p>
        <p className="mt-3 font-display text-[clamp(1.6rem,3.4vw,2.8rem)] font-bold leading-tight" style={{ fontVariationSettings: '"wdth" 100' }}>
          Listed by the people who <span className="accent text-sodium">run them.</span>
        </p>
      </div>
    </div>
  );
}

export function Partners() {
  const flow = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: flow, offset: ["start 0.85", "center 0.45"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });

  return (
    <section id="partners" className="relative px-5 py-28 sm:px-8 md:py-40" aria-labelledby="partners-title">
      <div className="mx-auto max-w-7xl">
        <p className="eyebrow mb-4">For venues and organizers</p>
        <h2 id="partners-title" className="max-w-4xl font-display text-[clamp(2.2rem,5vw,4.4rem)] font-bold leading-[0.95]" style={{ fontVariationSettings: '"wdth" 105' }}>
          <WordsRise text="Fill the quiet nights. Pay for guests who showed up, not clicks." />
        </h2>

        <div ref={flow} className="relative mt-20">
          <div aria-hidden className="absolute left-[22px] top-0 h-full w-px bg-line md:left-[12.5%] md:right-[12.5%] md:top-[22px] md:h-px md:w-auto" />
          <motion.div
            aria-hidden
            style={{ scaleY: progress }}
            className="absolute left-[22px] top-0 h-full w-px origin-top bg-sodium md:hidden"
          />
          <motion.div
            aria-hidden
            style={{ scaleX: progress }}
            className="absolute left-[12.5%] right-[12.5%] top-[22px] hidden h-px origin-left bg-sodium md:block"
          />
          <ol className="relative grid gap-10 md:grid-cols-4 md:gap-6">
            {FLOW.map((f, i) => (
              <FlowNode key={f.state} index={i} progress={progress} state={f.state} note={f.note} />
            ))}
          </ol>
        </div>

        <PhotoStrip />

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 0.1}>
              <div className="group h-full rounded-[1.75rem] border border-line bg-ridge/60 p-7 transition-[transform,border-color] duration-500 hover:-translate-y-1.5 hover:border-sodium/50">
                <span className="mb-6 grid size-12 place-items-center rounded-2xl bg-sodium/12 text-sodium transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-110">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="mt-3 leading-relaxed text-haze">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12">
          <Link href="/partner" className="btn btn-ghost group">
            Open the partner portal
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
