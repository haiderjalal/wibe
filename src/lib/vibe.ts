/**
 * Vibe interview: questions and a deterministic scorer.
 *
 * Tags come only from what the member explicitly picks. Nothing is inferred about identity, orientation,
 * health or personality traits beyond the member's own answers (blueprint §5: no hidden psychological scores).
 * Runtime-import free so `node --test` can load it (see vibe.test.mjs).
 */
import type { Category } from "./types";

export type QuestionKind = "single" | "pair" | "multi";

export interface Option {
  id: string;
  label: string;
  hint?: string;
  /** Photo key from media.ts, used by "pair" questions. */
  photo?: string;
}

export interface Question {
  id: string;
  kind: QuestionKind;
  prompt: string;
  sub?: string;
  options: Option[];
  /** Multi-select limits. */
  min?: number;
  max?: number;
}

export const QUESTIONS: Question[] = [
  {
    id: "energy",
    kind: "single",
    prompt: "Friday night. What's the energy?",
    options: [
      { id: "cozy", label: "Cozy and low-key", hint: "A good table, good company" },
      { id: "balanced", label: "Somewhere in between", hint: "Start calm, see where it goes" },
      { id: "late", label: "Loud and late", hint: "Home when the chai stalls close" },
    ],
  },
  {
    id: "pair_sip",
    kind: "pair",
    prompt: "Pick one.",
    options: [
      { id: "chai", label: "Chai and a long talk", photo: "chai-pour" },
      { id: "live", label: "Front row at a live set", photo: "tabla" },
    ],
  },
  {
    id: "pair_time",
    kind: "pair",
    prompt: "And now?",
    options: [
      { id: "sunrise", label: "Sunrise on the trail", photo: "trail-run" },
      { id: "night", label: "Night ride through the city", photo: "cycling" },
    ],
  },
  {
    id: "pair_food",
    kind: "pair",
    prompt: "Dinner plans.",
    options: [
      { id: "supper", label: "A long supper table", photo: "table-candles" },
      { id: "street", label: "Street-food crawl", photo: "grill-market" },
    ],
  },
  {
    id: "pair_make",
    kind: "pair",
    prompt: "Last one of these.",
    options: [
      { id: "workshop", label: "Make something with your hands", photo: "pottery" },
      { id: "games", label: "Game night with strangers", photo: "boardgame" },
    ],
  },
  {
    id: "social",
    kind: "single",
    prompt: "You're happiest…",
    options: [
      { id: "small", label: "In a small group", hint: "Four people, one table, deep talk" },
      { id: "crowd", label: "In a buzzing crowd", hint: "New faces all night" },
      { id: "solo", label: "Solo with a plan", hint: "Go alone, maybe leave with company" },
    ],
  },
  {
    id: "intents",
    kind: "multi",
    prompt: "Who do you want to meet?",
    sub: "Pick up to three.",
    min: 1,
    max: 3,
    options: [
      { id: "friends", label: "New friends" },
      { id: "activity", label: "Activity partners" },
      { id: "networking", label: "Professional networking" },
      { id: "exploring", label: "Just exploring the city" },
    ],
  },
  {
    id: "topics",
    kind: "multi",
    prompt: "What gets you talking?",
    sub: "Pick up to three.",
    min: 1,
    max: 3,
    options: [
      { id: "food", label: "Food" },
      { id: "music", label: "Music" },
      { id: "tech", label: "Tech and startups" },
      { id: "books", label: "Books and poetry" },
      { id: "sports", label: "Sports" },
      { id: "art", label: "Art and design" },
      { id: "travel", label: "Travel" },
    ],
  },
  {
    id: "avoid",
    kind: "multi",
    prompt: "Anything you'd rather skip?",
    sub: "Optional. We'll show less of it.",
    min: 0,
    max: 4,
    options: [
      { id: "loud", label: "Loud venues" },
      { id: "crowds", label: "Big crowds" },
      { id: "late", label: "Late nights" },
      { id: "early", label: "Early mornings" },
      { id: "far", label: "Long drives" },
    ],
  },
];

