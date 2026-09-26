"use client";

import { useState } from "react";
import { Ban, CircleCheck, CircleX, Inbox, RotateCcw, Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { StateTrack, stateLabel } from "@/components/app/StateTrack";
import { Toast, type ToastMessage } from "@/components/app/Toast";
import { CATEGORIES } from "@/lib/categories";
import { ISLAMABAD, neighborhood } from "@/lib/data";
import { formatDay, formatMoney, formatTime } from "@/lib/format";
import { useCatalog, useWibe, wibe } from "@/lib/store";
import type { EventItem, EventState } from "@/lib/types";

const REJECT_REASONS = ["Missing or unclear details", "Date or time looks wrong", "Venue couldn't be confirmed", "Not suitable for Wibe"];
const STALE_AFTER_DAYS = 30;
const EASE = [0.22, 1, 0.36, 1] as const;

function ReviewCard({ event, now, onDecide }: { event: EventItem; now: Date; onDecide: (to: EventState, reason?: string) => void }) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState(REJECT_REASONS[0]);
  const start = new Date(event.session.startsAt);

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 80, transition: { duration: 0.35 } }}
      transition={{ duration: 0.45, ease: EASE }}
      className="space-y-4 rounded-[1.6rem] border border-line bg-ridge/60 p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow !text-[0.6rem]">
            {CATEGORIES[event.category].label} · {neighborhood(ISLAMABAD, event.neighborhoodId).name} · {event.organization}
          </p>
          <h3 className="mt-1 text-xl font-semibold">{event.title}</h3>
        </div>
        <span className="rounded-full border border-sodium/50 px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-sodium">{stateLabel(event.state)}</span>
      </div>
      <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        {[
          ["When", `${formatDay(start, ISLAMABAD, now)}, ${formatTime(start, ISLAMABAD)}`],
          ["Venue", event.venueName ?? "—"],
          ["Capacity", String(event.session.capacity)],
          ["Price", formatMoney(event.priceMinor, ISLAMABAD)],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl bg-ink-2 px-3 py-2">
            <dt className="text-xs text-haze">{k}</dt>
            <dd className="truncate font-medium">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="text-sm leading-relaxed text-haze">{event.description}</p>

      <AnimatePresence mode="wait" initial={false}>
        {rejecting ? (
          <motion.div key="reject" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Reason the partner will see</span>
              <select className="field" value={reason} onChange={(e) => setReason(e.target.value)}>
                {REJECT_REASONS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </label>
            <div className="mt-3 flex gap-2">
              <button type="button" className="btn btn-ghost !py-2 text-sm" onClick={() => setRejecting(false)}>
                Cancel
              </button>
              <button type="button" className="btn !bg-dusk !py-2 text-sm text-ink" onClick={() => onDecide("rejected", reason)}>
                <CircleX className="size-4" aria-hidden /> Reject listing
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-wrap gap-2">
            {event.state === "submitted" ? (
              <>
                <button type="button" className="btn btn-primary !py-2 text-sm" onClick={() => onDecide("approved")}>
                  <CircleCheck className="size-4" aria-hidden /> Approve
                </button>
                <button type="button" className="btn btn-ghost !py-2 text-sm" onClick={() => setRejecting(true)}>
                  Reject…
                </button>
              </>
            ) : (
              <>
                <button type="button" className="btn btn-primary !py-2 text-sm" onClick={() => onDecide("published")}>
                  <Send className="size-4" aria-hidden /> Publish
                </button>
                <button type="button" className="btn btn-ghost !py-2 text-sm" onClick={() => onDecide("suspended", "Suspended before publishing")}>
                  <Ban className="size-4" aria-hidden /> Suspend
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

export function CityConsole() {
  const { ready, submissions, log, prefs } = useWibe();
  const catalog = useCatalog();
  const [now] = useState(() => new Date());
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!ready) return <div className="h-[70vh] animate-pulse rounded-[2rem] bg-ridge/40" aria-busy="true" />;

  // City scope: only listings in this editor's city.
  const cityItems = catalog.filter((i) => i.cityId === ISLAMABAD.id);
  const queue = submissions.filter((e) => e.cityId === ISLAMABAD.id && (e.state === "submitted" || e.state === "approved"));
  const decided = submissions.filter((e) => e.state === "published" || e.state === "rejected" || e.state === "suspended");
  const live = cityItems.filter((i) => i.type === "venue" || i.state === "published").length;
  const stale = cityItems.filter((i) => (now.getTime() - Date.parse(i.verifiedAt)) / 86_400_000 > STALE_AFTER_DAYS).length;

  const decide = (event: EventItem, to: EventState, reason?: string) => {
    if (!wibe.transition("editor", event.id, to, reason)) return;
    const verb = { approved: "Approved", published: "Published", rejected: "Rejected", suspended: "Suspended" }[to as string] ?? "Updated";
    setToast({ id: `${event.id}-${to}`, text: `${verb} ${event.title}.` });
  };

  return (
    <>
      <header className="mb-10">
        <p className="eyebrow">City console · city editor</p>
        <h1 className="mt-3 font-display text-[clamp(2.2rem,6vw,3.6rem)] font-extrabold leading-none" style={{ fontVariationSettings: '"wdth" 108' }}>
          {ISLAMABAD.name}
        </h1>
        <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Awaiting review", queue.length, "text-sodium"],
            ["Live listings", live, "text-pine"],
            ["Stale (30+ days)", stale, stale ? "text-dusk" : "text-jasmine"],
            ["Analytics events", log.length, "text-violet"],
          ].map(([label, n, tone]) => (
            <div key={label as string} className="rounded-2xl border border-line bg-ridge/50 px-5 py-4">
              <dt className="text-xs text-haze">{label}</dt>
              <dd className={`font-display text-3xl font-bold ${tone}`}>{n}</dd>
            </div>
          ))}
        </dl>
      </header>

      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <section aria-labelledby="queue-title">
          <h2 id="queue-title" className="mb-4 text-xl font-semibold">
            Review queue
          </h2>
          {queue.length === 0 ? (
            <div className="sector-grid rounded-[1.6rem] border border-dashed border-line p-10 text-center">
              <Inbox className="mx-auto size-8 text-haze" aria-hidden />
              <p className="mt-4 font-semibold">Queue is clear</p>
              <p className="mt-1 text-sm text-haze">New partner submissions for {ISLAMABAD.name} will appear here.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              <AnimatePresence mode="popLayout">
                {queue.map((e) => (
                  <ReviewCard key={e.id} event={e} now={now} onDecide={(to, reason) => decide(e, to, reason)} />
                ))}
              </AnimatePresence>
            </ul>
          )}

          {decided.length > 0 && (
            <>
              <h2 className="mb-4 mt-10 text-xl font-semibold">Decisions</h2>
              <ul className="space-y-3">
                {decided.map((e) => (
                  <li key={e.id} className="space-y-2 rounded-2xl border border-line bg-ridge/40 px-5 py-4">
                    <p className="font-medium">{e.title}</p>
                    <StateTrack state={e.state} />
                    {e.decisionReason && <p className="text-xs text-haze">{e.decisionReason}</p>}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <section aria-labelledby="log-title">
          <h2 id="log-title" className="mb-1 text-xl font-semibold">
            Recommendation events
          </h2>
          <p className="mb-4 text-sm text-haze">
            {prefs?.analyticsConsent
              ? "Consented impressions, saves and hides from this device."
              : "Analytics consent is off on this device, so nothing new is recorded."}
          </p>
          <div className="max-h-[520px] overflow-auto rounded-[1.4rem] border border-line">
            {log.length === 0 ? (
              <p className="p-6 text-sm text-haze">No events yet. Turn on “Help improve Wibe” in your preferences, then browse picks.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-ink-2 text-xs text-haze">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-medium">Event</th>
                    <th scope="col" className="px-4 py-3 font-medium">Detail</th>
                    <th scope="col" className="px-4 py-3 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {log.map((e) => (
                    <tr key={e.event_id}>
                      <td className="px-4 py-3 font-mono text-xs">{e.name.replace("recommendation_", "")}</td>
                      <td className="max-w-40 truncate px-4 py-3 text-xs text-haze">
                        {"entity_id" in e.properties ? `${e.properties.entity_id} @${e.properties.position}` : `${e.properties.count} picks`}
                      </td>
                      <td className="px-4 py-3 text-xs text-haze">{formatTime(new Date(e.occurred_at), ISLAMABAD)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="mt-8 rounded-[1.4rem] border border-line p-5">
            <p className="font-semibold">Demo data</p>
            <p className="mt-1 text-sm text-haze">Clears preferences, saves, submissions and events stored in this browser.</p>
            <button
              type="button"
              onClick={() => {
                if (!confirmReset) return setConfirmReset(true);
                wibe.reset();
                setConfirmReset(false);
                setToast({ id: `reset-${Date.now()}`, text: "Demo data cleared." });
              }}
              onBlur={() => setConfirmReset(false)}
              className={`btn mt-4 !py-2 text-sm ${confirmReset ? "!bg-dusk text-ink" : "btn-ghost"}`}
            >
              <RotateCcw className="size-4" aria-hidden /> {confirmReset ? "Tap again to clear" : "Reset demo data"}
            </button>
          </div>
        </section>
      </div>
      <Toast message={toast} onDismiss={() => setToast(null)} />
    </>
  );
}
