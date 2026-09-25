// Acceptance checks for the discovery engine (blueprint §13 "Recommendation" row). Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { recommend, zonedDate, isOpenAt } from "./engine.ts";

const TZ = "Asia/Karachi";
const city = { id: "isb", name: "Islamabad", countryCode: "PK", timezone: TZ, locale: "en-PK", currency: "PKR", state: "live", neighborhoods: [] };
const origin = { lat: 33.7215, lng: 73.055 };
// Friday 25 Sep 2026, 15:00 local
const now = new Date("2026-09-25T10:00:00Z");
const prefs = { cityId: "isb", neighborhoodId: "f7", interests: ["live_music", "cafe"], budgetMinor: 250_000, maxDistanceKm: 8, analyticsConsent: false };
const daily = (opens, closes) => [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({ weekday, opens, closes }));

const base = { cityId: "isb", neighborhoodId: "f7", lat: 33.72, lng: 73.06, priceMinor: 80_000, blurb: "", description: "", organization: "", verifiedAt: "2026-09-24T09:00:00Z", quality: 0.9 };
const venue = (id, extra = {}) => ({ ...base, id, type: "venue", title: id, category: "cafe", hours: daily("09:00", "23:00"), ...extra });
const event = (id, extra = {}) => ({
  ...base, id, type: "event", title: id, category: "live_music", organizationId: "org", state: "published",
  session: { startsAt: "2026-09-25T11:00:00Z", endsAt: "2026-09-25T13:00:00Z", capacity: 50, remaining: 10 },
  ...extra,
});

const run = (candidates, extra = {}) =>
  recommend({ candidates, prefs, city, intent: "now", now, origin, hidden: [], savedCategories: [], ...extra });

test("zonedDate converts local wall-clock time to UTC", () => {
  assert.equal(zonedDate(now, 0, 20, 0, TZ).toISOString(), "2026-09-25T15:00:00.000Z");
  assert.equal(zonedDate(now, 1, 6, 30, TZ).toISOString(), "2026-09-26T01:30:00.000Z");
});

test("overnight hours stay open past midnight", () => {
  const v = venue("late", { hours: daily("18:00", "02:00") });
  assert.equal(isOpenAt(v, new Date("2026-09-25T20:30:00Z"), TZ), true); // 01:30 Saturday local
  assert.equal(isOpenAt(v, new Date("2026-09-25T22:00:00Z"), TZ), false); // 03:00
});

test("closed, sold-out, unpublished, out-of-city, over-budget, too-far, stale and hidden candidates are removed", () => {
  const result = run(
    [
      venue("open"),
      event("live"),
      venue("closed", { hours: daily("18:00", "23:00") }),
      event("soldout", { session: { ...event("x").session, remaining: 0 } }),
      event("draft", { state: "submitted" }),
      venue("elsewhere", { cityId: "lhe" }),
      venue("pricey", { priceMinor: 900_000 }),
      venue("far", { lat: 33.9, lng: 73.4 }),
      venue("stale", { verifiedAt: "2026-07-01T00:00:00Z" }),
      venue("hidden"),
    ],
    { hidden: ["hidden"] },
  );
  assert.deepEqual(result.map((r) => r.item.id).sort(), ["live", "open"]);
});

test("every recommendation carries two or three reasons", () => {
  for (const r of run([venue("a"), event("b"), venue("c", { category: "sports" })])) {
    assert.ok(r.reasons.length >= 2 && r.reasons.length <= 3, `${r.item.id}: ${r.reasons}`);
  }
});

test("diversity keeps one category from taking every top slot", () => {
  const cafes = ["c1", "c2", "c3"].map((id) => venue(id, { quality: 1 }));
  const other = venue("music", { category: "live_music", quality: 0.95 });
  const ids = run([...cafes, other]).map((r) => r.item.id);
  assert.ok(ids.indexOf("music") < 2, ids.join(","));
});
