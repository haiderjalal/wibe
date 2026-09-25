"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { ISLAMABAD } from "@/lib/data";
import { formatMoney } from "@/lib/format";

// Pilot test prices from the launch plan (docs/Vibe_Project_Launch_and_Developer_Plan.docx).
const PLANS = {
  Members: [
    { name: "Free", price: 0, unit: "", points: ["Picks with reasons", "Saves and bookings", "Reporting and privacy controls"], featured: false },
    { name: "Plus", price: 79_900, unit: "/ month", points: ["Group planning", "Saved plans", "Limited partner perks"], featured: true },
  ],
  Partners: [
    { name: "Venue Pro", price: 600_000, unit: "/ month", points: ["Listing tools", "Attribution reports", "Campaigns"], featured: false },
    { name: "Organizer Pro", price: 500_000, unit: "/ month", points: ["Repeat-event tools", "Settlement reports", "8% ticket fee still applies"], featured: true },
    { name: "Pay per outcome", price: 15_000, unit: "/ attended party", points: ["Dining: only after a confirmed visit", "Events: 8% of non-refunded tickets"], featured: false },
  ],
} as const;

type Audience = keyof typeof PLANS;

export function Pricing() {
  const [audience, setAudience] = useState<Audience>("Members");

  return (
    <section id="pricing" className="px-5 py-28 sm:px-8 md:py-40" aria-labelledby="pricing-title">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow mb-4">Pilot pricing</p>
            <h2 id="pricing-title" className="font-display text-[clamp(2.2rem,5vw,4.4rem)] font-bold leading-[0.95]" style={{ fontVariationSettings: '"wdth" 105' }}>
              Free to go out.
            </h2>
          </div>
          <div role="tablist" aria-label="Pricing for" className="relative flex w-fit rounded-full border border-line p-1">
            {(Object.keys(PLANS) as Audience[]).map((a) => (
              <button
                key={a}
                role="tab"
                type="button"
                aria-selected={audience === a}
                onClick={() => setAudience(a)}
                className={`relative rounded-full px-5 py-2 text-sm font-semibold transition-colors ${audience === a ? "text-ink" : "text-haze hover:text-jasmine"}`}
              >
                {audience === a && <motion.span layoutId="pricing-pill" className="absolute inset-0 rounded-full bg-sodium" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                <span className="relative">For {a.toLowerCase()}</span>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.ul
            key={audience}
            role="tabpanel"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={`mt-14 grid gap-5 ${audience === "Members" ? "md:grid-cols-2" : "md:grid-cols-3"}`}
          >
            {PLANS[audience].map((plan, i) => (
              <motion.li
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className={`relative flex flex-col rounded-[1.75rem] border p-8 ${plan.featured ? "border-sodium/60 bg-gradient-to-b from-sodium/10 to-transparent" : "border-line bg-ridge/50"}`}
              >
                <p className="text-lg font-semibold">{plan.name}</p>
                <p className="mt-4 flex items-baseline gap-2">
                  <span className="font-display text-4xl font-bold" style={{ fontVariationSettings: '"wdth" 110' }}>
                    {formatMoney(plan.price, ISLAMABAD)}
                  </span>
                  <span className="text-sm text-haze">{plan.unit}</span>
                </p>
                <ul className="mt-8 space-y-3">
                  {plan.points.map((p) => (
                    <li key={p} className="flex items-start gap-3 text-haze">
                      <Check className="mt-0.5 size-4 shrink-0 text-pine" aria-hidden />
                      {p}
                    </li>
                  ))}
                </ul>
              </motion.li>
            ))}
          </motion.ul>
        </AnimatePresence>
        <p className="mt-8 text-sm text-haze">Test prices for the Islamabad pilot. Baseline safety, reporting and appeals are always free.</p>
      </div>
    </section>
  );
}
