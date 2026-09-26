import { NextResponse, type NextRequest } from "next/server";

import { isAuthConfigured, safeNextPath } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

/** Google OAuth lands here with a one-time code, which is exchanged for a session cookie. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  if (!isAuthConfigured || !code) return NextResponse.redirect(`${origin}/signin?error=callback`);

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("OAuth code exchange failed", { message: error.message });
    return NextResponse.redirect(`${origin}/signin?error=callback`);
  }
  return NextResponse.redirect(`${origin}${next}`);
}