export type Answers = Record<string, string[]>;

export type ArchetypeId = "night_owl" | "slow_sipper" | "trailblazer" | "culture_seeker" | "connector" | "social_butterfly";

export interface Archetype {
  id: ArchetypeId;
  name: string;
  line: string;
  /** Gradient stops for the profile ring. */
  colors: [string, string, string];
}

export const ARCHETYPES: Record<ArchetypeId, Archetype> = {
  night_owl: { id: "night_owl", name: "Night Owl", line: "You come alive after eight. Live sets, late rides, one more round.", colors: ["#8c7bff", "#ff6f7d", "#ffb547"] },
  slow_sipper: { id: "slow_sipper", name: "Slow Sipper", line: "Good chai, a quiet corner and a conversation that runs long.", colors: ["#ffb547", "#e8a36b", "#f5f3ff"] },
  trailblazer: { id: "trailblazer", name: "Trailblazer", line: "First light, fresh air, and a plan that starts before breakfast.", colors: ["#43e0b0", "#3fb6ff", "#f5f3ff"] },
  culture_seeker: { id: "culture_seeker", name: "Culture Seeker", line: "Studios, stages and anything you can make, learn or feel.", colors: ["#ff6f7d", "#c77dff", "#ffb547"] },
  connector: { id: "connector", name: "Connector", line: "Every table is a chance to meet someone worth knowing.", colors: ["#3fb6ff", "#8c7bff", "#43e0b0"] },
  social_butterfly: { id: "social_butterfly", name: "Social Butterfly", line: "More people, more stories. You make strangers feel like regulars.", colors: ["#ffb547", "#ff6f7d", "#43e0b0"] },
};

/** Tie-break order when scores are equal. */
const ARCHETYPE_ORDER: ArchetypeId[] = ["connector", "night_owl", "trailblazer", "culture_seeker", "slow_sipper", "social_butterfly"];

/** Points each answer adds to each archetype. */
const WEIGHTS: Record<string, Partial<Record<ArchetypeId, number>>> = {
  "energy:cozy": { slow_sipper: 2 },
  "energy:balanced": { social_butterfly: 1, culture_seeker: 1 },
  "energy:late": { night_owl: 2 },
  "pair_sip:chai": { slow_sipper: 2 },
  "pair_sip:live": { night_owl: 1, culture_seeker: 1 },
  "pair_time:sunrise": { trailblazer: 3 },
  "pair_time:night": { night_owl: 2 },
  "pair_food:supper": { slow_sipper: 1, connector: 1 },
  "pair_food:street": { social_butterfly: 1, night_owl: 1 },
  "pair_make:workshop": { culture_seeker: 2 },
  "pair_make:games": { social_butterfly: 2 },
  "social:small": { slow_sipper: 1, connector: 1 },
  "social:crowd": { social_butterfly: 2 },
  "social:solo": { trailblazer: 1, culture_seeker: 1 },
  "intents:friends": { social_butterfly: 1 },
  "intents:activity": { trailblazer: 1 },
  "intents:networking": { connector: 5 },
  "intents:exploring": { culture_seeker: 1 },
  "topics:tech": { connector: 1 },
  "topics:books": { slow_sipper: 1 },
  "topics:sports": { trailblazer: 1 },
  "topics:art": { culture_seeker: 1 },
  "topics:music": { night_owl: 1 },
};

