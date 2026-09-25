import type { Metadata } from "next";

import { Feed } from "@/components/app/Feed";

export const metadata: Metadata = {
  title: "Discover",
  description: "Personal picks for places and events in Islamabad, each with the reasons it made your list.",
};

export default function DiscoverPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 pt-8 md:pt-12">
      <Feed />
    </main>
  );
}
