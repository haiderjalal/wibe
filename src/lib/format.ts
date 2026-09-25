/** Display-boundary formatting. Currency, locale and time zone always come from the city record. */
import { CATEGORIES } from "./categories";
import { isOpenAt, localParts, zonedDate } from "./engine";
import type { City, Item, Preferences, ReasonCode } from "./types";

export function formatMoney(minor: number, city: City): string {
  if (minor === 0) return "Free";
  return new Intl.NumberFormat(city.locale, {
    style: "currency",
    currency: city.currency,
    maximumFractionDigits: 0,
  }).format(minor / 100);
}

export function formatDistance(meters: number): string {
  return meters < 1000 ? `${Math.round(meters / 50) * 50} m` : `${(meters / 1000).toFixed(1)} km`;
}

const dayDiff = (a: Date, b: Date, tz: string): number => {
  const pa = localParts(a, tz);
  const pb = localParts(b, tz);
  return Math.round((Date.UTC(pb.year, pb.month - 1, pb.day) - Date.UTC(pa.year, pa.month - 1, pa.day)) / 86_400_000);
};

export function formatTime(date: Date, city: City): string {
  return new Intl.DateTimeFormat(city.locale, { timeZone: city.timezone, hour: "numeric", minute: "2-digit" }).format(date);
}

export function formatDay(date: Date, city: City, now: Date): string {
  const diff = dayDiff(now, date, city.timezone);
  if (diff === 0) return localParts(date, city.timezone).hour >= 17 ? "Tonight" : "Today";
  if (diff === 1) return "Tomorrow";
  return new Intl.DateTimeFormat(city.locale, { timeZone: city.timezone, weekday: "short", day: "numeric", month: "short" }).format(date);
}

/** Short "when" line for a card: event start, or a venue's open state. */
export function formatWhen(item: Item, city: City, now: Date): string {
  if (item.type === "event") {
    const start = new Date(item.session.startsAt);
    return `${formatDay(start, city, now)} · ${formatTime(start, city)}`;
  }
  if (isOpenAt(item, now, city.timezone)) return "Open now";
  const p = localParts(now, city.timezone);
  const nowMinutes = p.hour * 60 + p.minute;
  const next = item.hours
    .filter((h) => h.weekday === p.weekday)
    .map((h) => h.opens.split(":").map(Number))
    .find(([h, m]) => h * 60 + m > nowMinutes);
  return next ? `Opens ${formatTime(zonedDate(now, 0, next[0], next[1], city.timezone), city)}` : "Closed now";
}

export function formatVerified(iso: string, now: Date): string {
  const days = Math.floor((now.getTime() - Date.parse(iso)) / 86_400_000);
  if (days <= 0) return "Verified today";
  if (days === 1) return "Verified yesterday";
  return `Verified ${days} days ago`;
}

/** Plain-language reason text (blueprint §9 step 5). */
export function reasonLabel(code: ReasonCode, ctx: { item: Item; prefs: Preferences; city: City; distanceMeters: number; now: Date }): string {
  const { item, prefs, city } = ctx;
  const origin = city.neighborhoods.find((n) => n.id === prefs.neighborhoodId)?.name ?? city.name;
  switch (code) {
    case "INTEREST_MATCH":
      return `You're into ${CATEGORIES[item.category].phrase}`;
    case "OPEN_AT_REQUESTED_TIME":
      return "Open when you want to go";
    case "STARTS_IN_WINDOW":
      return item.type === "event" ? `Starts ${formatDay(new Date(item.session.startsAt), city, ctx.now).toLowerCase()} at ${formatTime(new Date(item.session.startsAt), city)}` : "Fits your timing";
    case "NEARBY":
      return `${formatDistance(ctx.distanceMeters)} from ${origin}`;
    case "WITHIN_BUDGET":
      return item.priceMinor === 0 ? "Free to join" : `Within your ${formatMoney(prefs.budgetMinor, city)} budget`;
    case "LIKE_YOUR_SAVES":
      return "Similar to places you saved";
    case "RECENTLY_VERIFIED":
      return formatVerified(item.verifiedAt, ctx.now);
    case "HIGHLY_RATED":
      return "Strong track record with guests";
  }
}
