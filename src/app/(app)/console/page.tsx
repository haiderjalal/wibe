import type { Metadata } from "next";

import { CityConsole } from "@/components/app/CityConsole";

export const metadata: Metadata = {
  title: "City console",
  description: "Review partner submissions and monitor listing freshness for Islamabad.",
};

export default function ConsolePage() {
  return (
    <main className="mx-auto max-w-6xl px-5 pt-8 md:pt-12">
      <CityConsole />
    </main>
  );
}
