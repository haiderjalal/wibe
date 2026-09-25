import type { ReactNode } from "react";

import { CATEGORIES } from "@/lib/categories";
import type { Category } from "@/lib/types";

/** Generative cover art: category hues over the sector grid, so listings never depend on stock photos. */
export function Cover({
  category,
  sector,
  className = "",
  iconClassName = "size-40",
  children,
}: {
  category: Category;
  sector?: string;
  className?: string;
  iconClassName?: string;
  children?: ReactNode;
}) {
  const { hues, icon: Icon } = CATEGORIES[category];
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        background: [
          `radial-gradient(120% 90% at 12% 8%, hsl(${hues[0]} 92% 62% / 0.85), transparent 58%)`,
          `radial-gradient(110% 90% at 96% 100%, hsl(${hues[1]} 88% 56% / 0.8), transparent 56%)`,
          "#171b4b",
        ].join(","),
      }}
    >
      <div aria-hidden className="sector-grid absolute inset-0 opacity-50 mix-blend-overlay" />
      <Icon aria-hidden strokeWidth={1.1} className={`absolute -bottom-[12%] -right-[8%] rotate-[-12deg] text-white/20 ${iconClassName}`} />
      {sector && <span className="absolute left-4 top-4 font-mono text-xs font-medium tracking-[0.14em] text-white/90">{sector}</span>}
      {children}
    </div>
  );
}
