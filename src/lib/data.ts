/**
 * Fictional pilot fixtures (blueprint §12: "Seed fictional fixtures"). Every business name below is invented.
 * Event times are generated relative to `now` so the catalog always looks current.
 */
import { localParts, zonedDate } from "./engine";
import type { City, EventItem, Hours, Item, Venue } from "./types";

export const ISLAMABAD: City = {
  id: "isb",
  name: "Islamabad",
  countryCode: "PK",
  timezone: "Asia/Karachi",
  locale: "en-PK",
  currency: "PKR",
  state: "live",
  neighborhoods: [
    { id: "e7", name: "E-7", lat: 33.734, lng: 73.054 },
    { id: "e11", name: "E-11", lat: 33.699, lng: 72.975 },
    { id: "f6", name: "F-6", lat: 33.7294, lng: 73.0758 },
    { id: "f7", name: "F-7", lat: 33.7215, lng: 73.055 },
    { id: "f8", name: "F-8", lat: 33.71, lng: 73.037 },
    { id: "f10", name: "F-10", lat: 33.695, lng: 73.013 },
    { id: "f11", name: "F-11", lat: 33.685, lng: 72.99 },
    { id: "g9", name: "G-9", lat: 33.688, lng: 73.03 },
    { id: "g11", name: "G-11", lat: 33.669, lng: 72.996 },
    { id: "i8", name: "I-8", lat: 33.668, lng: 73.077 },
    { id: "blue", name: "Blue Area", lat: 33.709, lng: 73.065 },
    { id: "saidpur", name: "Saidpur", lat: 33.744, lng: 73.068 },
    { id: "trail5", name: "Margalla Trails", lat: 33.744, lng: 73.045 },
    { id: "lakeview", name: "Lake View", lat: 33.707, lng: 73.125 },
  ],
};

export const CITIES: City[] = [ISLAMABAD];

/** The organization the partner-portal demo acts as. */
export const DEMO_ORG = { id: "org_nightowl", name: "Night Owl Collective" };

export function neighborhood(city: City, id: string) {
  return city.neighborhoods.find((n) => n.id === id) ?? city.neighborhoods[0];
}

const PKR = (rupees: number): number => rupees * 100;
const everyDay = (opens: string, closes: string): Hours[] =>
  [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({ weekday, opens, closes }));

type Seed<T extends Item> = Omit<T, "cityId" | "lat" | "lng" | "verifiedAt"> & { verifiedDaysAgo: number };

