/**
 * Deterministic discovery engine (blueprint §9): time windows, hard constraints, weighted scoring,
 * diversity re-ranking and plain-language reason codes.
 *
 * Kept free of runtime imports so `node --test` can load it directly (see engine.test.mjs).
 */
import type {
  Category,
  City,
  EventItem,
  Intent,
  Item,
  Preferences,
  ReasonCode,
  Recommendation,
  Venue,
} from "./types";

const HOUR_MS = 3_600_000;
const DAY_MS = 24 * HOUR_MS;
const STALE_AFTER_DAYS = 30;
const FRESH_WITHIN_DAYS = 3;
const MAX_REASONS = 3;
/** Score subtracted per earlier pick of the same category, so one category cannot dominate. */
const DIVERSITY_PENALTY = 0.08;

/** Illustrative weights from the blueprint. Not production truth. */
const WEIGHTS = {
  interest: 0.3,
  time: 0.15,
  distance: 0.15,
  price: 0.1,
  similarity: 0.1,
  freshness: 0.1,
  quality: 0.1,
} as const;

const FOOD: ReadonlySet<Category> = new Set(["desi", "cafe", "fine_dining", "street_food"]);
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ---------- time ----------

export interface LocalParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  weekday: number;
}

/** Wall-clock parts of an instant in an IANA time zone. */
export function localParts(date: Date, timeZone: string): LocalParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    weekday: "short",
  }).formatToParts(date);
  const get = (type: string): string => parts.find((p) => p.type === type)?.value ?? "";
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
    weekday: WEEKDAYS.indexOf(get("weekday")),
  };
}

/** UTC instant for `hour:minute` local time, `dayOffset` local days after `from`, in `timeZone`. */
export function zonedDate(from: Date, dayOffset: number, hour: number, minute: number, timeZone: string): Date {
  const p = localParts(from, timeZone);
  const guess = Date.UTC(p.year, p.month - 1, p.day + dayOffset, hour, minute);
  const g = localParts(new Date(guess), timeZone);
  const offset = Date.UTC(g.year, g.month - 1, g.day, g.hour, g.minute) - guess;
  return new Date(guess - offset);
}

export interface TimeWindow {
  start: Date;
  end: Date;
  /** Reference instant used to check venue opening hours. Null means opening hours are not checked. */
  at: Date | null;
}

const later = (a: Date, b: Date): Date => (a > b ? a : b);

export function windowFor(intent: Intent, now: Date, timeZone: string): TimeWindow {
  switch (intent) {
    case "now":
      return { start: now, end: new Date(now.getTime() + 4 * HOUR_MS), at: now };
    case "tonight":
      return {
        start: later(now, zonedDate(now, 0, 17, 0, timeZone)),
        end: zonedDate(now, 1, 3, 0, timeZone),
        at: later(now, zonedDate(now, 0, 20, 0, timeZone)),
      };
    case "weekend": {
      const weekday = localParts(now, timeZone).weekday;
      const toSaturday = weekday === 0 ? -1 : 6 - weekday;
      const saturdayMorning = zonedDate(now, toSaturday, 10, 0, timeZone);
      return {
        start: later(now, saturdayMorning),
        end: zonedDate(now, toSaturday + 2, 0, 0, timeZone),
        at: later(now, zonedDate(now, toSaturday, 19, 0, timeZone)),
      };
    }
    case "anytime":
      return { start: now, end: new Date(now.getTime() + 14 * DAY_MS), at: null };
  }
}

const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export function isOpenAt(venue: Venue, at: Date, timeZone: string): boolean {
  const p = localParts(at, timeZone);
  const minutes = p.hour * 60 + p.minute;
  const yesterday = (p.weekday + 6) % 7;
  return venue.hours.some((h) => {
    const opens = toMinutes(h.opens);
    const closes = toMinutes(h.closes);
    if (closes > opens) return h.weekday === p.weekday && minutes >= opens && minutes < closes;
    return (h.weekday === p.weekday && minutes >= opens) || (h.weekday === yesterday && minutes < closes);
  });
}

// ---------- geography ----------

export function distanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * 6_371_000 * Math.asin(Math.sqrt(h));
}

// ---------- ranking ----------

export interface RecommendInput {
  candidates: readonly Item[];
  prefs: Preferences;
  city: City;
  intent: Intent;
  now: Date;
  origin: { lat: number; lng: number };
  hidden: readonly string[];
  /** Categories of items the member saved; drives prior-similarity. */
  savedCategories: readonly Category[];
}

type Features = Record<keyof typeof WEIGHTS, number>;

