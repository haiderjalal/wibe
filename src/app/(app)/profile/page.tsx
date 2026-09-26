import type { Metadata } from "next";

import { ProfileView } from "@/components/vibe/ProfileView";
import { getMemberProfile } from "@/lib/supabase/profile";

export const metadata: Metadata = {
  title: "Profile",
  description: "Your Wibe profile and vibe tags.",
  robots: { index: false },
};

export default async function ProfilePage() {
  const profile = await getMemberProfile();
  return (
    <main className="mx-auto max-w-3xl px-5 pt-10 md:pt-16">
      <ProfileView
        member={
          profile && {
            name: profile.displayName,
            email: profile.user.email,
            avatarUrl: profile.avatarUrl,
            archetype: profile.archetype,
            tags: profile.tags,
            intents: profile.intents,
          }
        }
      />
    </main>
  );
}
