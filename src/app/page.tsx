import type { Metadata } from "next";

import { CinematicBand } from "@/components/landing/CinematicBand";
import { FinalCta } from "@/components/landing/FinalCta";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Marquee } from "@/components/landing/Marquee";
import { Moments } from "@/components/landing/Moments";
import { Partners } from "@/components/landing/Partners";
import { Pricing } from "@/components/landing/Pricing";
import { Principles } from "@/components/landing/Principles";
import { ReasonsShowcase } from "@/components/landing/ReasonsShowcase";
import { SiteNav } from "@/components/landing/SiteNav";
import { SmoothScroll } from "@/components/landing/SmoothScroll";
import { Statement } from "@/components/landing/Statement";
import { WeekGallery } from "@/components/landing/WeekGallery";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <SmoothScroll>
      <SiteNav />
      <main>
        <Hero />
        <Marquee />
        <CinematicBand />
        <Statement />
        <HowItWorks />
        <ReasonsShowcase />
        <Moments />
        <WeekGallery />
        <Partners />
        <Principles />
        <Pricing />
        <FinalCta />
      </main>
    </SmoothScroll>
  );
}