function passesHardConstraints(item: Item, input: RecommendInput, window: TimeWindow, distance: number): boolean {
  const { prefs, city, now } = input;
  if (item.cityId !== city.id) return false;
  if (input.hidden.includes(item.id)) return false;
  if (item.priceMinor > prefs.budgetMinor) return false;
  if (distance > prefs.maxDistanceKm * 1000) return false;
  if ((now.getTime() - Date.parse(item.verifiedAt)) / DAY_MS > STALE_AFTER_DAYS) return false;

  if (item.type === "venue") return window.at === null || isOpenAt(item, window.at, city.timezone);

  const { session } = item;
  return (
    item.state === "published" &&
    session.remaining > 0 &&
    Date.parse(session.startsAt) < window.end.getTime() &&
    Date.parse(session.endsAt) > window.start.getTime()
  );
}

function timeFeature(item: Item, window: TimeWindow): number {
  if (item.type === "venue") return window.at === null ? 0.6 : 1;
  const span = window.end.getTime() - window.start.getTime();
  const wait = Math.max(0, Date.parse((item as EventItem).session.startsAt) - window.start.getTime());
  return 1 - wait / span;
}

function scoreFeatures(item: Item, input: RecommendInput, window: TimeWindow, distance: number): Features {
  const { prefs, now } = input;
  const ageDays = (now.getTime() - Date.parse(item.verifiedAt)) / DAY_MS;
  const sameGroup = prefs.interests.some((c) => FOOD.has(c) === FOOD.has(item.category));
  const savedSameCategory = input.savedCategories.filter((c) => c === item.category).length;
  return {
    interest: prefs.interests.includes(item.category) ? 1 : sameGroup ? 0.35 : 0,
    time: timeFeature(item, window),
    distance: 1 - distance / (prefs.maxDistanceKm * 1000),
    price: item.priceMinor === 0 ? 1 : 1 - 0.5 * (item.priceMinor / prefs.budgetMinor),
    similarity: Math.min(1, savedSameCategory / 2),
    freshness: ageDays <= FRESH_WITHIN_DAYS ? 1 : Math.max(0, 1 - (ageDays - FRESH_WITHIN_DAYS) / (STALE_AFTER_DAYS - FRESH_WITHIN_DAYS)),
    quality: item.quality,
  };
}

function reasonsFor(item: Item, f: Features, intent: Intent): ReasonCode[] {
  // Only codes that are true for this item are eligible; NEARBY and WITHIN_BUDGET always hold after filtering.
  const eligible: [ReasonCode, number][] = [
    ["NEARBY", WEIGHTS.distance * f.distance],
    ["WITHIN_BUDGET", WEIGHTS.price * f.price],
  ];
  if (f.interest === 1) eligible.push(["INTEREST_MATCH", WEIGHTS.interest]);
  if (item.type === "event") eligible.push(["STARTS_IN_WINDOW", WEIGHTS.time * f.time]);
  else if (intent !== "anytime") eligible.push(["OPEN_AT_REQUESTED_TIME", WEIGHTS.time]);
  if (f.similarity > 0) eligible.push(["LIKE_YOUR_SAVES", WEIGHTS.similarity * f.similarity]);
  if (f.freshness >= 0.8) eligible.push(["RECENTLY_VERIFIED", WEIGHTS.freshness * f.freshness]);
  if (f.quality >= 0.85) eligible.push(["HIGHLY_RATED", WEIGHTS.quality * f.quality]);
  return eligible
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_REASONS)
    .map(([code]) => code);
}

export function recommend(input: RecommendInput): Recommendation[] {
  const window = windowFor(input.intent, input.now, input.city.timezone);

  const scored: Recommendation[] = [];
  for (const item of input.candidates) {
    const distance = distanceMeters(input.origin, item);
    if (!passesHardConstraints(item, input, window, distance)) continue;
    const f = scoreFeatures(item, input, window, distance);
    const score = (Object.keys(WEIGHTS) as (keyof typeof WEIGHTS)[]).reduce((sum, k) => sum + WEIGHTS[k] * f[k], 0);
    scored.push({ item, score, reasons: reasonsFor(item, f, input.intent), distanceMeters: Math.round(distance) });
  }

  // ponytail: O(n²) greedy diversity re-rank; fine for city-sized candidate sets, batch by category if n grows large.
  const ranked: Recommendation[] = [];
  const perCategory = new Map<Category, number>();
  while (scored.length) {
    let best = 0;
    let bestScore = -Infinity;
    scored.forEach((r, i) => {
      const adjusted = r.score - DIVERSITY_PENALTY * (perCategory.get(r.item.category) ?? 0);
      if (adjusted > bestScore) [best, bestScore] = [i, adjusted];
    });
    const [pick] = scored.splice(best, 1);
    perCategory.set(pick.item.category, (perCategory.get(pick.item.category) ?? 0) + 1);
    ranked.push({ ...pick, score: Math.round(pick.score * 100) / 100 });
  }
  return ranked;
}
