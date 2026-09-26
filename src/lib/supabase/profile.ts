import "server-only";

import { createClient, getSessionUser, type SessionUser } from "./server";
import type { ArchetypeId } from "../vibe";

export interface MemberProfile {
  user: SessionUser;
  displayName: string;
  avatarUrl: string | null;
  archetype: ArchetypeId | null;
  tags: string[];
  intents: string[];
  interviewDone: boolean;
}

/** The signed-in member's own profile row (RLS limits reads to their own), or null when signed out. */
export async function getMemberProfile(): Promise<MemberProfile | null> {
  const user = await getSessionUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("display_name, avatar_url, vibe_archetype, vibe_tags, intents, interview_completed_at")
    .eq("id", user.id)
    .maybeSingle();
  if (error) console.error("Loading profile failed", { userId: user.id, code: error.code });

  return {
    user,
    displayName: data?.display_name ?? user.name ?? user.email?.split("@")[0] ?? "Member",
    avatarUrl: data?.avatar_url ?? user.avatarUrl,
    archetype: (data?.vibe_archetype as ArchetypeId | null) ?? null,
    tags: (data?.vibe_tags as string[] | null) ?? [],
    intents: (data?.intents as string[] | null) ?? [],
    interviewDone: Boolean(data?.interview_completed_at),
  };
}
