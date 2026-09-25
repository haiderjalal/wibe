"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarPlus, Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { StateTrack } from "@/components/app/StateTrack";
import { Toast, type ToastMessage } from "@/components/app/Toast";
import { CATEGORIES, CATEGORY_IDS } from "@/lib/categories";
import { DEMO_ORG, ISLAMABAD, neighborhood } from "@/lib/data";
import { formatDay, formatMoney, formatTime } from "@/lib/format";
import { useCatalog, useVibe, vibe, type FieldErrors, type SubmissionInput } from "@/lib/store";
import type { EventItem } from "@/lib/types";

const EMPTY_FORM: SubmissionInput = {
  title: "",
  category: "live_music",
  neighborhoodId: "f7",
  venueName: "",
  date: "",
  startTime: "20:00",
  durationHours: 2,
  capacity: 50,
  priceRupees: 1000,
  description: "",
};

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      <AnimatePresence initial={false}>
        {error ? (
          <motion.span initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-1.5 block text-xs text-dusk">
            {error}
          </motion.span>
        ) : (
          hint && <span className="mt-1.5 block text-xs text-haze">{hint}</span>
        )}
      </AnimatePresence>
    </label>
  );
}

export function PartnerPortal() {
  const { ready, submissions } = useVibe();
  const catalog = useCatalog();
  const [form, setForm] = useState<SubmissionInput>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [now] = useState(() => new Date());

  if (!ready) return <div className="h-[70vh] animate-pulse rounded-[2rem] bg-ridge/40" aria-busy="true" />;

  // Partner scope: only this organization's listings (fixtures plus its own submissions).
  const liveFixtures = catalog.filter((i): i is EventItem => i.type === "event" && i.organizationId === DEMO_ORG.id && !submissions.includes(i));
  const events = [...submissions.filter((e) => e.organizationId === DEMO_ORG.id), ...liveFixtures];
  const counts = {
    drafts: events.filter((e) => e.state === "draft").length,
    review: events.filter((e) => e.state === "submitted" || e.state === "approved").length,
    live: events.filter((e) => e.state === "published").length,
  };

  const set = <K extends keyof SubmissionInput>(key: K, value: SubmissionInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const save = (submit: boolean) => {
    const result = vibe.saveSubmission(form, submit);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setForm(EMPTY_FORM);
    setErrors({});
    setToast({ id: result.id, text: submit ? "Submitted for review." : "Draft saved." });
  };

  const submitDraft = (e: EventItem) => {
    if (vibe.transition("partner", e.id, "submitted")) setToast({ id: `${e.id}-sub`, text: `${e.title} submitted for review.` });
  };

  const today = new Intl.DateTimeFormat("en-CA", { timeZone: ISLAMABAD.timezone }).format(now);

  return (
    <>
      <header className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Partner portal · organizer</p>
          <h1 className="mt-3 font-display text-[clamp(2.2rem,6vw,3.6rem)] font-extrabold leading-none" style={{ fontVariationSettings: '"wdth" 108' }}>
            {DEMO_ORG.name}
          </h1>
        </div>
        <dl className="flex gap-3">
          {[
            ["Drafts", counts.drafts],
            ["In review", counts.review],
            ["Live", counts.live],
          ].map(([label, n]) => (
            <div key={label} className="min-w-24 rounded-2xl border border-line bg-ridge/50 px-4 py-3">
              <dt className="text-xs text-haze">{label}</dt>
              <dd className="font-display text-2xl font-bold">{n}</dd>
            </div>
          ))}
        </dl>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr]">
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            save(true);
          }}
          className="space-y-5 rounded-[1.8rem] border border-line bg-ridge/50 p-6 md:p-8"
          aria-labelledby="new-event-title"
        >
          <h2 id="new-event-title" className="flex items-center gap-2 text-xl font-semibold">
            <CalendarPlus className="size-5 text-sodium" aria-hidden /> New event
          </h2>
          <Field label="Title" error={errors.title}>
            <input className="field" value={form.title} onChange={(e) => set("title", e.target.value)} aria-invalid={!!errors.title} placeholder="Sufi night at the courtyard" maxLength={80} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Category" error={errors.category}>
              <select className="field" value={form.category} onChange={(e) => set("category", e.target.value as SubmissionInput["category"])}>
                {CATEGORY_IDS.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORIES[c].label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Sector" error={errors.neighborhoodId}>
              <select className="field" value={form.neighborhoodId} onChange={(e) => set("neighborhoodId", e.target.value)}>
                {ISLAMABAD.neighborhoods.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Venue" error={errors.venueName}>
            <input className="field" value={form.venueName} onChange={(e) => set("venueName", e.target.value)} aria-invalid={!!errors.venueName} placeholder="Where guests should go" maxLength={60} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Date" error={errors.date}>
              <input type="date" min={today} className="field" value={form.date} onChange={(e) => set("date", e.target.value)} aria-invalid={!!errors.date} />
            </Field>
            <Field label="Starts" error={errors.startTime} hint="Islamabad time">
              <input type="time" className="field" value={form.startTime} onChange={(e) => set("startTime", e.target.value)} aria-invalid={!!errors.startTime} />
            </Field>
            <Field label="Hours" error={errors.durationHours}>
              <input type="number" min={0.5} max={12} step={0.5} className="field" value={String(form.durationHours)} onChange={(e) => set("durationHours", e.target.value)} aria-invalid={!!errors.durationHours} />
            </Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Capacity" error={errors.capacity}>
              <input type="number" min={1} className="field" value={String(form.capacity)} onChange={(e) => set("capacity", e.target.value)} aria-invalid={!!errors.capacity} />
            </Field>
            <Field label={`Price per person (${ISLAMABAD.currency})`} error={errors.priceRupees} hint="Use 0 for a free event">
              <input type="number" min={0} className="field" value={String(form.priceRupees)} onChange={(e) => set("priceRupees", e.target.value)} aria-invalid={!!errors.priceRupees} />
            </Field>
          </div>
          <Field label="Description" error={errors.description} hint="What happens, who it's for, what to bring.">
            <textarea
              className="field min-h-28 resize-y"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              aria-invalid={!!errors.description}
              maxLength={600}
            />
          </Field>
          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <button type="button" onClick={() => save(false)} className="btn btn-ghost">
              Save draft
            </button>
            <button type="submit" className="btn btn-primary">
              <Send className="size-4" aria-hidden /> Submit for review
            </button>
          </div>
        </form>

        <section aria-labelledby="events-title">
          <h2 id="events-title" className="mb-4 text-xl font-semibold">
            Your events
          </h2>
          <ul className="space-y-3">
            <AnimatePresence initial={false}>
              {events.map((e) => (
                <motion.li
                  key={e.id}
                  layout
                  initial={{ opacity: 0, y: -16, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="space-y-3 rounded-[1.4rem] border border-line bg-ridge/50 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{e.title}</p>
                      <p className="text-sm text-haze">
                        {formatDay(new Date(e.session.startsAt), ISLAMABAD, now)} · {formatTime(new Date(e.session.startsAt), ISLAMABAD)} · {neighborhood(ISLAMABAD, e.neighborhoodId).name} ·{" "}
                        {formatMoney(e.priceMinor, ISLAMABAD)}
                      </p>
                    </div>
                    {e.state === "published" ? (
                      <Link href={`/discover/${e.id}`} aria-label={`View ${e.title}`} className="grid size-8 shrink-0 place-items-center rounded-full border border-line hover:border-haze">
                        <ArrowUpRight className="size-4" aria-hidden />
                      </Link>
                    ) : null}
                  </div>
                  <StateTrack state={e.state} />
                  {e.decisionReason && <p className="text-xs text-dusk">Reason: {e.decisionReason}</p>}
                  {e.state === "draft" && (
                    <button type="button" onClick={() => submitDraft(e)} className="btn btn-ghost w-full !py-2 text-sm">
                      Submit for review
                    </button>
                  )}
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          <p className="mt-5 text-xs leading-relaxed text-haze">
            A city editor reviews every new listing before members see it. Check its progress in the{" "}
            <Link href="/console" className="text-jasmine underline underline-offset-2">
              city console
            </Link>
            .
          </p>
        </section>
      </div>
      <Toast message={toast} onDismiss={() => setToast(null)} />
    </>
  );
}
