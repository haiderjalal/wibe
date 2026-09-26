"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";

import { Cover } from "@/components/Cover";
import { CATEGORIES } from "@/lib/categories";
import { featuredEvents, ISLAMABAD } from "@/lib/data";
import { formatMoney } from "@/lib/format";
import { photoFor } from "@/lib/media";

const EVENTS = featuredEvents();
const GAP = 24;

function GalleryCard({
  event,
  index,
  x,
  cardWidth,
  viewport,
}: {
  event: (typeof EVENTS)[number];
  index: number;
  x: MotionValue<number>;
  cardWidth: number;
  viewport: number;
}) {
  // Coverflow: cards turn toward the viewer as they cross the centre of the screen.
  const offset = (v: number) => (index * (cardWidth + GAP) + cardWidth / 2 + v - viewport / 2) / viewport;
  const rotateY = useTransform(x, (v) => Math.max(-28, Math.min(28, offset(v) * -38)));
  const scale = useTransform(x, (v) => 1 - Math.min(0.12, Math.abs(offset(v)) * 0.14));

  return (
    <motion.li style={{ rotateY, scale, width: cardWidth, transformPerspective: 1200 }} className="shrink-0">
      <Link
        href={`/discover/${event.id}`}
        className="group block overflow-hidden rounded-[1.75rem] border border-line bg-ridge transition-colors hover:border-sodium/60"
      >
        <Cover category={event.category} photo={photoFor(event)} sizes="(min-width: 640px) 400px, 78vw" sector={event.sector} className="aspect-[4/4.4]" iconClassName="size-56">
          <span className="absolute bottom-4 left-4 rounded-full bg-ink/60 px-3 py-1 text-xs font-semibold backdrop-blur">{event.whenLabel}</span>
          <span className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-ink/50 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
            <ArrowUpRight className="size-4" aria-hidden />
          </span>
        </Cover>
        <div className="space-y-2 p-5">
          <p className="eyebrow !text-[0.62rem]">{CATEGORIES[event.category].label}</p>
          <p className="font-display text-xl font-bold leading-tight" style={{ fontVariationSettings: '"wdth" 95' }}>
            {event.title}
          </p>
          <p className="line-clamp-2 text-sm text-haze">{event.blurb}</p>
          <p className="pt-1 text-sm font-semibold text-sodium">{formatMoney(event.priceMinor, ISLAMABAD)}</p>
        </div>
      </Link>
    </motion.li>
  );
}

export function WeekGallery() {
  const section = useRef<HTMLElement>(null);
  const [size, setSize] = useState({ viewport: 1280, card: 400 });

  useEffect(() => {
    const measure = () => {
      const viewport = window.innerWidth;
      setSize({ viewport, card: viewport < 640 ? Math.round(viewport * 0.78) : 400 });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const pad = size.viewport < 640 ? 20 : 32;
  const trackWidth = EVENTS.length * (size.card + GAP) - GAP + pad * 2;
  const distance = Math.max(0, trackWidth - size.viewport);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });
  const x = useTransform(progress, [0, 1], [0, -distance]);

  return (
    <section ref={section} className="relative h-[320vh]" aria-labelledby="week-title">
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
        <div className="mx-auto mb-10 flex w-full max-w-7xl items-end justify-between gap-6 px-5 sm:px-8">
          <div>
            <p className="eyebrow mb-4">Fictional pilot listings</p>
            <h2 id="week-title" className="font-display text-[clamp(2.2rem,5vw,4.2rem)] font-bold leading-[0.95]" style={{ fontVariationSettings: '"wdth" 110' }}>
              This week in Islamabad
            </h2>
          </div>
          <div className="hidden h-1 w-48 overflow-hidden rounded-full bg-line sm:block" aria-hidden>
            <motion.div className="h-full origin-left bg-sodium" style={{ scaleX: progress }} />
          </div>
        </div>
        <div>
          <motion.ul style={{ x, paddingInline: pad, gap: GAP }} className="flex w-max">
            {EVENTS.map((event, i) => (
              <GalleryCard key={event.id} event={event} index={i} x={x} cardWidth={size.card} viewport={size.viewport} />
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}
