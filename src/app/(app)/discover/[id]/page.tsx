import type { Metadata } from "next";

import { ItemDetail } from "@/components/app/ItemDetail";
import { buildCatalog } from "@/lib/data";

// Fixture listings prerender; partner submissions (device-local) render on demand.
export function generateStaticParams(): { id: string }[] {
  return buildCatalog(new Date()).map((item) => ({ id: item.id }));
}

export async function generateMetadata({ params }: PageProps<"/discover/[id]">): Promise<Metadata> {
  const { id } = await params;
  // Titles don't depend on time, so the fixture catalog is safe to read on the server.
  const item = buildCatalog(new Date()).find((i) => i.id === id);
  return item
    ? { title: item.title, description: item.blurb, alternates: { canonical: `/discover/${id}` } }
    : { title: "Listing" };
}

export default async function ItemPage({ params }: PageProps<"/discover/[id]">) {
  const { id } = await params;
  return (
    <main className="mx-auto max-w-6xl px-5 pt-6 md:pt-10">
      <ItemDetail id={id} />
    </main>
  );
}
