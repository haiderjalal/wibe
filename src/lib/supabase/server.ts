import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { isAuthConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

/** Per-request server client for Server Components, Server Actions and Route Handlers. */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component, where cookies are read-only; proxy.ts refreshes the session instead.
        }
      },
    },
  });
}

export interface SessionUser {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
}

/** The verified signed-in user, or null when signed out or auth isn't configured. */
export async function getSessionUser(): Promise<SessionUser | null> {
  if (!isAuthConfigured) return null;
  const supabase = await createClient();
  // getUser() validates the token with Supabase rather than trusting the cookie.
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  const meta = data.user.user_metadata as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" && v ? v : null);
  return {
    id: data.user.id,
    email: data.user.email ?? null,
    name: str(meta.full_name) ?? str(meta.name),
    avatarUrl: str(meta.avatar_url) ?? str(meta.picture),
  };
}
