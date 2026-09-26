"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2, Mail } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { z } from "zod";

import { OtpInput } from "@/components/auth/OtpInput";
import { createClient } from "@/lib/supabase/client";
import { OTP_LENGTH, safeNextPath } from "@/lib/supabase/config";

const RESEND_SECONDS = 60;
const EASE = [0.22, 1, 0.36, 1] as const;
const emailSchema = z.email("Enter a valid email address, like name@example.com.");

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export function SignIn({ configured, next, initialError }: { configured: boolean; next?: string; initialError?: string }) {
  const router = useRouter();
  const [step, setStep] = useState<"start" | "code">("start");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState(initialError ? "Sign-in didn’t finish. Please try again." : "");
  const [busy, setBusy] = useState<"google" | "email" | "verify" | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const destination = safeNextPath(next);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const signInWithGoogle = async () => {
    setError("");
    setBusy("google");
    const { error: err } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(destination)}` },
    });
    if (err) {
      setBusy(null);
      setError("Google sign-in isn’t available right now. Try your email instead.");
    }
  };

  const sendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const parsed = emailSchema.safeParse(email.trim());
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter a valid email address.");
      return;
    }
    setError("");
    setBusy("email");
    const { error: err } = await createClient().auth.signInWithOtp({ email: parsed.data, options: { shouldCreateUser: true } });
    setBusy(null);
    if (err) {
      setError(err.status === 429 ? "Too many codes requested. Wait a minute, then try again." : "We couldn’t send a code. Check the address and try again.");
      return;
    }
    setCode("");
    setStep("code");
    setCooldown(RESEND_SECONDS);
  };

  const verify = async (token: string) => {
    setError("");
    setBusy("verify");
    const { error: err } = await createClient().auth.verifyOtp({ email: email.trim(), token, type: "email" });
    if (err) {
      setBusy(null);
      setCode("");
      setError("That code didn’t match or has expired. Check your email or send a new one.");
      return;
    }
    router.replace(destination);
    router.refresh();
  };

  if (!configured) {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-sodium/40 bg-sodium/10 p-5 text-sm leading-relaxed">
          <p className="font-semibold text-sodium">Sign-in isn’t connected yet</p>
          <p className="mt-1 text-haze">
            Add your Supabase keys to <code className="text-jasmine">.env.local</code> (see <code className="text-jasmine">docs/auth-setup.md</code>). Until then you can try
            the vibe interview as a guest.
          </p>
        </div>
        <Link href="/welcome" className="btn btn-primary w-full">
          Continue as guest <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        {step === "start" ? (
          <motion.div key="start" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.35, ease: EASE }} className="space-y-6">
            <button type="button" onClick={signInWithGoogle} disabled={busy !== null} className="btn w-full !bg-jasmine !py-3.5 text-ink hover:!bg-white">
              {busy === "google" ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <GoogleMark />}
              Continue with Google
            </button>
            <div className="flex items-center gap-4 text-xs text-haze" aria-hidden>
              <span className="h-px flex-1 bg-line" /> or use your email <span className="h-px flex-1 bg-line" />
            </div>
            <form onSubmit={sendCode} noValidate className="space-y-3">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">Email</span>
                <input
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  className="field !py-3.5"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  aria-invalid={!!error || undefined}
                  aria-describedby={error ? "signin-error" : undefined}
                />
              </label>
              <button type="submit" disabled={busy !== null} className="btn btn-primary w-full !py-3.5">
                {busy === "email" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Mail className="size-4" aria-hidden />}
                Email me a {OTP_LENGTH}-digit code
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div key="code" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.35, ease: EASE }} className="space-y-6">
            <button type="button" onClick={() => setStep("start")} className="flex items-center gap-2 text-sm text-haze hover:text-jasmine">
              <ArrowLeft className="size-4" aria-hidden /> Use a different email
            </button>
            <div>
              <p className="text-lg font-semibold">Check your inbox</p>
              <p className="mt-1 text-sm text-haze">
                We sent a {OTP_LENGTH}-digit code to <span className="text-jasmine">{email.trim()}</span>. Paste it below.
              </p>
            </div>
            <OtpInput length={OTP_LENGTH} value={code} onChange={setCode} onComplete={verify} invalid={!!error} disabled={busy === "verify"} />
            <button type="button" onClick={() => verify(code)} disabled={code.length !== OTP_LENGTH || busy !== null} className="btn btn-primary w-full !py-3.5">
              {busy === "verify" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              Verify and continue
            </button>
            <p className="text-center text-sm text-haze">
              Didn’t get it?{" "}
              <button type="button" onClick={() => sendCode()} disabled={cooldown > 0 || busy !== null} className="font-semibold text-jasmine underline-offset-4 hover:underline disabled:text-haze disabled:no-underline">
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Send a new code"}
              </button>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      <p id="signin-error" role="alert" className="mt-4 min-h-5 text-sm text-dusk">
        {error}
      </p>
    </>
  );
}
