import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff } from "lucide-react";

import { Logo } from "@/components/Logo";

export const metadata: Metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <main className="sector-grid grid min-h-svh place-items-center px-5 text-center">
      <div className="max-w-sm">
        <Logo />
        <WifiOff className="mx-auto mt-10 size-10 text-sodium" aria-hidden />
        <h1 className="mt-6 font-display text-3xl font-bold">You’re offline</h1>
        <p className="mt-3 text-haze">Pages you’ve opened before still work. Reconnect to load new picks.</p>
        <Link href="/saved" className="btn btn-primary mt-8">
          Open saved plans
        </Link>
      </div>
    </main>
  );
}
