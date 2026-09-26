import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { isAuthConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";

/** Refreshes the Supabase session cookie on each request so Server Components see a valid session. */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!isAuthConfigured) return response;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet, headers) => {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });
  await supabase.auth.getUser();
  return response;
}

export const config = {
  // Skip static assets, images and the service worker.
  matcher: ["/((?!_next/static|_next/image|icons/|images/|sw.js|manifest.webmanifest|favicon|icon|apple-icon).*)"],
};
