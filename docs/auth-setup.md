# Sign-in setup (Supabase + Google + 6-digit email codes)

Wibe signs members in two ways:

- **Continue with Google**: Google verifies the email, so members go straight in.
- **Email code**: Supabase emails a 6-digit code; the member pastes it into the six boxes.

Until the keys below are set, the app runs in guest mode (the vibe interview and profile are kept on the device).

> Use a **new Supabase project for Wibe**. Do not reuse another client's project.

## 1. Create the Supabase project

1. Create a project at https://supabase.com/dashboard (region close to Pakistan, e.g. Mumbai or Singapore).
2. **Settings → API**: copy the Project URL and the anon/publishable key.
3. Create `.env.local` in the repo root:

   ```bash
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
   ```

4. Apply the database migration `supabase/migrations/20260926000000_profiles.sql` (SQL editor → paste → run, or `npx supabase db push` after `npx supabase link`). It creates the private `profiles` table with row-level security and a trigger that creates a profile on sign-up.

## 2. Turn on 6-digit email codes

1. **Authentication → Sign In / Providers → Email**: enabled. Set **Email OTP length** to `6`.
2. **Authentication → Email Templates → Magic Link**: replace the body so it sends the code instead of a link, for example:

   ```html
   <h2>Your Wibe code</h2>
   <p>Enter this code to sign in. It expires in 1 hour.</p>
   <p style="font-size:32px;letter-spacing:8px;font-weight:700">{{ .Token }}</p>
   ```

   Do the same for **Confirm signup** so first-time members also get a code.
3. For production volume, set up custom SMTP (e.g. Resend) under **Authentication → Emails → SMTP**. Supabase's built-in mailer is rate-limited and meant for testing.

## 3. Turn on Google

1. In Google Cloud Console → **APIs & Services → Credentials**, create an **OAuth client ID** (Web application).
   - Authorized JavaScript origins: `http://localhost:3000` and your production URL.
   - Authorized redirect URI: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
2. Configure the OAuth consent screen (app name "Wibe", support email, scopes: email, profile, openid).
3. In Supabase → **Authentication → Sign In / Providers → Google**: enable it and paste the client ID and secret.
4. **Authentication → URL Configuration**:
   - Site URL: `http://localhost:3000` (production URL later)
   - Redirect URLs: `http://localhost:3000/auth/callback` and `https://YOUR-DOMAIN/auth/callback`

## 4. Test

```bash
npm run dev
```

1. Open http://localhost:3000/signin.
2. **Email path**: enter your email → you receive a 6-digit code → paste it → you land on the vibe check (`/welcome`).
3. **Google path**: Continue with Google → consent → back on `/welcome`.
4. Finish the vibe check → your profile at `/profile` shows your vibe ring and tags; in Supabase the `profiles` row has `vibe_archetype`, `vibe_tags` and `interview_completed_at`.
5. Sign out from `/profile`; signing back in skips the vibe check and goes to `/discover`.

## How it's built

| Piece | File |
|---|---|
| Sign-in UI (Google, email, 6-box code input, resend timer) | `src/components/auth/SignIn.tsx`, `OtpInput.tsx` |
| Google OAuth code exchange | `src/app/auth/callback/route.ts` |
| Session refresh on every request (Next 16 `proxy`) | `src/proxy.ts` |
| Server/browser Supabase clients | `src/lib/supabase/` |
| Vibe questions and scoring (tested) | `src/lib/vibe.ts`, `vibe.test.mjs` |
| Saving results (validated and re-scored on the server) | `src/app/actions/profile.ts` |
| Profile ring and tags | `src/components/vibe/` |

## Privacy rules built in

- Profiles are readable only by their owner (RLS). Other members and partners cannot see them in the pilot.
- Tags come only from answers the member picked; the server recomputes them and stores nothing inferred.
- The interview never asks about sexual orientation, gender, religion or health (a unit test enforces this).
- Members can hide any tag and retake the interview.
