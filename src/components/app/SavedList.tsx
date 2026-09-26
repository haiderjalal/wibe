"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { Cover } from "@/components/Cover";
import { SaveButton } from "@/components/app/SaveButton";
import { CATEGORIES } from "@/lib/categories";
import { ISLAMABAD, neighborhood } from "@/lib/data";
import { formatMoney, formatWhen } from "@/lib/format";
import { useCatalog, useWibe, wibe } from "@/lib/store";

export function SavedList() {
  const { ready, saves } = useWibe();
  const catalog = useCatalog();
  const [now] = useState(() => new Date());

  if (!ready) return <div className="h-96 animate-pulse rounded-[2rem] bg-ridge/40" aria-busy="true" />;
  const items = saves.flatMap((id) => catalog.find((i) => i.id === id) ?? []);

  return (
    <>
      <p className="eyebrow">Your shortlist</p>
      <h1 className="mt-3 font-display text-[clamp(2.2rem,6vw,3.8rem)] font-extrabold leading-none" style={{ fontVariationSettings: '"wdth" 112' }}>
        Saved <span className="align-top font-mono text-base font-medium text-sodium">{items.length}</span>
      </h1>

      {items.length === 0 ? (
        <div className="sector-grid mt-10 rounded-[2rem] border border-dashed border-line p-10 text-center">
          <Heart className="mx-auto size-9 text-haze" aria-hidden />
          <h2 className="mt-5 text-xl font-semibold">Nothing saved yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-haze">Tap the heart on any pick to keep it here for later.</p>
          <Link href="/discover" className="btn btn-primary mt-6">
            Browse picks
          </Link>
        </div>
      ) : (
        <ul className="mt-10 space-y-4">
          <AnimatePresence initial={false}>
            {items.map((item, i) => (
              <motion.li
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
                exit={{ opacity: 0, x: -60 }}
                className="relative flex items-center gap-4 rounded-[1.4rem] border border-line bg-ridge/60 p-3 pr-4 transition-colors hover:border-haze/40"
              >
                <Cover category={item.category} className="size-20 shrink-0 rounded-2xl sm:size-24" iconClassName="size-16" />
                <div className="min-w-0 flex-1">
                  <p className="eyebrow !text-[0.6rem]">
                    {CATEGORIES[item.category].label} · {neighborhood(ISLAMABAD, item.neighborhoodId).name}
                  </p>
                  <Link href={`/discover/${item.id}`} className="mt-1 block truncate text-lg font-semibold after:absolute after:inset-0 after:content-['']">
                    {item.title}
                  </Link>
                  <p className="text-sm text-haze">
                    {formatWhen(item, ISLAMABAD, now)} · <span className="text-sodium">{formatMoney(item.priceMinor, ISLAMABAD)}</span>
                  </p>
                </div>
                <SaveButton saved onToggle={() => wibe.toggleSave(item.id)} label={item.title} className="relative z-10" />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </>
  );
}
