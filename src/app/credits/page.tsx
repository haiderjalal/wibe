import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Logo } from "@/components/Logo";
import { PHOTOS } from "@/lib/media";

export const metadata: Metadata = {
  title: "Photo credits",
  description: "Photographers whose work appears on Wibe.",
  alternates: { canonical: "/credits" },
};

export default function CreditsPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-12 md:py-20">
      <Logo />
      <p className="eyebrow mt-12">Photo credits</p>
      <h1 className="mt-4 font-display text-[clamp(2.2rem,6vw,4rem)] font-extrabold leading-none" style={{ fontVariationSettings: '"wdth" 110' }}>
        Thank you to these <span className="accent text-sodium">photographers.</span>
      </h1>
      <p className="mt-4 max-w-xl text-haze">
        Photos are from Unsplash under the Unsplash License. They illustrate the kinds of evenings Wibe helps you find; the listings themselves are
        fictional.
      </p>
      <ul className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {Object.values(PHOTOS).map((p) => (
          <li key={p.src}>
            <a href={`https://unsplash.com/photos/${p.unsplashId}`} target="_blank" rel="noopener noreferrer" className="group block">
              <span className="relative block aspect-[4/5] overflow-hidden rounded-2xl">
                <Image src={p.src} alt={p.alt} fill sizes="(min-width: 1024px) 25vw, 50vw" placeholder="blur" blurDataURL={p.blurDataURL} className="object-cover transition-transform duration-700 group-hover:scale-105" />
              </span>
              <span className="mt-2 block text-sm text-haze group-hover:text-jasmine">@{p.credit}</span>
            </a>
          </li>
        ))}
      </ul>
      <Link href="/" className="btn btn-ghost mt-12">
        Back home
      </Link>
    </main>
  );
}
