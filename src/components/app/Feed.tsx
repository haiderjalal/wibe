"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Compass, SlidersHorizontal } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { ItemCard } from "@/components/app/ItemCard";
import { Toast, type ToastMessage } from "@/components/app/Toast";
import { CITIES, ISLAMABAD, neighborhood } from "@/lib/data";
import { recommend } from "@/lib/engine";
import { formatMoney } from "@/lib/format";
import { useCatalog, useVibe, vibe } from "@/lib/store";
import type { Category, Intent, Item, Preferences } from "@/lib/types";

const INTENTS: { id: Intent; label: string; heading: string }[] = [
  { id: "now", label: "Right now", heading: "Right now" },
  { id: "tonight", label: "Tonight", heading: "Tonight" },
  { id: "weekend", label: "This weekend", heading: "This weekend" },
  { id: "anytime", label: "Anytime", heading: "Coming up" },
];

/** Short stable hash so one result set maps to one request id. */
function requestIdFor(parts: unknown): string {
  const s = JSON.stringify(parts);
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return `rec_req_${(h >>> 0).toString(36)}`;
}

export function FeedSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading picks">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="h-[380px] animate-pulse rounded-[1.6rem] bg-ridge/50" />
      ))}
    </div>
  );
}

export function Feed() {
  const { ready, prefs, saves, hidden } = useVibe();
  const catalog = useCatalog();

  if (!ready) return <FeedSkeleton />;
  if (!prefs) {
    return (
      <div className="sector-grid mx-auto max-w-xl rounded-[2rem] border border-line p-10 text-center">
        <Compass className="mx-auto size-10 text-sodium" aria-hidden />
        <h1 className="mt-6 font-display text-3xl font-bold">Set your vibe first</h1>
        <p className="mt-3 text-haze">Tell us what you’re into and where you start from. It takes under a minute.</p>
        <Link href="/onboarding" className="btn btn-primary mt-8">
          Set your vibe
        </Link>
      </div>
    );
  }
  return <FeedResults prefs={prefs} catalog={catalog} saves={saves} hidden={hidden} />;
}

function FeedResults({ prefs, catalog, saves, hidden }: { prefs: Preferences; catalog: Item[]; saves: string[]; hidden: string[] }) {
  const [intent, setIntent] = useState<Intent>("tonight");
  const [now] = useState(() => new Date());
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const city = CITIES.find((c) => c.id === prefs.cityId) ?? ISLAMABAD;
  const origin = neighborhood(city, prefs.neighborhoodId);
  const savedCategories = saves.flatMap((id) => catalog.find((i) => i.id === id)?.category ?? []) as Category[];
  const recs = recommend({ candidates: catalog, prefs, city, intent, now, origin, hidden, savedCategories });
  const requestId = requestIdFor([intent, prefs, hidden, recs.map((r) => r.item.id)]);
  const current = INTENTS.find((i) => i.id === intent) ?? INTENTS[1];

  useEffect(() => {
    vibe.logImpression(requestId, recs.map((r) => r.item.id));
    // requestId already encodes the result ids.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  const hide = (item: Item, position: number) => {
    vibe.hide(item.id, { requestId, position });
    setToast({ id: `${item.id}-${hidden.length}`, text: `Hidden ${item.title}.`, action: { label: "Undo", onClick: () => vibe.unhide(item.id) } });
  };

  return (
    <>
      <header className="mb-8">
        <p className="eyebrow">
          {city.name} · from {origin.name}
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-[clamp(2.2rem,6vw,3.8rem)] font-extrabold leading-none" style={{ fontVariationSettings: '"wdth" 112' }}>
            <AnimatePresence mode="wait">
              <motion.span key={intent} className="inline-block" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
                {current.heading}
              </motion.span>
            </AnimatePresence>
            <span className="ml-3 align-top font-mono text-base font-medium text-sodium">{recs.length}</span>
          </h1>
          <Link href="/onboarding" className="flex items-center gap-2 text-sm text-haze transition-colors hover:text-jasmine">
            <SlidersHorizontal className="size-4" aria-hidden />
            Within {prefs.maxDistanceKm} km · up to {formatMoney(prefs.budgetMinor, city)} · Edit
          </Link>
        </div>

        <div role="radiogroup" aria-label="When" className="mt-6 flex gap-1 overflow-x-auto rounded-full border border-line p-1 [scrollbar-width:none] sm:w-fit">
          {INTENTS.map((i) => (
            <button
              key={i.id}
              type="button"
              role="radio"
              aria-checked={intent === i.id}
              onClick={() => setIntent(i.id)}
              className={`relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${intent === i.id ? "text-ink" : "text-haze hover:text-jasmine"}`}
            >
              {intent === i.id && <motion.span layoutId="intent-pill" className="absolute inset-0 rounded-full bg-sodium" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className="relative">{i.label}</span>
            </button>
          ))}
        </div>
      </header>

      {recs.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="sector-grid rounded-[2rem] border border-dashed border-line p-10 text-center">
          <Compass className="mx-auto size-9 text-haze" aria-hidden />
          <h2 className="mt-5 text-xl font-semibold">Nothing fits {current.label.toLowerCase()} yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-haze">Try another time, or widen your distance or budget.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {INTENTS.filter((i) => i.id !== intent).map((i) => (
              <button key={i.id} type="button" onClick={() => setIntent(i.id)} className="btn btn-ghost !py-2 text-sm">
                {i.label}
              </button>
            ))}
            <Link href="/onboarding" className="btn btn-primary !py-2 text-sm">
              Edit preferences
            </Link>
          </div>
        </motion.div>
      ) : (
        <motion.ul layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {recs.map((rec, position) => (
              <motion.li
                key={rec.item.id}
                layout
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
                transition={{ duration: 0.5, delay: Math.min(position, 8) * 0.05, ease: [0.22, 1, 0.36, 1] }}
              >
                <ItemCard
                  rec={rec}
                  city={city}
                  prefs={prefs}
                  now={now}
                  saved={saves.includes(rec.item.id)}
                  onToggleSave={() => vibe.toggleSave(rec.item.id, { requestId, position })}
                  onHide={() => hide(rec.item, position)}
                />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
      <Toast message={toast} onDismiss={() => setToast(null)} />
    </>
  );
}
