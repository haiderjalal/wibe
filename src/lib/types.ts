/**
 * Domain types mirroring the Vibe developer blueprint (docs/Vibe_Developer_Blueprint.md §5).
 * Money is stored as integer minor units plus the city's ISO currency; timestamps are UTC ISO strings.
 */

export type Category =
  | "desi"
  | "cafe"
  | "fine_dining"
  | "street_food"
  | "live_music"
  | "outdoors"
  | "sports"
  | "arts"
  | "comedy"
  | "workshops"
  | "social";

/** Event lifecycle from blueprint §6 (ended/archived are out of scope for the prototype). */
export type EventState = "draft" | "submitted" | "approved" | "published" | "rejected" | "suspended";

export type Intent = "now" | "tonight" | "weekend" | "anytime";

export interface Neighborhood {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface City {
  id: string;
  name: string;
  countryCode: string;
  timezone: string;
  locale: string;
  currency: string;
  state: "live" | "soon";
  neighborhoods: Neighborhood[];
}

/** Local wall-clock opening hours. `closes` earlier than `opens` means the venue closes after midnight. */
export interface Hours {
  weekday: number;
  opens: string;
  closes: string;
}

interface BaseItem {
  id: string;
  cityId: string;
  title: string;
  category: Category;
  neighborhoodId: string;
  lat: number;
  lng: number;
  /** Typical spend or ticket price per person, in minor units. 0 means free. */
  priceMinor: number;
  blurb: string;
  description: string;
  organization: string;
  verifiedAt: string;
  /** 0..1 quality and reliability evidence. */
  quality: number;
}

export interface Venue extends BaseItem {
  type: "venue";
  hours: Hours[];
}

export interface EventSession {
  startsAt: string;
  endsAt: string;
  capacity: number;
  remaining: number;
}

export interface EventItem extends BaseItem {
  type: "event";
  organizationId: string;
  state: EventState;
  session: EventSession;
  venueName?: string;
  submittedAt?: string;
  decisionReason?: string;
}

export type Item = Venue | EventItem;

export interface Preferences {
  cityId: string;
  neighborhoodId: string;
  interests: Category[];
  budgetMinor: number;
  maxDistanceKm: number;
  analyticsConsent: boolean;
}

export type ReasonCode =
  | "INTEREST_MATCH"
  | "OPEN_AT_REQUESTED_TIME"
  | "STARTS_IN_WINDOW"
  | "NEARBY"
  | "WITHIN_BUDGET"
  | "LIKE_YOUR_SAVES"
  | "RECENTLY_VERIFIED"
  | "HIGHLY_RATED";

export interface Recommendation {
  item: Item;
  score: number;
  reasons: ReasonCode[];
  distanceMeters: number;
}

/** Product analytics envelope from blueprint §11. */
export interface AnalyticsEvent {
  event_id: string;
  name: "recommendation_impression" | "recommendation_saved" | "recommendation_hidden";
  occurred_at: string;
  anonymous_or_user_id: string;
  session_id: string;
  city_id: string;
  properties: Record<string, string | number>;
  consent_basis: "product_analytics_v1";
}
