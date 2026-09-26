"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { isAuthConfigured } from "@/lib/supabase/config";
import { createClient, getSessionUser } from "@/lib/supabase/server";
import { scoreVibe, validateAnswers, type VibeResult } from "@/lib/vibe";

const answersSchema = z.record(z.string().max(32), z.array(z.string().max(32)).max(8));

export type SaveVibeResult = { ok: true; result: VibeResult; saved: boolean } | { ok: false; message: string };

/**
 * Validates interview answers and stores the result on the member's profile.
 * The score is recomputed here; tags sent from the browser are never trusted.
 */
export async function saveVibe(input: unknown): Promise<SaveVibeResult> {
  const parsed = answersSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Those answers couldn't be read. Please try again." };
  const problem = validateAnswers(parsed.data);
  if (problem) return { ok: false, message: "Some answers are missing. Go back and finish every question." };

  const result = scoreVibe(parsed.data);
  const user = await getSessionUser();
  if (!user) return { ok: true, result, saved: false };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      vibe_archetype: result.archetype,
      vibe_tags: result.tags,
      intents: result.intents,
      interests: result.interests,
      interview_answers: parsed.data,
      interview_completed_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error("Saving vibe failed", { userId: user.id, code: error.code });
    return { ok: false, message: "We couldn't save your vibe just now. Please try again." };
  }
  return { ok: true, result, saved: true };
}

/** Lets members hide tags they don't want shown. Only tags from their own saved result can remain. */
export async function updateVibeTags(tags: unknown): Promise<{ ok: boolean }> {
  const parsed = z.array(z.string().max(40)).max(8).safeParse(tags);
  const user = await getSessionUser();
  if (!parsed.success || !user) return { ok: false };
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("vibe_tags").eq("id", user.id).single();
  const allowed = new Set<string>((data?.vibe_tags as string[] | undefined) ?? []);
  const kept = parsed.data.filter((t) => allowed.has(t));
  const { error } = await supabase.from("profiles").update({ vibe_tags: kept }).eq("id", user.id);
  return { ok: !error };
}

export async function signOut(): Promise<void> {
  if (isAuthConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}