const VENUES: Seed<Venue>[] = [
  {
    id: "v_chess", type: "venue", title: "Chaiwala & Chess Club", category: "cafe", neighborhoodId: "f7",
    priceMinor: PKR(600), quality: 0.88, verifiedDaysAgo: 2, organization: "Chaiwala Club",
    blurb: "Doodh patti, cardamom rusks and forty boards that never sit empty.",
    description: "A long room of low tables, pressure-cooker chai and a house rule that anyone can challenge anyone. Beginners get the corner table with the laminated openings cheat sheet.",
    hours: everyDay("16:00", "01:00"),
  },
  {
    id: "v_ember", type: "venue", title: "Ember & Ridge", category: "fine_dining", neighborhoodId: "e7",
    priceMinor: PKR(4500), quality: 0.93, verifiedDaysAgo: 5, organization: "Ember Hospitality",
    blurb: "Open-fire kitchen with a terrace that faces the Margallas.",
    description: "Seasonal tasting menus cooked over walnut wood. Book the terrace at sunset and watch the ridge turn violet while the kitchen fires the lamb.",
    hours: everyDay("18:30", "23:30"),
  },
  {
    id: "v_nihari", type: "venue", title: "Lalten Nihari House", category: "desi", neighborhoodId: "g9",
    priceMinor: PKR(900), quality: 0.9, verifiedDaysAgo: 1, organization: "Lalten Foods",
    blurb: "Slow-cooked overnight, gone by midnight.",
    description: "Bone-marrow nihari, fresh khameeri roti and a lantern-lit courtyard. Breakfast service for early risers, a second pot for the late crowd.",
    hours: [...everyDay("06:00", "11:00"), ...everyDay("18:00", "00:30")],
  },
  {
    id: "v_bunkebab", type: "venue", title: "Bun Kebab Lane", category: "street_food", neighborhoodId: "i8",
    priceMinor: PKR(400), quality: 0.8, verifiedDaysAgo: 9, organization: "Lane Vendors Association",
    blurb: "Six stalls, one griddle-smoked alley.",
    description: "Anda shami bun kebabs, chutney three ways and a sugarcane cart at the end of the row. Cash and wallets accepted.",
    hours: everyDay("17:00", "02:00"),
  },
  {
    id: "v_clay", type: "venue", title: "The Clay Room", category: "arts", neighborhoodId: "f11",
    priceMinor: PKR(2500), quality: 0.86, verifiedDaysAgo: 4, organization: "Clay Room Studio",
    blurb: "Drop-in studio time with wheels, glazes and kiln firing.",
    description: "Open studio hours with a resident potter on the floor. Your price covers clay, tools and one firing.",
    hours: [2, 3, 4, 5, 6, 0].map((weekday) => ({ weekday, opens: "11:00", closes: "20:00" })),
  },
  {
    id: "v_padel", type: "venue", title: "Court Nine Padel", category: "sports", neighborhoodId: "e11",
    priceMinor: PKR(2000), quality: 0.84, verifiedDaysAgo: 3, organization: "Court Nine",
    blurb: "Four glass courts, floodlit until midnight.",
    description: "Rackets and balls included. Solo players can join the open-play board at the front desk.",
    hours: everyDay("07:00", "00:00"),
  },
  {
    id: "v_chapter", type: "venue", title: "Second Chapter Books & Coffee", category: "cafe", neighborhoodId: "f6",
    priceMinor: PKR(800), quality: 0.87, verifiedDaysAgo: 6, organization: "Second Chapter",
    blurb: "Used Urdu and English paperbacks with a quiet upstairs.",
    description: "Pour-overs, a shelf of local poetry and a no-calls reading floor. Thursday evenings host a slow-reading circle.",
    hours: everyDay("09:00", "22:00"),
  },
  {
    id: "v_lantern", type: "venue", title: "Lantern Courtyard", category: "desi", neighborhoodId: "saidpur",
    priceMinor: PKR(2200), quality: 0.83, verifiedDaysAgo: 12, organization: "Courtyard Kitchens",
    blurb: "Karahi and live sitar in a village courtyard.",
    description: "Charcoal karahi, stone-baked naan and an old banyan strung with lights. Families and big groups welcome.",
    hours: everyDay("12:00", "23:30"),
  },
  {
    id: "v_crux", type: "venue", title: "Crux Bouldering Wall", category: "sports", neighborhoodId: "g11",
    priceMinor: PKR(1500), quality: 0.82, verifiedDaysAgo: 7, organization: "Crux Climbing",
    blurb: "Colour-graded problems reset every fortnight.",
    description: "Shoe rental, chalk and an intro briefing for first-timers. Women-only sessions on Tuesday mornings.",
    hours: everyDay("10:00", "22:00"),
  },
];

interface EventSeed extends Omit<Seed<EventItem>, "session" | "state" | "organizationId"> {
  when: { day: number | "tonight" | "sat" | "sun"; start: [number, number]; hours: number };
  capacity: number;
  remaining: number;
  organizationId?: string;
}

