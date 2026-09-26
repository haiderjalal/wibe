"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, CalendarClock, Check, MapPin, Ticket, Users } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";

import { Cover } from "@/components/Cover";
import { SaveButton } from "@/components/app/SaveButton";
import { CATEGORIES } from "@/lib/categories";
import { CITIES, ISLAMABAD, neighborhood } from "@/lib/data";
import { isOpenAt, recommend } from "@/lib/engine";
import { photoFor } from "@/lib/media";
import { formatDay, formatMoney, formatTime, formatVerified, reasonLabel } from "@/lib/format";
import { useCatalog, useWibe, wibe } from "@/lib/store";
import type { City, Item } from "@/lib/types";

const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const STATE_NOTE: Record<string, string> = {
  draft: "Draft · only you can see this",
  submitted: "In review · not visible to members yet",
  approved: "Approved · waiting to be published",
  rejected: "Not approved",
  suspended: "Suspended by the city team",
};

function hoursFor(item: Item & { type: "venue" }, weekday: number): string {
  const slots = item.hours.filter((h) => h.weekday === weekday);
  if (!slots.length) return "Closed";
  return slots.map((h) => `${h.opens}–${h.closes}`).join(", ");
}

/** Cover that slowly zooms and drifts as the page scrolls. */
function ParallaxCover({ item }: { item: Item }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  return (
    <motion.div ref={ref} style={{ scale, y }}>
      <Cover category={item.category} photo={photoFor(item)} sizes="(min-width: 1152px) 1152px, 100vw" priority className="h-72 md:h-[30rem]" iconClassName="size-72 md:size-[26rem]" />
    </motion.div>
  );
}

export function ItemDetail({ id }: { id: string }) {
  const { ready, prefs, saves } = useWibe();
  const catalog = useCatalog();
  const [now] = useState(() => new Date());

  if (!ready) return <div className="h-[70vh] animate-pulse rounded-[2rem] bg-ridge/40" aria-busy="true" />;

  const item = catalog.find((i) => i.id === id);
  if (!item) {
    return (
      <div className="sector-grid mx-auto max-w-lg rounded-[2rem] border border-line p-10 text-center">
        <h1 className="font-display text-3xl font-bold">This listing isn’t available</h1>
        <p className="mt-3 text-haze">It may have ended or been removed. Your other picks are still waiting.</p>
        <Link href="/discover" className="btn btn-primary mt-8">
          Back to Discover
        </Link>
      </div>
    );
  }

  const city: City = CITIES.find((c) => c.id === item.cityId) ?? ISLAMABAD;
  const place = neighborhood(city, item.neighborhoodId);
  const rec = prefs
    ? recommend({ candidates: [item], prefs, city, intent: "anytime", now, origin: neighborhood(city, prefs.neighborhoodId), hidden: [], savedCategories: [] })[0]
    : undefined;
  const saved = saves.includes(item.id);
  const soldOut = item.type === "event" && item.session.remaining === 0;
  const stateNote = item.type === "event" ? STATE_NOTE[item.state] : undefined;

  return (
    <article>
      <Link href="/discover" className="mb-5 inline-flex items-center gap-2 text-sm text-haze transition-colors hover:text-jasmine">
        <ArrowLeft className="size-4" aria-hidden /> Back to picks
      </Link>

      <div className="relative overflow-hidden rounded-[2rem]">
        <ParallaxCover item={item} />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 md:p-10">
          <div>
            <p className="eyebrow !text-jasmine/80">
              {CATEGORIES[item.category].label} · {place.name}
            </p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-2 font-display text-[clamp(2rem,5.5vw,4rem)] font-extrabold leading-[0.95]"
              style={{ fontVariationSettings: '"wdth" 105' }}
            >
              {item.title}
            </motion.h1>
          </div>
          <SaveButton saved={saved} onToggle={() => wibe.toggleSave(item.id)} label={item.title} className="relative !size-12 shrink-0" />
        </div>
      </div>

      {stateNote && <p className="mt-6 rounded-2xl border border-sodium/40 bg-sodium/10 px-5 py-3 text-sm text-sodium">{stateNote}</p>}

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-10">
          <section>
            <p className="text-xl leading-relaxed">{item.blurb}</p>
            <p className="mt-4 leading-relaxed text-haze">{item.description}</p>
          </section>

          {rec && (
            <section aria-labelledby="why-title" className="rounded-[1.6rem] border border-line bg-ridge/50 p-6">
              <h2 id="why-title" className="eyebrow mb-4">
                Why it’s in your picks
              </h2>
              <ul className="space-y-3">
                {rec.reasons.map((code, i) => (
                  <motion.li key={code} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }} className="flex items-center gap-3">
                    <span className="grid size-6 place-items-center rounded-full bg-pine/15 text-pine">
                      <Check className="size-3.5" aria-hidden />
                    </span>
                    {prefs && reasonLabel(code, { item, prefs, city, distanceMeters: rec.distanceMeters, now })}
                  </motion.li>
                ))}
              </ul>
            </section>
          )}

          {item.type === "venue" && (
            <section aria-labelledby="hours-title">
              <h2 id="hours-title" className="eyebrow mb-4">
                Opening hours · {isOpenAt(item, now, city.timezone) ? "open now" : "closed now"}
              </h2>
              <dl className="divide-y divide-line rounded-[1.6rem] border border-line">
                {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                  <div key={d} className="flex justify-between px-5 py-3 text-sm">
                    <dt className="text-haze">{WEEKDAY_NAMES[d]}</dt>
                    <dd className="font-mono">{hoursFor(item, d)}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-5 rounded-[1.6rem] border border-line bg-ridge/70 p-6">
            <p className="font-display text-3xl font-bold text-sodium" style={{ fontVariationSettings: '"wdth" 110' }}>
              {formatMoney(item.priceMinor, city)}
              {item.priceMinor > 0 && <span className="ml-2 font-sans text-sm font-normal text-haze">per person</span>}
            </p>
            <ul className="space-y-3 text-sm">
              {item.type === "event" && (
                <>
                  <li className="flex items-center gap-3">
                    <CalendarClock className="size-4 text-haze" aria-hidden />
                    {formatDay(new Date(item.session.startsAt), city, now)}, {formatTime(new Date(item.session.startsAt), city)} – {formatTime(new Date(item.session.endsAt), city)}
                  </li>
                  <li className="flex items-center gap-3">
                    <Users className="size-4 text-haze" aria-hidden />
                    {soldOut ? "Sold out" : `${item.session.remaining} of ${item.session.capacity} spots left`}
                  </li>
                </>
              )}
              <li className="flex items-center gap-3">
                <MapPin className="size-4 text-haze" aria-hidden />
                {item.type === "event" && item.venueName ? `${item.venueName}, ` : ""}
                {place.name}, {city.name}
              </li>
              <li className="flex items-center gap-3 text-pine">
                <BadgeCheck className="size-4" aria-hidden />
                {formatVerified(item.verifiedAt, now)} by the city team
              </li>
            </ul>
            <button type="button" disabled className="btn btn-primary w-full">
              <Ticket className="size-4" aria-hidden />
              {item.type === "event" ? "Get tickets" : "Request a table"}
            </button>
            <p className="text-xs leading-relaxed text-haze">
              Booking opens with the transaction pilot. For now, save it and we’ll keep it at the top of your list.
            </p>
            <p className="border-t border-line pt-4 text-xs text-haze">Listed by {item.organization}</p>
          </div>
        </aside>
      </div>
    </article>
  );
}
