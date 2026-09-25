/**
 * Device-local demo store (localStorage + useSyncExternalStore).
 *
 * ponytail: this stands in for the /v1 API from blueprint §7. The role checks in `transition` only
 * model the policy for the demo; real authorization must live server-side before any launch.
 */
import { useMemo, useSyncExternalStore } from "react";
import { z } from "zod";

import { CATEGORY_IDS } from "./categories";
import { buildCatalog, DEMO_ORG, ISLAMABAD, neighborhood } from "./data";
import { zonedDate } from "./engine";
import type { AnalyticsEvent, Category, EventItem, EventState, Item, Preferences } from "./types";

const STORAGE_KEY = "vibe.demo.v1";
const MAX_LOG = 200;

interface State {
  prefs: Preferences | null;
  saves: string[];
  hidden: string[];
  submissions: EventItem[];
  log: AnalyticsEvent[];
  anonId: string;
}

const SERVER_STATE: State = { prefs: null, saves: [], hidden: [], submissions: [], log: [], anonId: "" };

let state: State = SERVER_STATE;
let loaded = false;
let catalog: Item[] | null = null;
let sessionId = "";
let lastImpressionId = "";
const listeners = new Set<() => void>();

const newId = (prefix: string): string => `${prefix}_${crypto.randomUUID().replaceAll("-", "").slice(0, 12)}`;

function freshState(): State {
  return { ...SERVER_STATE, anonId: newId("anon") };
}

function load(): State {
  if (loaded) return state;
  loaded = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<State>) : {};
    state = {
      ...freshState(),
      ...parsed,
      saves: Array.isArray(parsed.saves) ? parsed.saves : [],
      hidden: Array.isArray(parsed.hidden) ? parsed.hidden : [],
      submissions: Array.isArray(parsed.submissions) ? parsed.submissions : [],
      log: Array.isArray(parsed.log) ? parsed.log : [],
    };
  } catch (error) {
    console.warn("Vibe demo data could not be read; starting fresh.", error);
    state = freshState();
  }
  return state;
}

function set(update: (s: State) => State): void {
  state = update(load());
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Vibe demo data could not be saved.", error);
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    loaded = false;
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Store snapshot. `ready` is false during server render and hydration. */
export function useVibe(): State & { ready: boolean } {
  const snapshot = useSyncExternalStore(subscribe, load, () => SERVER_STATE);
  return { ...snapshot, ready: snapshot !== SERVER_STATE };
}

/** Fixtures plus partner submissions. Empty until the store is ready, so server and client markup agree. */
export function useCatalog(): Item[] {
  const { ready, submissions } = useVibe();
  return useMemo(() => {
    if (!ready) return [];
    catalog ??= buildCatalog(new Date());
    return [...catalog, ...submissions];
  }, [ready, submissions]);
}

// ---------- analytics ----------

function track(name: AnalyticsEvent["name"], properties: AnalyticsEvent["properties"]): void {
  const { prefs, anonId } = load();
  // Consent withdrawal stops optional analytics (blueprint §13 "Privacy").
  if (!prefs?.analyticsConsent) return;
  sessionId ||= newId("ses");
  const event: AnalyticsEvent = {
    event_id: newId("evt"),
    name,
    occurred_at: new Date().toISOString(),
    anonymous_or_user_id: anonId,
    session_id: sessionId,
    city_id: prefs.cityId,
    properties,
    consent_basis: "product_analytics_v1",
  };
  set((s) => ({ ...s, log: [event, ...s.log].slice(0, MAX_LOG) }));
}

// ---------- partner submissions ----------

export const submissionSchema = z.object({
  title: z.string().trim().min(4, "Give the event a title of at least 4 characters.").max(80, "Keep the title under 80 characters."),
  category: z.enum(CATEGORY_IDS as [Category, ...Category[]], "Choose a category."),
  neighborhoodId: z.string().min(1, "Choose the sector where it happens."),
  venueName: z.string().trim().min(2, "Add the venue name.").max(60, "Keep the venue name under 60 characters."),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date."),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Choose a start time."),
  durationHours: z.coerce.number().min(0.5, "Events run at least 30 minutes.").max(12, "Events can run up to 12 hours."),
  capacity: z.coerce.number().int("Use a whole number.").min(1, "Capacity must be at least 1.").max(5000, "Capacity can be at most 5,000."),
  priceRupees: z.coerce.number().int("Use whole rupees.").min(0, "Price can't be negative.").max(100_000, "Price can be at most 100,000."),
  description: z.string().trim().min(20, "Describe the event in at least 20 characters.").max(600, "Keep the description under 600 characters."),
});