const EVENTS: EventSeed[] = [
  {
    id: "e_jazz", type: "event", title: "Monsoon Jazz Night", category: "live_music", neighborhoodId: "f6",
    priceMinor: PKR(2500), quality: 0.91, verifiedDaysAgo: 1, organization: DEMO_ORG.name, organizationId: DEMO_ORG.id,
    blurb: "A five-piece quartet (don't ask) in a basement that holds the heat.",
    description: "Two sets of standards and originals, a short break for chai and a late jam for anyone who brought an instrument.",
    when: { day: "tonight", start: [21, 0], hours: 2.5 }, capacity: 120, remaining: 34,
  },
  {
    id: "e_trail", type: "event", title: "Sunrise Trail Run", category: "outdoors", neighborhoodId: "trail5",
    priceMinor: 0, quality: 0.89, verifiedDaysAgo: 2, organization: "Margalla Run Club",
    blurb: "Trail 5 at first light, three pace groups, no one left behind.",
    description: "A guided 7 km loop with sweep runners at the back. Meet at the trailhead gate; bring water and a head torch.",
    when: { day: 1, start: [6, 0], hours: 2 }, capacity: 60, remaining: 22,
  },
  {
    id: "e_openmic", type: "event", title: "Open Mic: Urdu & English", category: "comedy", neighborhoodId: "g9",
    priceMinor: PKR(800), quality: 0.85, verifiedDaysAgo: 3, organization: "Mic Drop ISB",
    blurb: "Five-minute slots, bilingual crowd, generous applause.",
    description: "Stand-up, spoken word and the occasional ghazal. Sign up at the door for a slot or come to listen.",
    when: { day: "tonight", start: [20, 0], hours: 2.5 }, capacity: 80, remaining: 12,
  },
  {
    id: "e_qawwali", type: "event", title: "Qawwali under the Stars", category: "live_music", neighborhoodId: "saidpur",
    priceMinor: PKR(3000), quality: 0.94, verifiedDaysAgo: 1, organization: DEMO_ORG.name, organizationId: DEMO_ORG.id,
    blurb: "A full party in the village square, floor seating and chai.",
    description: "A traditional qawwali party performing through the evening. Cushions provided; arrive early for the front rows.",
    when: { day: "sat", start: [20, 30], hours: 3 }, capacity: 200, remaining: 88,
  },
  {
    id: "e_wheel", type: "event", title: "Wheel-throwing for Beginners", category: "workshops", neighborhoodId: "f11",
    priceMinor: PKR(4500), quality: 0.9, verifiedDaysAgo: 4, organization: "Clay Room Studio",
    blurb: "Centre, open and pull your first bowl in one afternoon.",
    description: "Small group of twelve with two instructors. Pieces are glazed and fired for collection the following week.",
    when: { day: "sun", start: [16, 0], hours: 2.5 }, capacity: 12, remaining: 3,
  },
  {
    id: "e_boardgames", type: "event", title: "Board Game Social", category: "social", neighborhoodId: "f7",
    priceMinor: PKR(500), quality: 0.84, verifiedDaysAgo: 2, organization: "Chaiwala Club",
    blurb: "Come solo, leave with a team. Hosts pair you up.",
    description: "Catan, Codenames and a stack of quick party games. Hosts introduce newcomers and rotate tables every hour.",
    when: { day: 1, start: [18, 0], hours: 4 }, capacity: 40, remaining: 18,
  },
  {
    id: "e_cinema", type: "event", title: "Rooftop Cinema: Classics", category: "arts", neighborhoodId: "e7",
    priceMinor: PKR(1200), quality: 0.88, verifiedDaysAgo: 2, organization: DEMO_ORG.name, organizationId: DEMO_ORG.id,
    blurb: "Restored classics on a rooftop screen, blankets supplied.",
    description: "This week: a restored 1960s Lahore studio picture with English subtitles.",
    when: { day: "tonight", start: [20, 30], hours: 2.5 }, capacity: 50, remaining: 0,
  },
  {
    id: "e_nightride", type: "event", title: "Night Ride: Lake View Loop", category: "outdoors", neighborhoodId: "lakeview",
    priceMinor: PKR(500), quality: 0.83, verifiedDaysAgo: 5, organization: "Pedal Pakistan",
    blurb: "An easy 15 km group ride with lights and a chai stop.",
    description: "Marshalled ride at a relaxed pace. Helmets compulsory; bike rentals available on request.",
    when: { day: "sat", start: [21, 0], hours: 2 }, capacity: 50, remaining: 20,
  },
  {
    id: "e_calligraphy", type: "event", title: "Calligraphy & Chai", category: "workshops", neighborhoodId: "f6",
    priceMinor: PKR(2000), quality: 0.87, verifiedDaysAgo: 3, organization: "Second Chapter",
    blurb: "Nastaliq basics with a qalam, ink and patient teachers.",
    description: "Learn to cut a reed pen and write your name in nastaliq. All materials included.",
    when: { day: "sat", start: [11, 0], hours: 2.5 }, capacity: 20, remaining: 7,
  },
  {
    id: "e_wazwan", type: "event", title: "Wazwan Supper Club", category: "desi", neighborhoodId: "e11",
    priceMinor: PKR(5500), quality: 0.92, verifiedDaysAgo: 6, organization: "Supper Society",
    blurb: "A seven-course Kashmiri feast at one long table.",
    description: "Shared trami platters, rista, gushtaba and kahwa to finish. Twenty-four seats; tell the host about allergies.",
    when: { day: 6, start: [20, 0], hours: 3 }, capacity: 24, remaining: 9,
  },
  {
    id: "e_padelmixer", type: "event", title: "Padel Mixer (all levels)", category: "sports", neighborhoodId: "e11",
    priceMinor: PKR(1800), quality: 0.86, verifiedDaysAgo: 3, organization: "Court Nine",
    blurb: "Rotating doubles, a coach on court and cold drinks after.",
    description: "Americano format so you play with everyone. Rackets available at the desk.",
    when: { day: "sun", start: [17, 0], hours: 2 }, capacity: 16, remaining: 5,
  },
];

