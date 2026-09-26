import type { ReactNode } from "react";
import Image from "next/image";

import { CATEGORIES } from "@/lib/categories";
import type { Photo } from "@/lib/media";
import type { Category } from "@/lib/types";

/**
 * Listing cover: photography graded toward the dusk palette, with the sector code in the corner.
 * Without a photo it falls back to generative category art.
 */
export function Cover({
  category,
  photo,
  sector,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  priority = false,
  className = "",
  iconClassName = "size-40",
  children,
}: {
  category: Category;
  photo?: Photo;
  sector?: string;
  sizes?: string;
  priority?: boolean;
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
      {photo ? (
        <>
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes={sizes}
            priority={priority}
            placeholder="blur"
            blurDataURL={photo.blurDataURL}
            className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
          />
          {/* Colour grade: a category-tinted wash keeps mixed photography feeling like one set. */}
          <div
            aria-hidden
            className="absolute inset-0 mix-blend-soft-light"
            style={{ background: `linear-gradient(140deg, hsl(${hues[0]} 90% 55% / 0.45), transparent 55%, hsl(${hues[1]} 80% 45% / 0.35))` }}
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-ink/20" />
        </>
      ) : (
        <>
          <div aria-hidden className="sector-grid absolute inset-0 opacity-50 mix-blend-overlay" />
          <Icon aria-hidden strokeWidth={1.1} className={`absolute -bottom-[12%] -right-[8%] rotate-[-12deg] text-white/20 ${iconClassName}`} />
        </>
      )}
      {sector && (
        <span className="absolute left-4 top-4 rounded-full bg-ink/40 px-2.5 py-1 font-mono text-[0.68rem] font-medium tracking-[0.14em] text-white/95 backdrop-blur-md">
          {sector}
        </span>
      )}
      {children}
    </div>
  );
}
