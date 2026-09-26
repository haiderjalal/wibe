"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Lock, RotateCcw, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { saveVibe, updateVibeTags } from "@/app/actions/profile";
import { VibeBadge } from "@/components/vibe/VibeBadge";
import { PHOTOS, type PhotoName } from "@/lib/media";
import { useWibe, wibe } from "@/lib/store";
import { ARCHETYPES, QUESTIONS, type Answers, type Question, type VibeResult } from "@/lib/vibe";

const EASE = [0.22, 1, 0.36, 1] as const;
const ADVANCE_MS = 380;
const READING_MS = 1600;

type Phase = "intro" | "questions" | "reading" | "result";

function SingleQuestion({ q, picked, onPick }: { q: Question; picked: string[]; onPick: (id: string) => void }) {
  return (
    <div className="grid gap-3">
      {q.options.map((o, i) => {
        const on = picked.includes(o.id);
        return (
          <motion.button
            key={o.id}
            type="button"
            onClick={() => onPick(o.id)}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.08 + i * 0.06 } }}
            aria-pressed={on}
            className={`group flex items-center gap-4 rounded-2xl border p-5 text-left transition-colors ${on ? "border-sodium bg-sodium/12" : "border-line bg-ridge/50 hover:border-haze/50"}`}
          >
            <span className={`grid size-8 shrink-0 place-items-center rounded-full border font-mono text-xs ${on ? "border-sodium bg-sodium text-ink" : "border-line text-haze"}`}>
              {on ? <Check className="size-4" aria-hidden /> : i + 1}
            </span>
            <span>
              <span className="block text-lg font-semibold">{o.label}</span>
              {o.hint && <span className="mt-0.5 block text-sm text-haze">{o.hint}</span>}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

function PairQuestion({ q, picked, onPick }: { q: Question; picked: string[]; onPick: (id: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {q.options.map((o, i) => {
        const photo = PHOTOS[o.photo as PhotoName];
        const on = picked.includes(o.id);
        const dim = picked.length > 0 && !on;
        return (
          <motion.button
            key={o.id}
            type="button"
            onClick={() => onPick(o.id)}
            initial={{ opacity: 0, y: 24, rotate: i === 0 ? -2 : 2 }}
            animate={{ opacity: dim ? 0.35 : 1, y: 0, rotate: 0, scale: on ? 1.03 : dim ? 0.96 : 1, transition: { duration: 0.45, ease: EASE, delay: picked.length ? 0 : 0.06 + i * 0.08 } }}
            whileHover={picked.length ? undefined : { y: -6 }}
            aria-pressed={on}
            className={`group relative aspect-[3/4] overflow-hidden rounded-[1.6rem] border-2 text-left ${on ? "border-sodium" : "border-transparent"}`}
          >
            <Image src={photo.src} alt="" fill sizes="(min-width: 640px) 300px, 45vw" placeholder="blur" blurDataURL={photo.blurDataURL} className="object-cover transition-transform duration-700 group-hover:scale-105" />
            <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
            <span className="absolute left-3 top-3 grid size-7 place-items-center rounded-full bg-ink/50 font-mono text-xs backdrop-blur">
              {on ? <Check className="size-4 text-sodium" aria-hidden /> : i + 1}
            </span>
            <span className="absolute inset-x-0 bottom-0 p-4 font-serif text-xl italic leading-tight sm:text-2xl">{o.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

function MultiQuestion({ q, picked, onToggle }: { q: Question; picked: string[]; onToggle: (id: string) => void }) {
  const full = picked.length >= (q.max ?? q.options.length);
  return (
    <div className="flex flex-wrap gap-2.5">
      {q.options.map((o, i) => {
        const on = picked.includes(o.id);
        return (
          <motion.button
            key={o.id}
            type="button"
            onClick={() => onToggle(o.id)}
            disabled={!on && full}
            whileTap={{ scale: 0.94 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: !on && full ? 0.4 : 1, scale: 1, transition: { delay: 0.04 * i } }}
            aria-pressed={on}
            className={`flex items-center gap-2 rounded-full border px-5 py-3 font-medium transition-colors ${on ? "border-sodium bg-sodium/15 text-sodium" : "border-line text-jasmine hover:border-haze/60"}`}
          >
            {on && <Check className="size-4" aria-hidden />}
            {o.label}
          </motion.button>
        );
      })}
    </div>
  );
}

export function VibeInterview({ signedIn, name, avatarUrl }: { signedIn: boolean; name: string; avatarUrl: string | null }) {
  const router = useRouter();
  const { ready, prefs } = useWibe();
  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<VibeResult | null>(null);
  const [hidden, setHidden] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  // Blocks a second tap while the auto-advance is pending, so a double-tap can't skip a question.
  const [locked, setLocked] = useState(false);

  const q = QUESTIONS[index];
  const picked = answers[q?.id] ?? [];
  const isLast = index === QUESTIONS.length - 1;

  const finish = async (final: Answers) => {
    setPhase("reading");
    setError("");
    const [res] = await Promise.all([saveVibe(final), new Promise((r) => setTimeout(r, READING_MS))]);
    if (!res.ok) {
      setError(res.message);
      setPhase("questions");
      return;
    }
    wibe.setVibe({ answers: final, result: res.result });
    setResult(res.result);
    setSaved(res.saved);
    setHidden([]);
    setPhase("result");
  };

  const advance = (next: Answers) => {
    if (isLast) return void finish(next);
    setDirection(1);
    setIndex((i) => i + 1);
  };

  const pickOne = (id: string) => {
    if (locked) return;
    const next = { ...answers, [q.id]: [id] };
    setAnswers(next);
    setLocked(true);
    setTimeout(() => {
      setLocked(false);
      advance(next);
    }, ADVANCE_MS);
  };

  const toggle = (id: string) => {
    setAnswers((a) => {
      const cur = a[q.id] ?? [];
      return { ...a, [q.id]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] };
    });
  };

  const back = () => {
    if (index === 0) return setPhase("intro");
    setDirection(-1);
    setIndex((i) => i - 1);
  };

  // Number keys pick options; Enter continues multi-select questions.
  useEffect(() => {
    if (phase !== "questions") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const n = Number(e.key);
      if (n >= 1 && n <= q.options.length) {
        const id = q.options[n - 1].id;
        if (q.kind === "multi") toggle(id);
        else pickOne(id);
      } else if (e.key === "Enter" && q.kind === "multi" && picked.length >= (q.min ?? 0)) advance(answers);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const hideTag = async (tag: string) => {
    const nextHidden = [...hidden, tag];
    setHidden(nextHidden);
    if (!result) return;
    const visible = result.tags.filter((t) => !nextHidden.includes(t));
    wibe.setVibe({ answers, result: { ...result, tags: visible } });
    if (signedIn) await updateVibeTags(visible);
  };

  const restart = () => {
    setAnswers({});
    setIndex(0);
    setResult(null);
    setPhase("questions");
  };

  if (!ready) return <div className="mx-auto h-[70vh] max-w-2xl animate-pulse rounded-[2rem] bg-ridge/40" aria-busy="true" />;

  return (
    <div className="mx-auto max-w-2xl">
      <AnimatePresence mode="wait" custom={direction}>
        {phase === "intro" && (
          <motion.section key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5, ease: EASE }} className="text-center">
            <div className="relative mx-auto mb-10 grid h-56 max-w-md grid-cols-3 gap-3">
              {(["chai-pour", "tabla", "trail-run"] as PhotoName[]).map((p, i) => (
                <motion.div
                  key={p}
                  initial={{ opacity: 0, y: 40, rotate: (i - 1) * 8 }}
                  animate={{ opacity: 1, y: i === 1 ? -12 : 0, rotate: (i - 1) * 5 }}
                  transition={{ delay: 0.15 + i * 0.1, duration: 0.7, ease: EASE }}
                  className="relative overflow-hidden rounded-2xl shadow-2xl"
                >
                  <Image src={PHOTOS[p].src} alt="" fill sizes="160px" placeholder="blur" blurDataURL={PHOTOS[p].blurDataURL} className="object-cover" />
                </motion.div>
              ))}
            </div>
            <p className="eyebrow">{signedIn ? `Welcome, ${name.split(" ")[0]}` : "Vibe check"}</p>
            <h1 className="mt-4 font-display text-[clamp(2.4rem,7vw,4rem)] font-extrabold leading-[0.95]" style={{ fontVariationSettings: '"wdth" 108' }}>
              Let’s find your <span className="accent text-sodium">vibe.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-md text-lg text-haze">Nine quick taps, about a minute. We use them to pick plans and people you’ll actually click with.</p>
            <button type="button" onClick={() => setPhase("questions")} className="btn btn-primary mt-8 !px-8 !py-4 text-base">
              <Sparkles className="size-4" aria-hidden /> Start
            </button>
            <p className="mx-auto mt-6 flex max-w-sm items-start justify-center gap-2 text-xs leading-relaxed text-haze">
              <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              Only you see your answers. Profile tags come only from what you pick, and you can hide any of them.
            </p>
          </motion.section>
        )}

        {phase === "questions" && q && (
          <motion.section key="questions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} aria-labelledby="q-prompt">
            <div className="mb-8 flex items-center gap-4">
              <button type="button" onClick={back} aria-label="Previous question" className="grid size-10 shrink-0 place-items-center rounded-full border border-line hover:border-haze/60">
                <ArrowLeft className="size-4" aria-hidden />
              </button>
              <div className="flex flex-1 gap-1.5" aria-label={`Question ${index + 1} of ${QUESTIONS.length}`}>
                {QUESTIONS.map((qq, i) => (
                  <span key={qq.id} className="h-1 flex-1 overflow-hidden rounded-full bg-line">
                    <motion.span className="block h-full bg-sodium" initial={false} animate={{ width: i < index ? "100%" : i === index ? "50%" : "0%" }} transition={{ duration: 0.4 }} />
                  </span>
                ))}
              </div>
              <span className="font-mono text-xs text-haze">
                {index + 1}/{QUESTIONS.length}
              </span>
            </div>

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div key={q.id} initial={{ opacity: 0, x: direction * 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: direction * -50 }} transition={{ duration: 0.35, ease: EASE }}>
                <h2 id="q-prompt" className="font-display text-[clamp(2rem,6vw,3.2rem)] font-bold leading-[1] tracking-tight" style={{ fontVariationSettings: '"wdth" 104' }}>
                  {q.prompt}
                </h2>
                {q.sub && <p className="mt-2 text-haze">{q.sub}</p>}
                <div className="mt-8">
                  {q.kind === "single" && <SingleQuestion q={q} picked={picked} onPick={pickOne} />}
                  {q.kind === "pair" && <PairQuestion q={q} picked={picked} onPick={pickOne} />}
                  {q.kind === "multi" && <MultiQuestion q={q} picked={picked} onToggle={toggle} />}
                </div>
                {q.kind === "multi" && (
                  <div className="mt-10 flex items-center justify-between">
                    <span className="text-sm text-haze">
                      {picked.length} of {q.max} picked
                    </span>
                    <button type="button" onClick={() => advance(answers)} disabled={picked.length < (q.min ?? 0)} className="btn btn-primary">
                      {picked.length === 0 && (q.min ?? 0) === 0 ? "Skip" : isLast ? "See my vibe" : "Continue"} <ArrowRight className="size-4" aria-hidden />
                    </button>
                  </div>
                )}
                <p role="alert" className="mt-4 min-h-5 text-sm text-dusk">
                  {error}
                </p>
              </motion.div>
            </AnimatePresence>
          </motion.section>
        )}

        {phase === "reading" && (
          <motion.section key="reading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="grid min-h-[60vh] place-items-center text-center" aria-live="polite">
            <div>
              <div className="relative mx-auto size-32">
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ background: "conic-gradient(#8c7bff, #ff6f7d, #ffb547, #43e0b0, #8c7bff)" }}
                  animate={{ rotate: 360, scale: [1, 1.08, 1] }}
                  transition={{ rotate: { duration: 1.6, repeat: Infinity, ease: "linear" }, scale: { duration: 1.2, repeat: Infinity } }}
                />
                <div className="absolute inset-2 rounded-full bg-ink" />
                <Sparkles className="absolute inset-0 m-auto size-8 text-sodium" aria-hidden />
              </div>
              <p className="mt-8 font-serif text-3xl italic">Reading your vibe…</p>
            </div>
          </motion.section>
        )}

        {phase === "result" && result && (
          <motion.section key="result" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }} className="text-center">
            <p className="eyebrow mb-8">Your vibe</p>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 160, damping: 16, delay: 0.1 }}>
              <VibeBadge name={name} avatarUrl={avatarUrl} archetype={result.archetype} size="lg" />
            </motion.div>
            <p className="mx-auto mt-5 max-w-md text-lg text-haze">{ARCHETYPES[result.archetype].line}</p>

            <ul className="mt-8 flex flex-wrap justify-center gap-2" aria-label="Your tags">
              <AnimatePresence>
                {result.tags
                  .filter((t) => !hidden.includes(t))
                  .map((t, i) => (
                    <motion.li key={t} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.35 + i * 0.07 } }} exit={{ opacity: 0, scale: 0.8 }}>
                      <span className="glass flex items-center gap-1.5 rounded-full py-1.5 pl-4 pr-1.5 text-sm">
                        {t}
                        <button type="button" onClick={() => hideTag(t)} aria-label={`Hide tag ${t}`} className="grid size-6 place-items-center rounded-full text-haze hover:bg-white/10 hover:text-jasmine">
                          <X className="size-3.5" aria-hidden />
                        </button>
                      </span>
                    </motion.li>
                  ))}
              </AnimatePresence>
            </ul>

            <p className="mt-6 text-sm text-haze">
              {saved ? (
                "Saved to your profile. Only you see your answers."
              ) : (
                <>
                  Saved on this device.{" "}
                  <Link href="/signin?next=/welcome" className="text-jasmine underline underline-offset-4">
                    Sign in
                  </Link>{" "}
                  to keep it on your profile.
                </>
              )}
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <button type="button" onClick={restart} className="btn btn-ghost">
                <RotateCcw className="size-4" aria-hidden /> Retake
              </button>
              <button type="button" onClick={() => router.push(prefs ? "/discover" : "/onboarding")} className="btn btn-primary">
                {prefs ? "See my picks" : "Set up my picks"} <ArrowRight className="size-4" aria-hidden />
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
