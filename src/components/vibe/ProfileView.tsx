"use client";

import Link from "next/link";
import { LogIn, LogOut, RotateCcw, Sparkles } from "lucide-react";
import { motion } from "motion/react";

import { signOut } from "@/app/actions/profile";
import { VibeBadge } from "@/components/vibe/VibeBadge";
import { useWibe } from "@/lib/store";
import { ARCHETYPES, QUESTIONS, type ArchetypeId } from "@/lib/vibe";

interface Member {
  name: string;
  email: string | null;
  avatarUrl: string | null;
  archetype: ArchetypeId | null;
  tags: string[];
  intents: string[];
}

const INTENT_LABEL = Object.fromEntries((QUESTIONS.find((q) => q.id === "intents")?.options ?? []).map((o) => [o.id, o.label]));

/** Signed-in members see their saved profile; guests see the vibe kept on this device. */
export function ProfileView({ member }: { member: Member | null }) {
  const { ready, vibe } = useWibe();
  if (!ready) return <div className="h-96 animate-pulse rounded-[2rem] bg-ridge/40" aria-busy="true" />;

  const archetype = member?.archetype ?? (member ? null : (vibe?.result.archetype ?? null));
  const tags = member ? member.tags : (vibe?.result.tags ?? []);
  const intents = member ? member.intents : (vibe?.result.intents ?? []);
  const name = member?.name ?? "Guest";

  return (
    <div>
      <div className="sector-grid relative overflow-hidden rounded-[2rem] border border-line p-8 text-center md:p-12">
        {archetype ? (
          <>
            <VibeBadge name={name} avatarUrl={member?.avatarUrl} archetype={archetype} size="lg" />
            <p className="mx-auto mt-4 max-w-md text-haze">{ARCHETYPES[archetype].line}</p>
          </>
        ) : (
          <div className="py-6">
            <Sparkles className="mx-auto size-10 text-sodium" aria-hidden />
            <h1 className="mt-5 font-display text-3xl font-bold">{member ? `Hi, ${name.split(" ")[0]}` : "No vibe yet"}</h1>
            <p className="mt-2 text-haze">Take the one-minute vibe check to get your profile colours and tags.</p>
            <Link href="/welcome?retake=1" className="btn btn-primary mt-6">
              Find my vibe
            </Link>
          </div>
        )}

        {tags.length > 0 && (
          <ul className="mt-8 flex flex-wrap justify-center gap-2" aria-label="Your tags">
            {tags.map((t, i) => (
              <motion.li key={t} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 + i * 0.05 } }} className="glass rounded-full px-4 py-1.5 text-sm">
                {t}
              </motion.li>
            ))}
          </ul>
        )}
      </div>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-ridge/50 p-5">
          <dt className="eyebrow !text-[0.62rem]">Wants to meet</dt>
          <dd className="mt-2">{intents.length ? intents.map((i) => INTENT_LABEL[i] ?? i).join(" · ") : "Not set"}</dd>
        </div>
        <div className="rounded-2xl border border-line bg-ridge/50 p-5">
          <dt className="eyebrow !text-[0.62rem]">Account</dt>
          <dd className="mt-2 truncate">{member ? (member.email ?? "Signed in") : "Guest on this device"}</dd>
        </div>
      </dl>

      <p className="mt-4 text-xs text-haze">Your answers and tags are private to you. Other members and partners can’t see your profile in the pilot.</p>

      <div className="mt-8 flex flex-wrap gap-3">
        {archetype && (
          <Link href="/welcome?retake=1" className="btn btn-ghost">
            <RotateCcw className="size-4" aria-hidden /> Retake vibe check
          </Link>
        )}
        {member ? (
          <form action={signOut}>
            <button type="submit" className="btn btn-ghost">
              <LogOut className="size-4" aria-hidden /> Sign out
            </button>
          </form>
        ) : (
          <Link href="/signin?next=/profile" className="btn btn-primary">
            <LogIn className="size-4" aria-hidden /> Sign in to save your profile
          </Link>
        )}
      </div>
    </div>
  );
}
