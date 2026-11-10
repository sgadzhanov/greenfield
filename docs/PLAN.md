# Walk-streak app ("Разходки") — v1 web plan

## Context

Greenfield project in `/Users/gast/personal-projects/claude-walk-app` (empty, not yet a git repo).
A Bulgarian, phone-first web app where a person logs walks by hand and sees a month calendar,
current streak, longest streak and total active days. Points, badges and one weekly challenge
support the main motivator: personal consistency. No public leaderboard.

Decided by you: audience is you plus friends and family; Next.js + Supabase for web; v2 is a
mobile app (probably React Native); extras for v1 are **streak freeze** and **shareable streak card**.
You asked me to propose everything else. Everything below marked *(my call)* is mine to defend
and yours to overrule.

## What makes it awesome (design principles)

1. **Logging is one tap.** A big "Разходих се днес" button. Minutes and km are optional and
   added afterwards, never a gate. A second tap adds another walk for the same day.
2. **The streak is the hero.** Large number at the top with three clear states: not walked yet
   today (inviting), walked today (celebrating), at risk in the evening ("Остават 3 часа").
3. **Forgiving, not punishing.** Streak freezes absorb a missed day. When a streak does break,
   the copy is kind ("Нова серия започва днес") and there is a "Завръщане" badge for coming back.
4. **Honest.** A failed save looks failed and reverts. Nothing is faked as saved.
5. **Feels native on a phone.** Bottom navigation, 44px+ touch targets, dark mode, instant
   optimistic feedback, home-screen icon, small celebration animation on milestones.
6. **Real Bulgarian.** Warm tone, correct plurals ("1 ден" / "2 дни") via `Intl.PluralRules`,
   Monday-first calendar, month names via `Intl.DateTimeFormat('bg-BG')`.

## Rules *(my call, all of it)*

**Active day:** a date with at least one walk.

**Streak with freezes:** walk day by day from the first active date to today:
- active day → streak +1; every 7th streak day earns one freeze (bank max 2)
- missed day (not today) with streak > 0 and a freeze in the bank → spend it, day is "frozen",
  streak survives but does not grow
- missed day otherwise → streak resets to 0
- today without a walk never breaks the streak (the day is not over)

Frozen days show a snowflake on the calendar and do not count as active days.

**Points** come only from consistency, never from minutes or km (so nobody is pushed to
invent numbers): 10 per active day; streak milestones 7/30/100/365 give +50/+200/+500/+2000;
completed weekly challenge +50. Points map to a level name (Новак → Разходкаджия →
Пътешественик → Маратонец → Легенда).

**Badges (about 12):** first walk; streaks of 3/7/14/30/100; 10/50/100/365 total active days;
weekend (Sat + Sun in one week); comeback after a 7+ day break; 42 km total logged.

**Weekly challenge:** one per Mon–Sun week, picked from a list of 4 by week number, all
computable from dates alone (e.g. "5 различни дни", "събота и неделя", "3 поредни дни",
"понеделник, вторник и сряда"). Progress bar on the dashboard.

**Backfill:** any past date can be logged or edited, no future dates. No leaderboard means
cheating only fools yourself.

**Everything is derived, nothing is stored.** Streak, freezes, points, badges and challenge
progress are computed from the list of walk dates by one pure function. No counters to drift,
no cron job, edits and deletes just work. Ceiling: fine up to thousands of walks per user;
cache only if that is ever exceeded.

## Stack

- **Next.js** (latest stable, App Router, TypeScript, Tailwind) on Vercel
- **Supabase**: Postgres + Auth, `@supabase/ssr` for cookie sessions; Supabase CLI for the
  local stack (needs Docker) and migrations
- **No other runtime dependencies** *(my call)*: no UI kit, no state/query library, no ORM,
  no i18n framework. Native `<dialog>` for sheets, CSS for animations, `next/og` for the share image.
- Environments *(my call)*: local (Supabase CLI) + production. Staging is skipped at this scale;
  the redirect allow-list leaves room for it.

## Data model (one migration)

```
profiles  id uuid pk → auth.users (cascade), display_name text (1–50), timezone text default 'Europe/Sofia', created_at
walks     id uuid pk, user_id uuid default auth.uid() → auth.users (cascade),
          walked_on date, minutes int null (1–1440), distance_km numeric(5,2) null (>0, ≤100), created_at
          index (user_id, walked_on)
```

- RLS on both tables: a user reads and writes only their own rows; walk insert/update also
  rejects future dates.
- Trigger on `auth.users` insert creates the profile from signup metadata (name, browser timezone).
- Passwords exist only inside Supabase Auth.

## Screens

Public: `/` landing, `/register`, `/login`, `/check-email` (instructions + resend with 60s
countdown), `/forgot-password`, `/update-password`, `/auth/confirm` (route handler that verifies
the email token), `/auth/error` (invalid or expired link → resend).

Signed in, bottom nav with three tabs:
- **Днес** `/today`: streak hero, log button, freezes in bank, weekly challenge, month calendar
  (prev/next via `?m=YYYY-MM`), longest streak, total active days. Tap a day → sheet listing that
  day's walks with add / edit / delete.
