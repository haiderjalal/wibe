import type { Metadata } from "next";

import { SavedList } from "@/components/app/SavedList";

export const metadata: Metadata = {
  title: "Saved",
  description: "Places and events you've saved for later.",
};

export default function SavedPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 pt-8 md:pt-12">
      <SavedList />
    </main>
  );
}
