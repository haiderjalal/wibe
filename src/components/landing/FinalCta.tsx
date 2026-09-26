import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Logo } from "@/components/Logo";
import { WordsRise } from "@/components/motion/Reveal";
import { PHOTOS } from "@/lib/media";

const BACKDROP = PHOTOS["mosque-sunset"];

/** Closing call to action over the sector grid receding toward a dusk horizon. */
export function FinalCta() {
  return (
    <>
      <section className="relative overflow-hidden px-5 pb-28 pt-40 text-center sm:px-8 md:pb-40 md:pt-56" aria-labelledby="cta-title">
        <div aria-hidden className="absolute inset-0">
          <Image src={BACKDROP.src} alt="" fill sizes="100vw" placeholder="blur" blurDataURL={BACKDROP.blurDataURL} className="object-cover opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/50 to-ink" />
        </div>
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-[60%] [perspective:500px]">
          <div className="animate-grid-drift absolute bg-[linear-gradient(rgb(255_181_71/0.28)_1px,transparent_1px),linear-gradient(90deg,rgb(255_181_71/0.28)_1px,transparent_1px)] bg-[size:64px_64px] inset-x-[-50%] bottom-[-10%] h-[160%] origin-bottom [transform:rotateX(64deg)] [mask-image:linear-gradient(to_top,black_20%,transparent_85%)]" />
        </div>
        <div aria-hidden className="absolute left-1/2 top-[38%] h-40 w-[70%] -translate-x-1/2 rounded-full bg-dusk/25 blur-[100px]" />
        <div className="relative mx-auto max-w-4xl">
          <h2 id="cta-title" className="font-display text-[clamp(2.6rem,7vw,6.4rem)] font-extrabold leading-[0.9]" style={{ fontVariationSettings: '"wdth" 115' }}>
            <WordsRise text="Tonight’s plan is a few taps" /> <span className="accent text-sodium">away.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-md text-lg text-haze">Free for members. Add Wibe to your home screen, no app store needed.</p>
          <Link href="/onboarding" className="btn btn-primary group mt-10 !px-7 !py-4 text-base">
            Set your vibe
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>
      </section>
      <footer className="border-t border-line px-5 py-12 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Logo />
            <p className="max-w-sm text-sm text-haze">This pilot prototype runs on fictional listings and stores everything on your device.</p>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-haze">
            <Link href="/credits" className="hover:text-jasmine">Photo credits</Link>
            <Link href="/discover" className="hover:text-jasmine">Discover</Link>
            <Link href="/saved" className="hover:text-jasmine">Saved</Link>
            <Link href="/partner" className="hover:text-jasmine">Partner portal</Link>
            <Link href="/console" className="hover:text-jasmine">City console</Link>
          </nav>
        </div>
      </footer>
    </>
  );
}