const WHEN_LABEL: Record<string, string> = { tonight: "Tonight", "1": "Tomorrow", sat: "Saturday", sun: "Sunday", "6": "Next week" };

/** Time-independent event summaries for marketing pages, safe to render on the server. */
export function featuredEvents() {
  return EVENTS.filter((e) => e.remaining > 0).map((e) => ({
    id: e.id,
    title: e.title,
    blurb: e.blurb,
    category: e.category,
    sector: neighborhood(ISLAMABAD, e.neighborhoodId).name,
    priceMinor: e.priceMinor,
    whenLabel: WHEN_LABEL[String(e.when.day)] ?? "This week",
  }));
}

function dayOffset(day: EventSeed["when"]["day"], start: [number, number], now: Date, timeZone: string): number {
  if (typeof day === "number") return day;
  if (day === "tonight") return zonedDate(now, 0, start[0], start[1], timeZone) > now ? 0 : 1;
  const weekday = localParts(now, timeZone).weekday;
  const target = day === "sat" ? 6 : 0;
  return (target - weekday + 7) % 7;
}

/** Builds the fictional Islamabad catalog relative to `now`. */
export function buildCatalog(now: Date, city: City = ISLAMABAD): Item[] {
  const place = (seed: { neighborhoodId: string; verifiedDaysAgo: number }) => {
    const n = neighborhood(city, seed.neighborhoodId);
    // Small deterministic jitter so places in one sector don't sit on the exact same point.
    const jitter = (seed.neighborhoodId.length % 5) * 0.0012;
    return {
      cityId: city.id,
      lat: n.lat + jitter,
      lng: n.lng - jitter,
      verifiedAt: new Date(now.getTime() - seed.verifiedDaysAgo * 86_400_000).toISOString(),
    };
  };

  const venues: Venue[] = VENUES.map(({ verifiedDaysAgo, ...v }) => ({ ...v, ...place({ ...v, verifiedDaysAgo }) }));
  const events: EventItem[] = EVENTS.map(({ verifiedDaysAgo, when, capacity, remaining, organizationId, ...e }) => {
    const startsAt = zonedDate(now, dayOffset(when.day, when.start, now, city.timezone), when.start[0], when.start[1], city.timezone);
    return {
      ...e,
      ...place({ ...e, verifiedDaysAgo }),
      organizationId: organizationId ?? `org_${e.id}`,
      state: "published",
      session: {
        startsAt: startsAt.toISOString(),
        endsAt: new Date(startsAt.getTime() + when.hours * 3_600_000).toISOString(),
        capacity,
        remaining,
      },
    };
  });
  return [...events, ...venues];
}
