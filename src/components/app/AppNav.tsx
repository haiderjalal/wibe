"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Compass, LayoutDashboard, Store } from "lucide-react";
import { motion } from "motion/react";

import { Logo } from "@/components/Logo";

const TABS = [
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/saved", label: "Saved", icon: Bookmark },
  { href: "/partner", label: "Partner", icon: Store },
  { href: "/console", label: "Console", icon: LayoutDashboard },
];

export function AppNav() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-ink/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Logo />
          <nav aria-label="App" className="hidden items-center gap-1 md:flex">
            {TABS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${isActive(href) ? "text-ink" : "text-haze hover:text-jasmine"}`}
              >
                {isActive(href) && (
                  <motion.span layoutId="app-nav-pill" className="absolute inset-0 rounded-full bg-jasmine" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
                )}
                <span className="relative">{label}</span>
              </Link>
            ))}
          </nav>
          <span className="eyebrow rounded-full border border-line px-3 py-1.5 !text-[0.6rem]">Demo · fictional data</span>
        </div>
      </header>

      <nav aria-label="App" className="glass fixed inset-x-3 bottom-3 z-40 rounded-3xl md:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <ul className="grid grid-cols-4">
          {TABS.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={`relative flex flex-col items-center gap-1 py-3 text-[0.68rem] font-medium ${isActive(href) ? "text-sodium" : "text-haze"}`}
              >
                {isActive(href) && <motion.span layoutId="app-tab-dot" className="absolute top-1 h-1 w-6 rounded-full bg-sodium" />}
                <Icon className="size-5" aria-hidden />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
