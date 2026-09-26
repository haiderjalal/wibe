/** Public Supabase settings. Auth features switch off gracefully until both are set in .env.local. */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isAuthConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/** Length of the emailed sign-in code; must match Auth > Email OTP length in the Supabase dashboard. */
export const OTP_LENGTH = 6;

/** Only allow same-site relative redirects after sign-in. */
export function safeNextPath(next: string | null | undefined, fallback = "/welcome"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
