import type { Metadata } from "next";

import { PartnerPortal } from "@/components/app/PartnerPortal";

export const metadata: Metadata = {
  title: "Partner portal",
  description: "Draft events and submit them for city review.",
};

export default function PartnerPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 pt-8 md:pt-12">
      <PartnerPortal />
    </main>
  );
}
