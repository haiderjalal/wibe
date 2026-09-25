"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, MapPin } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { CATEGORIES, CATEGORY_IDS } from "@/lib/categories";
import { CITIES, ISLAMABAD } from "@/lib/data";
import { formatMoney } from "@/lib/format";
import { useVibe, vibe } from "@/lib/store";
import type { Category, Preferences } from "@/lib/types";

const BUDGETS = [100_000, 250_000, 500_000, 1_000_000];
const ANY_BUDGET = 10_000_000;
const STEPS = ["City", "Interests", "Area", "Budget"] as const;
const EASE = [0.22, 1, 0.36, 1] as const;

const DEFAULTS: Preferences = {
  cityId: ISLAMABAD.id,
  neighborhoodId: "f7",
  interests: [],
  budgetMinor: 250_000,
  maxDistanceKm: 6,
  analyticsConsent: false,
};

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      aria-pressed={selected}
      className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors ${
        selected ? "border-sodium bg-sodium/15 text-sodium" : "border-line text-haze hover:border-haze/60 hover:text-jasmine"
      }`}
    >
      <AnimatePresence initial={false}>
        {selected && (
          <motion.span initial={{ width: 0, opacity: 0 }} animate={{ width: "auto", opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="overflow-hidden">
            <Check className="size-3.5" aria-hidden />
          </motion.span>
        )}
      </AnimatePresence>
      {children}
    </motion.button>
  );
}

export function Onboarding() {
  const router = useRouter();
  const { prefs: saved, ready } = useVibe();
  const [draft, setDraft] = useState<Preferences | null>(null);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [error, setError] = useState("");

  if (!ready) return <div className="mx-auto h-[60vh] max-w-2xl animate-pulse rounded-3xl bg-ridge/40" aria-busy="true" />;
  const prefs = draft ?? saved ?? DEFAULTS;
  const city = CITIES.find((c) => c.id === prefs.cityId) ?? ISLAMABAD;
  const update = (patch: Partial<Preferences>) => setDraft({ ...prefs, ...patch });

  const toggleInterest = (c: Category) => {
    setError("");
    update({ interests: prefs.interests.includes(c) ? prefs.interests.filter((x) => x !== c) : [...prefs.interests, c] });
  };

  const go = (delta: number) => {
    if (delta > 0 && step === 1 && prefs.interests.length === 0) {
      setError("Pick at least one interest so we have something to go on.");
      return;
    }
    if (delta > 0 && step === STEPS.length - 1) {
      vibe.setPrefs(prefs);
      router.push("/discover");
      return;
    }
    setDirection(delta);
    setStep((s) => s + delta);
  };

  const groups = ["Eat & drink", "Things to do"] as const;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-10 flex items-center gap-3" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1">
            <div className="h-1 overflow-hidden rounded-full bg-line">
              <motion.div className="h-full bg-sodium" initial={false} animate={{ width: i <= step ? "100%" : "0%" }} transition={{ duration: 0.5, ease: EASE }} />
            </div>
            <p className={`eyebrow mt-2 !text-[0.6rem] ${i === step ? "!text-jasmine" : ""}`}>{s}</p>
          </div>
        ))}
      </div>

      <div className="relative min-h-[430px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            {step === 0 && (
              <fieldset>
                <legend className="font-display text-4xl font-bold leading-tight" style={{ fontVariationSettings: '"wdth" 105' }}>
                  Where are you going out?
                </legend>
                <p className="mt-3 text-haze">Vibe is piloting in one city first. More follow once it works well here.</p>
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    aria-pressed
                    className="sector-grid relative overflow-hidden rounded-3xl border border-sodium bg-sodium/10 p-6 text-left"
                  >
                    <span className="eyebrow !text-sodium">Live now</span>
                    <span className="mt-6 block font-display text-3xl font-bold">Islamabad</span>
                    <Check className="absolute right-5 top-5 size-5 text-sodium" aria-hidden />
                  </button>
                  <div className="rounded-3xl border border-dashed border-line p-6 text-haze" aria-disabled>
                    <span className="eyebrow">After the pilot</span>
                    <span className="mt-6 block font-display text-3xl font-bold text-haze/60">More cities</span>
                  </div>
                </div>
              </fieldset>
            )}

            {step === 1 && (
              <fieldset>
                <legend className="font-display text-4xl font-bold leading-tight" style={{ fontVariationSettings: '"wdth" 105' }}>
                  What are you into?
                </legend>
                <p className="mt-3 text-haze">Pick as many as you like. You can change these any time.</p>
                {groups.map((g) => (
                  <div key={g} className="mt-8">
                    <p className="eyebrow mb-3">{g}</p>
                    <div className="flex flex-wrap gap-2.5">
                      {CATEGORY_IDS.filter((c) => CATEGORIES[c].group === g).map((c) => {
                        const Icon = CATEGORIES[c].icon;
                        return (
                          <Chip key={c} selected={prefs.interests.includes(c)} onClick={() => toggleInterest(c)}>
                            <Icon className="size-4" aria-hidden />
                            {CATEGORIES[c].label}
                          </Chip>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <p role="alert" className="mt-6 min-h-6 text-sm text-dusk">
                  {error}
                </p>
              </fieldset>
            )}

            {step === 2 && (
              <fieldset>
                <legend className="font-display text-4xl font-bold leading-tight" style={{ fontVariationSettings: '"wdth" 105' }}>
                  Where do you usually start from?
                </legend>
                <p className="mt-3 flex items-center gap-2 text-haze">
                  <MapPin className="size-4 text-sodium" aria-hidden /> We use your sector, never your exact location.
                </p>
                <div className="mt-8 flex flex-wrap gap-2.5">
                  {city.neighborhoods.map((n) => (
                    <Chip key={n.id} selected={prefs.neighborhoodId === n.id} onClick={() => update({ neighborhoodId: n.id })}>
                      {n.name}
                    </Chip>
                  ))}
                </div>
                <label className="mt-10 block">
                  <span className="flex items-baseline justify-between">
                    <span className="font-semibold">How far will you travel?</span>
                    <span className="font-display text-2xl font-bold text-sodium">{prefs.maxDistanceKm} km</span>
                  </span>
                  <input
                    type="range"
                    min={1}
                    max={20}
                    value={prefs.maxDistanceKm}
                    onChange={(e) => update({ maxDistanceKm: Number(e.target.value) })}
                    className="mt-4 w-full accent-[var(--color-sodium)]"
                  />
                </label>
              </fieldset>
            )}

            {step === 3 && (
              <fieldset>
                <legend className="font-display text-4xl font-bold leading-tight" style={{ fontVariationSettings: '"wdth" 105' }}>
                  What’s your usual spend per person?
                </legend>
                <p className="mt-3 text-haze">We only show plans that fit. Free events always make the cut.</p>
                <div className="mt-8 grid grid-cols-2 gap-3">
                  {[...BUDGETS, ANY_BUDGET].map((b) => (
                    <button
                      key={b}
                      type="button"
                      aria-pressed={prefs.budgetMinor === b}
                      onClick={() => update({ budgetMinor: b })}
                      className={`rounded-2xl border px-5 py-4 text-left font-semibold transition-colors last:col-span-2 ${
                        prefs.budgetMinor === b ? "border-sodium bg-sodium/10 text-jasmine" : "border-line text-haze hover:text-jasmine"
                      }`}
                    >
                      {b === ANY_BUDGET ? "Any budget" : `Up to ${formatMoney(b, city)}`}
                    </button>
                  ))}
                </div>
                <label className="mt-8 flex cursor-pointer items-start gap-4 rounded-2xl border border-line bg-ink-2 p-5">
                  <input
                    type="checkbox"
                    checked={prefs.analyticsConsent}
                    onChange={(e) => update({ analyticsConsent: e.target.checked })}
                    className="mt-1 size-5 shrink-0 accent-[var(--color-sodium)]"
                  />
                  <span>
                    <span className="block font-semibold">Help improve Vibe</span>
                    <span className="mt-1 block text-sm text-haze">
                      Record which picks you see, save and hide on this device so the team can measure what works. Optional, off unless you tick it.
                    </span>
                  </span>
                </label>
              </fieldset>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button type="button" onClick={() => go(-1)} disabled={step === 0} className="btn btn-ghost">
          <ArrowLeft className="size-4" aria-hidden /> Back
        </button>
        <button type="button" onClick={() => go(1)} className="btn btn-primary">
          {step === STEPS.length - 1 ? "Show my picks" : "Continue"} <ArrowRight className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
