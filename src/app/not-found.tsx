import Link from "next/link";

import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <main className="sector-grid grid min-h-svh place-items-center px-5 text-center">
      <div className="max-w-md">
        <Logo />
        <p className="eyebrow mt-10">404 · off the map</p>
        <h1 className="mt-4 font-display text-4xl font-extrabold" style={{ fontVariationSettings: '"wdth" 110' }}>
          This page isn’t in any sector.
        </h1>
        <p className="mt-3 text-haze">The link may be old or mistyped.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/discover" className="btn btn-primary">
            See your picks
          </Link>
          <Link href="/" className="btn btn-ghost">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
