# Wibe — pilot web app (PWA)

Islamabad-first discovery app: members set preferences and get place and event picks that explain themselves; partners submit events; a city editor reviews and publishes them. The product and engineering plans live in [`docs/`](docs/).

This build implements the blueprint's **first vertical slice** (§16) as a front-end prototype:

1. A member chooses Islamabad and sets interests, sector, distance, budget and analytics consent (`/onboarding`).
2. Discovery ranks fictional listings with the deterministic engine from blueprint §9 — hard filters, weighted score, category diversity, and 2–3 plain-language reasons per pick (`/discover`). Members can save picks or hide them with “Not for me” (undo is available).
3. A partner drafts an event with one session and submits it (`/partner`).
4. A city editor approves, then publishes or rejects it (`/console`). The published event shows up in members' picks.
5. Consented impressions, saves and hides are logged using the blueprint §11 event envelope and shown in the console.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # engine acceptance checks (node:test)
npm run typecheck
npm run lint
npm run build
```

The service worker only registers in production builds (`npm run build && npm start`).

## Stack

Next.js 16 (App Router, React Compiler) · TypeScript strict · Tailwind CSS v4 · Motion (scroll/layout animation) · Lenis (smooth scroll) · React Three Fiber + drei (3D hero) · Zod (submission validation) · lucide-react.

## Where things live

```
src/app/                 routes: landing, (app)/discover|saved|partner|console|onboarding, manifest, offline
src/components/landing/  marketing page sections; CityScene.tsx is the 3D Islamabad sector grid
src/components/app/      member, partner and console UI
src/lib/engine.ts        time windows, distance, ranking, reason codes (pure; tested in engine.test.mjs)
src/lib/data.ts          fictional Islamabad fixtures (city config, venues, events)
src/lib/store.ts         localStorage-backed store standing in for the /v1 API; event state machine
src/lib/format.ts        money, time and reason formatting at the display boundary
public/sw.js             offline caching
```

## Not built yet (by design)

- **No backend.** Everything is stored in the browser. `src/lib/store.ts` is the seam where `/v1` API calls go. The partner/editor role checks there are a demo of the policy, **not authorization**.
- No authentication, payments, tickets, check-in, ledger, moderation cases or notifications. The docs schedule these for the transaction pilot, and the "Get tickets" button stays disabled until then.
- Pricing on the landing page shows the plan's pilot **test** prices.
- All listings and organizations are fictional.
