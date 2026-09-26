import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";

import { SignIn } from "@/components/auth/SignIn";
import { Logo } from "@/components/Logo";
import { PHOTOS } from "@/lib/media";
import { isAuthConfigured, safeNextPath } from "@/lib/supabase/config";
import { getSessionUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Wibe with Google or a one-time email code.",
  robots: { index: false },
};

const PHOTO = PHOTOS["hill-dinner"];

export default async function SignInPage({ searchParams }: PageProps<"/signin">) {
  const params = await searchParams;
  const next = safeNextPath(typeof params.next === "string" ? params.next : undefined);
  if (await getSessionUser()) redirect(next);

  return (
    <main className="grid min-h-svh lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden overflow-hidden lg:block">
        <Image src={PHOTO.src} alt={PHOTO.alt} fill priority sizes="55vw" placeholder="blur" blurDataURL={PHOTO.blurDataURL} className="object-cover" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-ink/40" />
        <div className="absolute inset-x-0 bottom-0 p-12">
          <p className="max-w-md font-serif text-4xl italic leading-tight text-jasmine">“We came for the view and stayed for the people at the next table.”</p>
          <p className="eyebrow mt-4 !text-jasmine/70">Islamabad · after dark</p>
        </div>
      </div>

      <div className="flex flex-col px-6 py-10 sm:px-12">
        <Logo />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <p className="eyebrow">Welcome</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold leading-[0.95]" style={{ fontVariationSettings: '"wdth" 108' }}>
            Find your <span className="accent text-sodium">people.</span>
          </h1>
          <p className="mb-10 mt-3 text-haze">Sign in or create your account. It takes a few seconds.</p>
          <SignIn configured={isAuthConfigured} next={next} initialError={typeof params.error === "string" ? params.error : undefined} />
        </div>
        <p className="text-center text-xs text-haze">By continuing you agree to Wibe’s pilot terms. We never post anything for you.</p>
      </div>
    </main>
  );
}