- **Постижения** `/badges`: points, level, badge grid (earned and locked), share button.
- **Профил** `/profile`: change name, change password, logout.

## Auth behaviour (per your spec)

- Signup → always the same "check your email" screen (no hint whether the email exists).
- Login errors are one generic message: "Невалиден имейл или парола".
- Password policy set in Supabase Auth settings; the form mirrors the minimum length and maps
  Supabase's error codes to Bulgarian.
- Session refresh in `middleware.ts` (`proxy.ts` on newer Next) exactly as the current Supabase
  SSR guide shows; no custom JWT handling.
- The signed-in layout verifies the user on the server and redirects to `/login`; RLS is the
  real guard behind it.
- Logout is a server action: sign out, hard redirect. Signed-in pages send
  `Cache-Control: no-store` so Back cannot show the previous user's data. There is no client
  data cache to clear because none exists.
- Expired session during a save → the action returns an error, the UI reverts and sends the
  user to login.
- Password reset: request → email → `/auth/confirm` → `/update-password` → sign out → login.
- Email templates in Bulgarian, kept in `supabase/templates/`.

## File layout

```
app/
  layout.tsx  page.tsx  manifest.ts
  (auth)/{login,register,check-email,forgot-password,update-password}/page.tsx
  (auth)/actions.ts
  auth/confirm/route.ts   auth/error/page.tsx
  (app)/layout.tsx                      auth guard + bottom nav
  (app)/{today,badges,profile}/page.tsx
  (app)/actions.ts                      logWalk, updateWalk, deleteWalk, updateName, logout
  share/card/route.tsx                  PNG via next/og
lib/
  supabase/server.ts  supabase/middleware.ts
  stats.ts  stats.test.ts               pure rules: streak, freezes, points, badges, challenge
  bg.ts                                 plural + date helpers
middleware.ts
supabase/
  config.toml  migrations/0001_init.sql  templates/*.html  tests/rls.test.sql
docs/PLAN.md                            copy of this plan
```

## Build order (each step leaves something working)

1. **Scaffold**: `git init`, `create-next-app`, `supabase init`, save this plan to `docs/PLAN.md`.
   Read the current Supabase "Next.js server-side auth" guide first and follow its file names.
2. **Database**: migration with tables, RLS, trigger; one pgTAP test proving user B cannot
   read or write user A's walks (`supabase test db`).
3. **Auth**: all screens and flows above, Bulgarian email templates. Verify locally against the
   Supabase CLI mail inbox.
4. **Rules**: `lib/stats.ts` written test-first (streak, freeze earn/spend, today-not-over,
   reset, longest, points, badges, weekly challenge, month and timezone edges).
5. **Днес screen**: hero, one-tap log with optimistic update and honest failure, calendar, day sheet.
6. **Постижения + Профил**: badge grid, level, new-badge celebration (compare stats before and
   after a log), name change, logout.
7. **Share card**: `/share/card` renders name, streak and total days as a PNG; the button uses the
   Web Share API with download as fallback. Needs a bundled font with Cyrillic glyphs.
8. **Polish**: dark mode, empty and error states, reduced-motion, web manifest and icons.
9. **Deploy**: Vercel + hosted Supabase project, SMTP, redirect allow-list (localhost +
   production), password policy, then run every auth flow once with a real email.

## You need to provide (before step 9)

- Supabase and Vercel accounts (free tiers are enough).
- **A domain and an SMTP provider** (e.g. Resend free tier). As far as I know, Supabase's
  built-in mailer only delivers to the project's own team members and is heavily rate-limited,
  so friends would never receive confirmation emails without this. I'll confirm in the dashboard
  at setup.
- Docker running locally for the Supabase CLI.

## Deliberately not in v1

Leaderboards or any social feed (spec forbids), GPS or step counting, push or email reminders,
offline mode / service worker, year heatmap, staging environment, self-service account deletion
(done by hand in the Supabase dashboard on request), admin tools.

## v2 mobile (how v1 prepares for it)

Expo app using `supabase-js` against the same project: same tables, same RLS, same accounts.
It imports `lib/stats.ts` and `lib/bg.ts` unchanged (moved into a shared package at that point,
not before). New work then: native screens, deep links for confirmation and reset emails, secure
session storage. Mobile-only wins worth doing then: push reminders when the streak is at risk,
step import from Apple Health / Health Connect, a home-screen widget.

v1 keeps this cheap by three habits only: rules in pure TypeScript, authorization in RLS,
server actions that do nothing beyond validate-and-write.

## Verification

- `node --test lib/stats.test.ts` (or vitest if the Node version cannot run TS directly): all rule cases pass.
- `supabase test db`: RLS isolation test passes.
- Browser at phone width (375px), local stack: register → confirm via local inbox → log walk →
  streak shows 1 → add second walk same day → still 1 active day → backfill yesterday → streak 2 →
  delete → streak 1 → logout → Back shows login, not data → reset password → login with new password.
- Expired / reused confirmation link lands on the error screen with resend.
- Simulate a failed save (stop local Supabase) → UI reverts and shows an error.
- Share card opens the phone share sheet with a correct Cyrillic image.
- After deploy: full signup and reset flow with a real email address on production.
