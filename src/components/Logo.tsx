import Link from "next/link";

/** Wide lowercase wordmark; the sodium dot doubles as a map pin. */
export function Logo({ href = "/", className = "" }: { href?: string; className?: string }) {
  return (
    <Link
      href={href}
      aria-label="Wibe home"
      className={`font-display text-2xl font-extrabold lowercase tracking-tight ${className}`}
      style={{ fontVariationSettings: '"wdth" 130' }}
    >
      wibe<span className="text-sodium">.</span>
    </Link>
  );
}