export type SubmissionInput = z.input<typeof submissionSchema>;
export type FieldErrors = Partial<Record<keyof SubmissionInput, string>>;

type Actor = "partner" | "editor";

/** Allowed event transitions per actor (blueprint §6). Anything else is rejected. */
const TRANSITIONS: Record<Actor, Partial<Record<EventState, EventState[]>>> = {
  partner: { draft: ["submitted"] },
  editor: { submitted: ["approved", "rejected"], approved: ["published", "suspended"] },
};

export function canTransition(actor: Actor, from: EventState, to: EventState): boolean {
  return TRANSITIONS[actor][from]?.includes(to) ?? false;
}

// ---------- actions ----------

export const vibe = {
  setPrefs(prefs: Preferences): void {
    set((s) => ({ ...s, prefs }));
  },

  toggleSave(id: string, context: { requestId?: string; position?: number } = {}): void {
    const saving = !load().saves.includes(id);
    set((s) => ({ ...s, saves: saving ? [id, ...s.saves] : s.saves.filter((x) => x !== id) }));
    if (saving) track("recommendation_saved", { entity_id: id, request_id: context.requestId ?? "direct", position: context.position ?? -1 });
  },

  hide(id: string, context: { requestId: string; position: number }): void {
    set((s) => ({ ...s, hidden: [...new Set([...s.hidden, id])] }));
    track("recommendation_hidden", { entity_id: id, request_id: context.requestId, position: context.position });
  },

  unhide(id: string): void {
    set((s) => ({ ...s, hidden: s.hidden.filter((x) => x !== id) }));
  },

  logImpression(requestId: string, entityIds: string[]): void {
    // One impression per distinct result set, even if the feed re-renders.
    if (requestId === lastImpressionId) return;
    lastImpressionId = requestId;
    track("recommendation_impression", { request_id: requestId, count: entityIds.length, top_ids: entityIds.slice(0, 5).join(",") });
  },

  /** Validates and stores a partner draft; optionally submits it for review in the same step. */
  saveSubmission(input: SubmissionInput, submit: boolean): { ok: true; id: string } | { ok: false; errors: FieldErrors } {
    const parsed = submissionSchema.safeParse(input);
    if (!parsed.success) {
      const errors: FieldErrors = {};
      for (const issue of parsed.error.issues) errors[issue.path[0] as keyof SubmissionInput] ??= issue.message;
      return { ok: false, errors };
    }
    const d = parsed.data;
    const city = ISLAMABAD;
    const [y, m, day] = d.date.split("-").map(Number);
    const [hh, mm] = d.startTime.split(":").map(Number);
    const startsAt = zonedDate(new Date(Date.UTC(y, m - 1, day, 12)), 0, hh, mm, city.timezone);
    const now = new Date();
    if (startsAt <= now) return { ok: false, errors: { date: "Choose a date and time in the future." } };

    const n = neighborhood(city, d.neighborhoodId);
    const event: EventItem = {
      id: newId("evt"),
      type: "event",
      cityId: city.id,
      organizationId: DEMO_ORG.id,
      organization: DEMO_ORG.name,
      title: d.title,
      category: d.category,
      neighborhoodId: n.id,
      lat: n.lat,
      lng: n.lng,
      venueName: d.venueName,
      priceMinor: d.priceRupees * 100,
      blurb: d.description.split(/(?<=[.!?])\s/)[0].slice(0, 120),
      description: d.description,
      quality: 0.8,
      verifiedAt: now.toISOString(),
      state: submit ? "submitted" : "draft",
      submittedAt: submit ? now.toISOString() : undefined,
      session: {
        startsAt: startsAt.toISOString(),
        endsAt: new Date(startsAt.getTime() + d.durationHours * 3_600_000).toISOString(),
        capacity: d.capacity,
        remaining: d.capacity,
      },
    };
    set((s) => ({ ...s, submissions: [event, ...s.submissions] }));
    return { ok: true, id: event.id };
  },

  transition(actor: Actor, id: string, to: EventState, reason?: string): boolean {
    const event = load().submissions.find((e) => e.id === id);
    if (!event || !canTransition(actor, event.state, to)) return false;
    const now = new Date().toISOString();
    set((s) => ({
      ...s,
      submissions: s.submissions.map((e) =>
        e.id !== id
          ? e
          : {
              ...e,
              state: to,
              submittedAt: to === "submitted" ? now : e.submittedAt,
              // Publishing is the city team's verification of the listing.
              verifiedAt: to === "published" ? now : e.verifiedAt,
              decisionReason: reason,
            },
      ),
    }));
    return true;
  },

  reset(): void {
    catalog = null;
    set(() => freshState());
  },
};