/** Explicit answer -> visible profile tag. */
const TAG_FOR: Record<string, string> = {
  "energy:cozy": "Low-key",
  "energy:late": "Late nights",
  "pair_sip:chai": "Chai person",
  "pair_sip:live": "Live music",
  "pair_time:sunrise": "Early riser",
  "pair_time:night": "Night rider",
  "pair_food:supper": "Supper clubs",
  "pair_food:street": "Street-food scout",
  "pair_make:workshop": "Maker",
  "pair_make:games": "Game nights",
  "social:small": "Small groups",
  "social:crowd": "Big crowds",
  "social:solo": "Solo explorer",
  "intents:friends": "New friends",
  "intents:activity": "Activity partner",
  "intents:networking": "Networking",
  "intents:exploring": "City explorer",
  "topics:tech": "Tech & startups",
  "topics:books": "Books & poetry",
  "topics:art": "Art & design",
};

/** Answers that seed discovery interests. */
const INTEREST_FOR: Record<string, Category[]> = {
  "pair_sip:chai": ["cafe"],
  "pair_sip:live": ["live_music"],
  "pair_time:sunrise": ["outdoors"],
  "pair_time:night": ["outdoors"],
  "pair_food:supper": ["fine_dining", "desi"],
  "pair_food:street": ["street_food", "desi"],
  "pair_make:workshop": ["workshops", "arts"],
  "pair_make:games": ["social"],
  "intents:friends": ["social"],
  "intents:activity": ["sports"],
  "topics:sports": ["sports"],
  "topics:art": ["arts"],
  "topics:music": ["live_music"],
  "topics:food": ["desi"],
};

export const MAX_TAGS = 6;

export interface VibeResult {
  archetype: ArchetypeId;
  tags: string[];
  intents: string[];
  interests: Category[];
  avoid: string[];
}

/** Checks answers against the question set; returns an error message or null. */
export function validateAnswers(answers: Answers): string | null {
  for (const q of QUESTIONS) {
    const picked = answers[q.id] ?? [];
    const allowed = new Set(q.options.map((o) => o.id));
    if (picked.some((p) => !allowed.has(p))) return `Unknown answer for ${q.id}.`;
    if (new Set(picked).size !== picked.length) return `Duplicate answer for ${q.id}.`;
    if (q.kind === "multi") {
      if (picked.length < (q.min ?? 0) || picked.length > (q.max ?? q.options.length)) return `Pick between ${q.min ?? 0} and ${q.max} for ${q.id}.`;
    } else if (picked.length !== 1) {
      return `Pick one answer for ${q.id}.`;
    }
  }
  const unknown = Object.keys(answers).filter((k) => !QUESTIONS.some((q) => q.id === k));
  return unknown.length ? `Unknown question ${unknown[0]}.` : null;
}

export function scoreVibe(answers: Answers): VibeResult {
  const scores = new Map<ArchetypeId, number>(ARCHETYPE_ORDER.map((a) => [a, 0]));
  const tags: string[] = [];
  const interests = new Set<Category>();

  for (const q of QUESTIONS) {
    for (const pick of answers[q.id] ?? []) {
      const key = `${q.id}:${pick}`;
      for (const [a, pts] of Object.entries(WEIGHTS[key] ?? {})) scores.set(a as ArchetypeId, (scores.get(a as ArchetypeId) ?? 0) + (pts ?? 0));
      if (TAG_FOR[key]) tags.push(TAG_FOR[key]);
      for (const c of INTEREST_FOR[key] ?? []) interests.add(c);
    }
  }

  const archetype = ARCHETYPE_ORDER.reduce((best, a) => ((scores.get(a) ?? 0) > (scores.get(best) ?? 0) ? a : best), ARCHETYPE_ORDER[0]);
  // Who they want to meet is the most useful signal for others, so intent tags lead.
  const intentTags = tags.filter((t) => ["New friends", "Activity partner", "Networking", "City explorer"].includes(t));
  const ordered = [...intentTags, ...tags.filter((t) => !intentTags.includes(t))];

  return {
    archetype,
    tags: ordered.slice(0, MAX_TAGS),
    intents: answers.intents ?? [],
    interests: [...interests],
    avoid: answers.avoid ?? [],
  };
}
