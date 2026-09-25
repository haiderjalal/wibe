"use client";

import Link from "next/link";
import { Check, Clock, EyeOff, MapPin } from "lucide-react";
import { motion } from "motion/react";

import { Cover } from "@/components/Cover";
import { SaveButton } from "@/components/app/SaveButton";
import { neighborhood } from "@/lib/data";
import { formatDistance, formatMoney, formatWhen, reasonLabel } from "@/lib/format";
import type { City, Preferences, Recommendation } from "@/lib/types";

const LOW_STOCK = 10;

export function ItemCard({
  rec,
  city,
  prefs,
  now,
  saved,
  onToggleSave,
  onHide,
}: {
  rec: Recommendation;
  city: City;
  prefs: Preferences;
  now: Date;
  saved: boolean;
  onToggleSave: () => void;
  onHide: () => void;
}) {
  const { item } = rec;
  const lowStock = item.type === "event" && item.session.remaining <= LOW_STOCK;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.6rem] border border-line bg-ridge/70 transition-[border-color,transform] duration-500 hover:-translate-y-1 hover:border-haze/40">
      <Cover category={item.category} sector={neighborhood(city, item.neighborhoodId).name} className="h-44" iconClassName="size-36">
        <span className="absolute bottom-3 left-4 rounded-full bg-ink/60 px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.14em] backdrop-blur">
          {item.type === "event" ? "Event" : "Place"}
        </span>
        {lowStock && (
          <span className="absolute bottom-3 right-4 rounded-full bg-dusk/90 px-2.5 py-1 text-[0.68rem] font-semibold text-ink">
            {item.type === "event" && `Only ${item.session.remaining} left`}
          </span>
        )}
      </Cover>
      <SaveButton saved={saved} onToggle={onToggleSave} label={item.title} className="absolute right-3 top-3 z-10" />

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <h2 className="font-display text-xl font-bold leading-tight" style={{ fontVariationSettings: '"wdth" 96' }}>
            <Link href={`/discover/${item.id}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
              {item.title}
            </Link>
          </h2>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-haze">
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden /> {formatWhen(item, city, now)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5" aria-hidden /> {formatDistance(rec.distanceMeters)}
            </span>
            <span className="font-semibold text-sodium">{formatMoney(item.priceMinor, city)}</span>
          </p>
        </div>

        <ul className="space-y-1.5" aria-label="Why it's here">
          {rec.reasons.map((code, i) => (
            <motion.li
              key={code}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              className="flex items-center gap-2 text-sm"
            >
              <span className="grid size-4 shrink-0 place-items-center rounded-full bg-pine/15 text-pine">
                <Check className="size-2.5" aria-hidden />
              </span>
              {reasonLabel(code, { item, prefs, city, distanceMeters: rec.distanceMeters, now })}
            </motion.li>
          ))}
        </ul>

        <button
          type="button"
          onClick={onHide}
          className="relative z-10 mt-auto flex w-fit items-center gap-1.5 rounded-full py-1 text-xs font-medium text-haze transition-colors hover:text-dusk"
        >
          <EyeOff className="size-3.5" aria-hidden /> Not for me
        </button>
      </div>
    </article>
  );
}
