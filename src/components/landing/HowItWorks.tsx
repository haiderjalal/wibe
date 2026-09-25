"use client";

import { useEffect, useRef, useState } from "react";
import { Check, EyeOff, Heart, MapPin } from "lucide-react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "motion/react";

import { Cover } from "@/components/Cover";

// A real sequence, so the steps are numbered.
const STEPS = [
  {
    title: "Tell us your vibe",
    body: "Pick what you're into, the sector you usually start from, a budget and how far you'll travel. Change any of it later.",
  },
  {
    title: "Get picks with reasons",
    body: "Every place and event lists two or three plain reasons it's on your list. No mystery scores.",
  },
  {
    title: "Save it, book it, go",
    body: "Shortlist plans for the weekend, get tickets or request a table, then check in with a QR code at the door.",
  },
  {
    title: "It learns from what you do",
    body: "Saves and completed outings sharpen your next picks. Tap “Not for me” and the list adjusts.",
  },
];

const EASE = [0.22, 1, 0.36, 1] as const;

function ScreenPrefs() {
  const chips = ["Live music", "Cafés", "Outdoors", "Desi food", "Comedy", "Workshops"];
  return (
    <div className="flex h-full flex-col gap-5 p-5">
      <p className="font-display text-xl font-bold leading-tight">What are you into?</p>
      <div className="flex flex-wrap gap-2">
        {chips.map((c, i) => (
          <motion.span
            key={c}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.06 }}
            className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs ${
              i % 3 !== 2 ? "border-sodium bg-sodium/15 text-sodium" : "border-line text-haze"
            }`}
          >
            {i % 3 !== 2 && <Check className="size-3" aria-hidden />}
            {c}
          </motion.span>
        ))}
      </div>
      <div className="mt-2 space-y-2">
        <div className="flex justify-between text-xs text-haze">
          <span>Distance</span>
          <span className="text-jasmine">Within 6 km</span>
        </div>
        <div className="h-1.5 rounded-full bg-ridge-2">
          <motion.div className="h-full rounded-full bg-sodium" initial={{ width: "10%" }} animate={{ width: "45%" }} transition={{ duration: 1, ease: EASE }} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {["Up to Rs 1,000", "Up to Rs 2,500", "Up to Rs 5,000", "Any budget"].map((b, i) => (
          <span key={b} className={`rounded-xl border px-3 py-2.5 ${i === 1 ? "border-sodium text-jasmine" : "border-line text-haze"}`}>
            {b}
          </span>
        ))}
      </div>
      <div className="mt-auto flex items-center gap-2 rounded-xl bg-ink-2 p-3 text-[0.7rem] text-haze">
        <MapPin className="size-3.5 text-sodium" aria-hidden /> Starting from F-7. We never use your exact location.
      </div>
    </div>
  );
}

function MiniPick({ title, sector, category, reasons }: { title: string; sector: string; category: "live_music" | "cafe" | "outdoors"; reasons: string[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-ridge">
      <Cover category={category} sector={sector} className="h-20" iconClassName="size-20" />
      <div className="space-y-2 p-3">
        <p className="text-sm font-semibold">{title}</p>
        <div className="flex flex-wrap gap-1.5">
          {reasons.map((r, i) => (
            <motion.span
              key={r}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.12 }}
              className="rounded-full bg-pine/12 px-2 py-1 text-[0.65rem] text-pine"
            >
              {r}
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScreenPicks() {
  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <p className="eyebrow !text-[0.6rem]">Tonight · 3 picks</p>
      <MiniPick title="Monsoon Jazz Night" sector="F-6" category="live_music" reasons={["You're into live music", "Starts at 9:00 pm", "2.4 km away"]} />
      <MiniPick title="Chaiwala & Chess Club" sector="F-7" category="cafe" reasons={["Open when you want to go", "350 m away"]} />
    </div>
  );
}

function ScreenTicket() {
  // Deterministic pseudo-QR pattern.
  const cells = Array.from({ length: 121 }, (_, i) => (Math.sin(i * 91.7) * 1000) % 1 > 0.1);
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="eyebrow !text-[0.6rem]">Your ticket</p>
      <div className="rounded-2xl bg-jasmine p-3">
        <div className="grid grid-cols-11 gap-[2px]">
          {cells.map((on, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: (i % 11) * 0.02 + Math.floor(i / 11) * 0.02 }}
              className={`size-3 ${on ? "bg-ink" : "bg-transparent"}`}
            />
          ))}
        </div>
      </div>
      <div>
        <p className="font-display text-lg font-bold">Monsoon Jazz Night</p>
        <p className="text-xs text-haze">Tonight · 9:00 pm · 2 guests · F-6</p>
      </div>
      <span className="rounded-full bg-pine/15 px-3 py-1 text-[0.7rem] text-pine">One scan per ticket</span>
    </div>
  );
}

function ScreenLearn() {
  const [hidden, setHidden] = useState(false);
  const items = [
    { id: "a", t: "Bun Kebab Lane", s: "I-8" },
    { id: "b", t: "Qawwali under the Stars", s: "Saidpur" },
    { id: "c", t: "Calligraphy & Chai", s: "F-6" },
    { id: "d", t: "Sunrise Trail Run", s: "Margalla" },
  ].filter((i) => !(hidden && i.id === "a"));
  return (
    <div className="flex h-full flex-col gap-2.5 p-4">
      <p className="eyebrow !text-[0.6rem]">This weekend</p>
      <motion.ul layout className="space-y-2.5">
        <AnimatePresence initial={false}>
          {items.map((i) => (
            <motion.li
              key={i.id}
              layout
              exit={{ opacity: 0, x: -120 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="flex items-center justify-between rounded-xl border border-line bg-ridge px-3 py-3"
            >
              <span>
                <span className="block text-sm font-semibold">{i.t}</span>
                <span className="font-mono text-[0.65rem] text-haze">{i.s}</span>
              </span>
              {i.id === "a" ? (
                <motion.button
                  type="button"
                  tabIndex={-1}
                  onAnimationComplete={() => setTimeout(() => setHidden(true), 600)}
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="flex items-center gap-1 rounded-full bg-dusk/15 px-2 py-1 text-[0.65rem] text-dusk"
                >
                  <EyeOff className="size-3" aria-hidden /> Not for me
                </motion.button>
              ) : (
                <Heart className="size-4 text-haze" aria-hidden />
              )}
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
      <AnimatePresence>
        {hidden && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-auto rounded-xl bg-ink-2 p-3 text-center text-[0.7rem] text-haze"
          >
            Got it. Fewer street-food picks for now.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

const SCREENS = [ScreenPrefs, ScreenPicks, ScreenTicket, ScreenLearn];
/** Screens are laid out at this width, then scaled to whatever size the phone renders at. */
const SCREEN_DESIGN_WIDTH = 300;

function useFitScale(ref: React.RefObject<HTMLDivElement | null>) {
  const [fit, setFit] = useState({ scale: 1, height: 600 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const scale = entry.contentRect.width / SCREEN_DESIGN_WIDTH;
      setFit({ scale, height: entry.contentRect.height / scale });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return fit;
}

export function HowItWorks() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => setActive(Math.min(STEPS.length - 1, Math.floor(v * STEPS.length))));
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const rotateY = useTransform(smooth, [0, 1], [-16, 16]);
  const rotateX = useTransform(smooth, [0, 0.5, 1], [8, 2, 8]);
  const Screen = SCREENS[active];
  const screen = useRef<HTMLDivElement>(null);
  const fit = useFitScale(screen);

  return (
    <section id="how" ref={ref} className="relative h-[420vh]" aria-labelledby="how-title">
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden pt-16 md:pt-0">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-5 sm:px-8 md:grid-cols-2 md:gap-16">
          <div className="order-2 md:order-1">
            <p className="eyebrow mb-4 hidden md:block">How it works</p>
            <h2 id="how-title" className="mb-8 hidden font-display md:block text-[clamp(2rem,4.4vw,3.6rem)] font-bold leading-[0.95]" style={{ fontVariationSettings: '"wdth" 105' }}>
              From “what now?” to out the door.
            </h2>
            <div className="relative flex gap-6">
              <div className="relative w-px shrink-0 bg-line" aria-hidden>
                <motion.div className="absolute inset-x-0 top-0 h-full origin-top bg-sodium" style={{ scaleY: smooth }} />
              </div>
              <ol className="space-y-5">
                {STEPS.map((step, i) => (
                  <li key={step.title} aria-current={i === active ? "step" : undefined}>
                    <motion.div animate={{ opacity: i === active ? 1 : 0.35 }} transition={{ duration: 0.4 }}>
                      <p className="flex items-baseline gap-3">
                        <span className="font-mono text-xs text-sodium">{String(i + 1).padStart(2, "0")}</span>
                        <span className="text-xl font-semibold md:text-2xl">{step.title}</span>
                      </p>
                      <AnimatePresence initial={false}>
                        {i === active && (
                          <motion.p
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.45, ease: EASE }}
                            className="overflow-hidden pl-8 text-haze"
                          >
                            <span className="block pt-2 leading-relaxed">{step.body}</span>
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="order-1 flex justify-center md:order-2" style={{ perspective: 1400 }}>
            <motion.div
              style={{ rotateY, rotateX, transformStyle: "preserve-3d" }}
              className="relative h-[46svh] min-h-[340px] md:h-[70svh] md:max-h-[660px] aspect-[9/18.5] rounded-[2.6rem] border border-white/10 bg-ink-2 p-2.5 shadow-[0_60px_120px_-40px_rgb(140_123_255/0.55)]"
            >
              <div aria-hidden className="absolute left-1/2 top-3.5 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-black" />
              <div ref={screen} className="relative h-full overflow-hidden rounded-[2.1rem] bg-ink">
                <div className="absolute left-0 top-0 origin-top-left pt-8" style={{ width: SCREEN_DESIGN_WIDTH, height: fit.height, transform: `scale(${fit.scale})` }}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={active}
                      className="h-full"
                      initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -24, filter: "blur(6px)" }}
                      transition={{ duration: 0.45, ease: EASE }}
                    >
                      <Screen />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
              <div aria-hidden className="absolute -inset-px rounded-[2.6rem] bg-gradient-to-br from-white/10 via-transparent to-transparent" style={{ transform: "translateZ(1px)" }} />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
