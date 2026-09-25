import type { Metadata } from "next";

import { Onboarding } from "@/components/app/Onboarding";

export const metadata: Metadata = {
  title: "Set your vibe",
  description: "Choose your city, interests, area and budget to get personal picks.",
};

export default function OnboardingPage() {
  return (
    <main className="px-5 pt-10 md:pt-16">
      <Onboarding />
    </main>
  );
}
