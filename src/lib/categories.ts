import {
  Coffee,
  Dumbbell,
  Mic,
  Mountain,
  Music,
  Palette,
  PenTool,
  Sandwich,
  Users,
  UtensilsCrossed,
  Wine,
  type LucideIcon,
} from "lucide-react";

import type { Category } from "./types";

interface CategoryMeta {
  label: string;
  /** Lowercase phrase used inside sentences, e.g. "Matches your love of live music". */
  phrase: string;
  group: "Eat & drink" | "Things to do";
  icon: LucideIcon;
  /** Two HSL hues for generative covers. */
  hues: [number, number];
}

export const CATEGORIES: Record<Category, CategoryMeta> = {
  desi: { label: "Desi food", phrase: "desi food", group: "Eat & drink", icon: UtensilsCrossed, hues: [28, 350] },
  cafe: { label: "Cafés", phrase: "cafés", group: "Eat & drink", icon: Coffee, hues: [36, 12] },
  fine_dining: { label: "Fine dining", phrase: "fine dining", group: "Eat & drink", icon: Wine, hues: [340, 275] },
  street_food: { label: "Street food", phrase: "street food", group: "Eat & drink", icon: Sandwich, hues: [44, 8] },
  live_music: { label: "Live music", phrase: "live music", group: "Things to do", icon: Music, hues: [262, 318] },
  outdoors: { label: "Outdoors", phrase: "the outdoors", group: "Things to do", icon: Mountain, hues: [158, 205] },
  sports: { label: "Sports", phrase: "sports", group: "Things to do", icon: Dumbbell, hues: [192, 140] },
  arts: { label: "Arts & culture", phrase: "arts and culture", group: "Things to do", icon: Palette, hues: [296, 24] },
  comedy: { label: "Comedy", phrase: "comedy", group: "Things to do", icon: Mic, hues: [48, 330] },
  workshops: { label: "Workshops", phrase: "workshops", group: "Things to do", icon: PenTool, hues: [18, 282] },
  social: { label: "Meetups", phrase: "meeting new people", group: "Things to do", icon: Users, hues: [172, 256] },
};

export const CATEGORY_IDS = Object.keys(CATEGORIES) as Category[];
