import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { VibeInterview } from "@/components/vibe/VibeInterview";
import { getMemberProfile } from "@/lib/supabase/profile";

export const metadata: Metadata = {
  title: "Your vibe",
  description: "A one-minute vibe check so Wibe can pick plans and people you'll click with.",
  robots: { index: false },
};

export default async function WelcomePage({ searchParams }: PageProps<"/welcome">) {
  const { retake } = await searchParams;
  const profile = await getMemberProfile();
  // Returning members skip straight to their picks unless they chose to retake the interview.
  if (profile?.interviewDone && retake !== "1") redirect("/discover");

  return (
    <main className="px-5 pt-10 md:pt-16">
      <VibeInterview signedIn={Boolean(profile)} name={profile?.displayName ?? "You"} avatarUrl={profile?.avatarUrl ?? null} />
    </main>
  );
}
