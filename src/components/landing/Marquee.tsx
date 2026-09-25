"use client";

import { motion, useScroll, useSpring, useTransform, useVelocity } from "motion/react";

const ROWS = [
  ["Chai & chess · F-7", "Sunrise trail run · Margalla", "Open mic · G-9", "Qawwali · Saidpur", "Padel mixer · E-11", "Night ride · Lake View"],
  ["Nihari at dawn · G-9", "Wheel-throwing · F-11", "Board games · F-7", "Jazz basement · F-6", "Wazwan supper club · E-11", "Calligraphy · F-6"],
];

/** Two counter-running rows of real-sounding plans that lean into the scroll direction. */
export function Marquee() {
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 300 });
  const skewX = useTransform(velocity, [-2500, 0, 2500], [7, 0, -7], { clamp: true });

  return (
    <section aria-label="Plans happening around Islamabad" className="relative overflow-hidden border-y border-line py-10">
      <p className="sr-only">{ROWS.flat().join(", ")}</p>
      <motion.div style={{ skewX }} className="flex flex-col gap-4">
        {ROWS.map((row, r) => (
          <div key={r} className={`flex w-max ${r === 0 ? "animate-marquee" : "animate-marquee-reverse"}`} aria-hidden>
            {[...row, ...row].map((item, i) => (
              <span
                key={`${item}-${i}`}
                className="flex items-center gap-6 pr-6 font-display text-[clamp(1.8rem,4.4vw,3.6rem)] font-bold uppercase leading-none"
                style={{
                  fontVariationSettings: `"wdth" ${r === 0 ? 118 : 70}`,
                  ...(r === 1 ? { color: "transparent", WebkitTextStroke: "1px rgb(163 168 216 / 0.55)" } : {}),
                }}
              >
                {item}
                <span className="size-3 shrink-0 rounded-full bg-sodium shadow-[0_0_18px_4px_rgb(255_181_71/0.45)]" />
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </section>
  );
}
