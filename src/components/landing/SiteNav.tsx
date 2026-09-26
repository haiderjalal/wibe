"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useMotionValueEvent, useScroll } from "motion/react";

import { Logo } from "@/components/Logo";

const LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#partners", label: "For partners" },
  { href: "#principles", label: "Principles" },
  { href: "#pricing", label: "Pricing" },
];

export function SiteNav() {
  const { scrollY } = useScroll();
  const [solid, setSolid] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setSolid(y > 40));

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50"
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <nav
        aria-label="Main"
        className={`mx-auto mt-3 flex max-w-7xl items-center justify-between rounded-full px-5 py-2.5 transition-all duration-500 sm:mx-4 lg:mx-auto ${
          solid ? "glass mx-3 shadow-[0_10px_40px_-20px_rgb(0_0_0/0.8)]" : "border border-transparent"
        }`}
      >
        <Logo />
        <ul className="hidden items-center gap-7 text-sm text-haze lg:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="transition-colors hover:text-jasmine">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <Link href="/signin" className="hidden rounded-full px-4 py-2 text-sm text-haze transition-colors hover:text-jasmine sm:block">
            Sign in
          </Link>
          <Link href="/discover" className="btn btn-primary !px-4 !py-2 text-sm">
            Open the app
          </Link>
        </div>
      </nav>
    </motion.header>
  );
}
