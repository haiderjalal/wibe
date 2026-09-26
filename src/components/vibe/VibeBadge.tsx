import Image from "next/image";

import { ARCHETYPES, type ArchetypeId } from "@/lib/vibe";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

/**
 * Avatar wrapped in a slowly turning ring and a name framed by a gradient border, both coloured by the
 * member's vibe type. The colours come from their own interview answers, never from inferred traits.
 */
export function VibeBadge({ name, avatarUrl, archetype, size = "md" }: { name: string; avatarUrl?: string | null; archetype: ArchetypeId; size?: "md" | "lg" }) {
  const { colors, name: typeName } = ARCHETYPES[archetype];
  const ring = `conic-gradient(from 0deg, ${colors[0]}, ${colors[1]}, ${colors[2]}, ${colors[0]})`;
  const avatar = size === "lg" ? "size-28" : "size-14";

  return (
    <div className={`flex items-center ${size === "lg" ? "flex-col gap-5 text-center" : "gap-4"}`}>
      <div className={`relative ${avatar} shrink-0`}>
        <div aria-hidden className="absolute -inset-[4px] animate-[spin_9s_linear_infinite] rounded-full motion-reduce:animate-none" style={{ background: ring }} />
        <div aria-hidden className="absolute -inset-[10px] animate-[spin_9s_linear_infinite] rounded-full opacity-40 blur-xl motion-reduce:animate-none" style={{ background: ring }} />
        <div className="relative size-full overflow-hidden rounded-full border-[3px] border-ink bg-ridge-2">
          {avatarUrl ? (
            <Image src={avatarUrl} alt="" fill sizes="112px" className="object-cover" unoptimized />
          ) : (
            <span className={`grid size-full place-items-center font-display font-bold ${size === "lg" ? "text-3xl" : "text-lg"}`}>{initials(name) || "W"}</span>
          )}
        </div>
      </div>
      <div className={size === "lg" ? "flex flex-col items-center gap-2" : ""}>
        <span className="inline-block rounded-full p-[1.5px]" style={{ background: `linear-gradient(90deg, ${colors[0]}, ${colors[1]}, ${colors[2]})` }}>
          <span className={`block rounded-full bg-ink font-semibold ${size === "lg" ? "px-5 py-1.5 text-xl" : "px-3.5 py-1 text-sm"}`}>{name}</span>
        </span>
        <p className={`font-serif italic ${size === "lg" ? "text-2xl" : "mt-1 text-base"}`} style={{ color: colors[0] }}>
          {typeName}
        </p>
      </div>
    </div>
  );
}
