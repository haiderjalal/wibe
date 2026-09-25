import { MapPinOff, Megaphone, Scale, ShieldCheck } from "lucide-react";

import { Reveal, WordsRise } from "@/components/motion/Reveal";

const PRINCIPLES = [
  {
    icon: ShieldCheck,
    title: "Plus changes features, never trust.",
    body: "Paying members get planning extras. They don't get ranked higher, verified faster or moderated more gently.",
  },
  {
    icon: Scale,
    title: "A report opens a case, not a punishment.",
    body: "A person reviews it. Any restriction comes with a reason, an end date and a way to appeal.",
  },
  {
    icon: MapPinOff,
    title: "Your exact location stays with you.",
    body: "Picks work from your sector. Partners and other members never see where you are.",
  },
  {
    icon: Megaphone,
    title: "Sponsored is always labelled.",
    body: "Partners can pay for clearly marked placements. They can't buy a better organic ranking.",
  },
];

export function Principles() {
  return (
    <section id="principles" className="relative overflow-hidden px-5 py-28 sm:px-8 md:py-40" aria-labelledby="principles-title">
      <div aria-hidden className="absolute -left-40 top-20 size-[480px] rounded-full bg-dusk/15 blur-[120px]" />
      <div className="relative mx-auto max-w-7xl">
        <p className="eyebrow mb-4">Principles</p>
        <h2 id="principles-title" className="font-display text-[clamp(2.2rem,5vw,4.4rem)] font-bold leading-[0.95]" style={{ fontVariationSettings: '"wdth" 105' }}>
          <WordsRise text="Ground rules, written down." />
        </h2>
        <ul className="mt-16 grid gap-px overflow-hidden rounded-[2rem] border border-line bg-line md:grid-cols-2">
          {PRINCIPLES.map(({ icon: Icon, title, body }, i) => (
            <li key={title} className="bg-ink">
              <Reveal delay={(i % 2) * 0.12} className="flex h-full gap-5 p-8 md:p-10">
                <Icon className="mt-1 size-6 shrink-0 text-sodium" aria-hidden />
                <div>
                  <h3 className="font-display text-2xl font-bold leading-tight" style={{ fontVariationSettings: '"wdth" 92' }}>
                    {title}
                  </h3>
                  <p className="mt-3 leading-relaxed text-haze">{body}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
