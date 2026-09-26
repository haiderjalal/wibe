"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { animate, motion, useMotionValue, useReducedMotion, useScroll, useTransform } from "motion/react";

const CityScene = dynamic(() => import("./CityScene"), { ssr: false });

const EASE = [0.22, 1, 0.36, 1] as const;
const LINES = [["Find", "your", "people,"], ["places", "and", "plans."]];

export function Hero() {
  const section = useRef<HTMLElement>(null);
  const reduced = useReducedMotion() ?? false;
  const [inView, setInView] = useState(true);
  const [sceneReady, setSceneReady] = useState(false);

  // Stop rendering WebGL frames once the hero leaves the viewport.
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end start"] });
  // Signature type move: the headline stretches wide on load, then condenses as you scroll away.
  const loadWidth = useMotionValue(reduced ? 112 : 52);
  useEffect(() => {
    if (reduced) return;
    const controls = animate(loadWidth, 112, { duration: 1.8, delay: 0.25, ease: EASE });
    return () => controls.stop();
  }, [loadWidth, reduced]);
  const scrollWidth = useTransform(scrollYProgress, [0, 0.7], [0, -52]);
  const width = useTransform(() => loadWidth.get() + scrollWidth.get());
  const fontVariationSettings = useTransform(width, (w) => `"wdth" ${w.toFixed(1)}`);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section ref={section} className="relative h-[100svh] min-h-[640px] overflow-hidden" aria-labelledby="hero-title">
      {/* Dusk sky behind the transparent canvas; the ridge in the scene cuts across the glow. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: [
            "radial-gradient(34% 12% at 56% 31%, rgb(255 181 71 / 0.6), transparent 70%)",
            "radial-gradient(75% 24% at 55% 32%, rgb(255 111 125 / 0.45), transparent 72%)",
            "linear-gradient(180deg, #0b0d2a 0%, #15154a 14%, #36205f 30%, #1a1446 42%, #0b0d2a 58%)",
          ].join(","),
        }}
      />
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: sceneReady ? 1 : 0 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
      >
        <CityScene active={inView} reduced={reduced} onReady={() => setSceneReady(true)} />
      </motion.div>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink via-ink/80 to-transparent" />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-16 sm:px-8 md:pb-20"
      >
        <motion.p
          className="eyebrow mb-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Islamabad pilot · 33.72° N, 73.06° E
        </motion.p>
        <motion.h1
          id="hero-title"
          style={{ fontVariationSettings }}
          className="font-display text-[clamp(2.4rem,7.2vw,6.6rem)] font-extrabold leading-[0.9] tracking-[-0.02em]"
        >
          {LINES.map((line, li) => (
            <span key={li} className="block">
              {line.map((word, wi) => (
                <span key={word} className="inline-block overflow-hidden pb-[0.06em] align-bottom">
                  <motion.span
                    className={`inline-block ${word === "plans." ? "accent bg-gradient-to-r from-sodium to-dusk bg-clip-text pr-[0.08em] text-transparent" : ""}`}
                    initial={reduced ? false : { y: "110%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 1, delay: 0.3 + (li * 3 + wi) * 0.07, ease: EASE }}
                  >
                    {word}
                    {wi < line.length - 1 && " "}
                  </motion.span>
                </span>
              ))}
            </span>
          ))}
        </motion.h1>
        <motion.div
          className="mt-8 flex flex-col gap-8 md:flex-row md:items-end md:justify-between"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.1, ease: EASE }}
        >
          <p className="max-w-md text-lg leading-relaxed text-haze">
            Wibe picks places, events and hosted experiences around you, and shows exactly why each one made your list.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/welcome" className="btn btn-primary group">
              Set your vibe
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
            <Link href="/partner" className="btn btn-ghost">
              List an event
            </Link>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        aria-hidden
        className="absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
        style={{ opacity: contentOpacity }}
      >
        <span className="eyebrow !text-[0.6rem]">Scroll</span>
        <span className="relative h-10 w-px overflow-hidden bg-line">
          <motion.span
            className="absolute inset-x-0 top-0 h-4 bg-sodium"
            animate={reduced ? undefined : { y: [-16, 40] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </motion.div>
    </section>
  );
}
