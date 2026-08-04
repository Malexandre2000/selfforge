# SelfForge — Product Owner Handoff

**Status as of 2026-08-04: MVP complete, feature-frozen, in private beta.** This document is
written so a senior engineer with no prior context can maintain, deploy, and debug this
project without reading the full codebase first. Read this top to bottom once, then use it
as a reference.

Live production URL: **https://selfforge-mu.vercel.app**
GitHub: **https://github.com/Malexandre2000/selfforge** (branch `main`)
Vercel project: `selfforge` (team `xxtypicalmattxx-1782s-projects`)

---

## 1. What this product is

SelfForge is an AI self-improvement coaching SaaS: users complete an onboarding
questionnaire (fitness/nutrition/skincare/style goals), get an AI-generated daily plan of 7
missions, track habits and physical progress (with before/after photos), and chat with a
Claude-powered AI coach that remembers their profile. It's subscription-gated (Stripe), and
currently running a private, invite-only beta layer on top of the paid product.

There are two client apps sharing one backend: a **Next.js web app** (fully built, deployed,
paying customers can use it today) and an **Expo/React Native mobile app** (built and
functional in local dev, **never submitted to the App Store or Play Store** — see §15).

---

## 2. Architecture overview

```
┌─────────────────┐     ┌──────────────────┐
│   Web (Next.js)  │     │  Mobile (Expo)    │
│   Vercel-hosted  │     │  local dev only   │
└────────┬─────────┘     └────────┬─────────┘
         │  tRPC over HTTP (typed end-to-end)
         └─────────────┬──────────┘
                        ▼
        ┌───────────────────────────────┐
        │  Next.js Route Handlers         │
        │  /api/trpc/[trpc]  (tRPC router)│
        │  /api/chat          (streaming) │
        │  /api/webhooks/stripe           │
        │  /api/upload/progress-photo     │
        │  /api/photos/[...pathname]      │
        │  /api/health                    │
        └───────┬───────────┬────────────┘
                 │           │
         ┌───────▼──┐   ┌────▼─────┐   ┌────────────┐  ┌──────────┐  ┌────────┐
         │  Neon     │   │  Clerk   │   │  Stripe    │  │ Anthropic│  │ Vercel │
         │  Postgres │   │  (auth)  │   │  (billing) │  │ (Claude) │  │  Blob  │
         └───────────┘   └──────────┘   └────────────┘  └──────────┘  └────────┘
                                                                          + Sentry (errors)
                                                                          + Resend (email, not yet live)
                                                                          + Vercel Analytics
```

**Important:** the repo root has an `ARCHITECTURE.md` from the original planning phase. It
describes an *aspirational* v1 architecture (Cloudflare R2, Trigger.dev background jobs,
PostHog, RevenueCat, pgvector semantic memory) that was **not what got built**. Treat this
`HANDOFF.md` as the source of truth for what's actually running; `ARCHITECTURE.md` is
historical context only, not a current-state document. The most consequential deviations:

| Planned (ARCHITECTURE.md) | Actually built |
|---|---|
| Cloudflare R2 for photos | **Vercel Blob** (private access, signed URLs) |
| Trigger.dev nightly job generates plans | Daily plan generated **lazily on first request of the day** (see §7 `missions.getToday`) |
| PostHog analytics | **Vercel Web Analytics** (simpler, no event pipeline) |
| RevenueCat for mobile IAP | **Not implemented** — mobile has no working paywall |
| pgvector semantic memory log | **Not implemented** — the AI coach's only memory is the onboarding profile + last 30 raw chat messages, no summarization/embedding layer |
| Mobile app store distribution | **Not implemented** — mobile runs in Expo dev only |

None of this is a defect to "fix" reflexively — it's what the team scoped down to in order to
ship. It's listed here so nobody rediscovers it the hard way.

---

## 3. Tech stack

**Monorepo:** npm workspaces + Turborepo (`turbo.json`). `apps/web`, `apps/mobile`,
`packages/types` (shared Zod schemas), `packages/design-tokens` (shared color/spacing/type
scale, currently only lightly used).

**Web app** (`apps/web`) — this is the whole product today:
- Next.js **16.2.11** (App Router, Turbopack). **This is not the Next.js most engineers/LLMs
  have training data for** — file conventions differ from Next 13/14/15 in places. The repo
  literally ships an `AGENTS.md` at `apps/web/AGENTS.md` warning of this; read
  `node_modules/next/dist/docs/` before assuming an API. The most concrete gotcha already
  hit: **`middleware.ts` is now `src/proxy.ts`** and the build output labels it "Proxy
  (Middleware)", not "Middleware".
- React 19.2.4, TypeScript 5.7
- Tailwind CSS v4
- tRPC v11 (`@trpc/server`, `@trpc/client`, `@trpc/react-query`) + TanStack Query v5
- Drizzle ORM 0.45 + `drizzle-kit` 0.31, Postgres via `@neondatabase/serverless`
- Clerk v7 (`@clerk/nextjs`) for auth
- Stripe SDK v22
- `@anthropic-ai/sdk` v0.115 — Claude Opus 4.8 (`claude-opus-4-8`), streaming
- `@sentry/nextjs` v10
- `@vercel/blob` v2, `@vercel/analytics` v2
- `resend` v6 (installed, integrated, **not activated** — no API key set yet)
- Zod v4 for all input validation, shared between client and server via `packages/types`

**Mobile app** (`apps/mobile`):
- Expo ~57, Expo Router, React Native 0.86, React 19.2.3
- NativeWind v4 (Tailwind syntax for RN)
- `@clerk/clerk-expo` for auth, same tRPC client hitting the web app's API
- No push notifications, no RevenueCat, no EAS build config committed

**Infra:**
- Hosting: **Vercel** (web app + all API routes)
- Database: **Neon** (serverless Postgres, single branch — see §17 for backup implications)
- File storage: **Vercel Blob** (private access)
- Auth: **Clerk** (hosted, both web + mobile SDKs against one user base)
- Payments: **Stripe** (web only)
- Errors: **Sentry**
- AI: **Anthropic API**

---

## 4. Repository structure

```
/
├── ARCHITECTURE.md        ← original plan (historical, see §2)
├── HANDOFF.md              ← this document
├── turbo.json               ← task pipeline + the canonical list of env vars (globalEnv)
├── package.json             ← workspace root
├── apps/
│   ├── web/                 ← THE product. Next.js app.
│   │   ├── src/app/           ← routes (App Router)
│   │   │   ├── (app)/          ← authenticated app shell: dashboard, habits, missions,
│   │   │   │                     progress, ai-coach, profile, settings, roadmap, admin
│   │   │   ├── beta/            ← public beta landing, join, redeem, faq
│   │   │   ├── api/             ← REST route handlers (see §7)
│   │   │   ├── sign-in/, sign-up/, pricing/, privacy/, terms/, onboarding/
│   │   ├── src/server/
│   │   │   ├── db/              ← schema.ts, migrations/, client.ts
│   │   │   ├── routers/         ← one file per tRPC router, combined in _app.ts
│   │   │   ├── billing/          access.ts    — hasActiveAccess(), the entitlement gate
│   │   │   ├── beta/             access.ts, codes.ts — beta membership + admin allowlist
│   │   │   ├── security/         rateLimit.ts
│   │   │   ├── stripe/           client.ts
│   │   │   ├── email/            resend.ts
│   │   │   ├── ai/               generateDailyPlan.ts
│   │   │   ├── trpc.ts           ← procedure tiers: public/protected/paid/admin
│   │   │   └── context.ts
│   │   ├── src/proxy.ts        ← Clerk auth middleware + CSP (NOT middleware.ts — see §3)
│   │   ├── src/components/     ← one folder per feature area
│   │   ├── src/sentry.server.config.ts, sentry.edge.config.ts
│   │   ├── drizzle.config.ts
│   │   ├── next.config.ts       ← security headers + Sentry wrapper
│   │   └── scripts/setup-stripe.mjs  ← one-time script that created the Stripe products/prices
│   └── mobile/               ← Expo app, functional in dev, never shipped to app stores
└── packages/
    ├── types/                ← Zod schemas shared by web + mobile (OnboardingProfile, etc.)
    └── design-tokens/
```

---

## 5. Environment variables

Canonical list lives in `turbo.json` → `globalEnv`. Actual values live in
`apps/web/.env.local` (gitignored, never committed) for local dev, and in Vercel's
Environment Variables settings for production/preview.

| Variable | Purpose | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk client SDK key | Clerk dashboard → API Keys |
| `CLERK_SECRET_KEY` | Clerk server SDK key | Clerk dashboard → API Keys |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` / `SIGN_UP_URL` | Route Clerk redirects to `/sign-in`, `/sign-up` | Static, already set |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` / `SIGN_UP_FALLBACK_REDIRECT_URL` | Post-auth landing (`/dashboard`) unless overridden (e.g. beta invite flow uses `forceRedirectUrl`) | Static |
| `DATABASE_URL` | Neon Postgres connection string | Neon dashboard → Connection Details |
| `ANTHROPIC_API_KEY` | Claude API access (daily plans + AI coach chat) | console.anthropic.com |
| `STRIPE_SECRET_KEY` | Stripe server SDK key | Stripe dashboard → Developers → API keys |
| `STRIPE_PRICE_MONTHLY` / `STRIPE_PRICE_ANNUAL` | Price IDs for the two subscription plans | Created by `scripts/setup-stripe.mjs`, or Stripe dashboard → Products |
| `STRIPE_WEBHOOK_SECRET` | Verifies webhook signatures | Stripe dashboard → Webhooks → your endpoint → Signing secret |
| `NEXT_PUBLIC_APP_URL` | Canonical app URL, used in emails, Stripe redirect URLs, metadata | `https://selfforge-mu.vercel.app` in prod |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry ingestion endpoint | Sentry dashboard → Project Settings |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob write access | Vercel dashboard → Storage → Blob → your store |
| `ADMIN_EMAILS` | Comma-separated allowlist for `/admin` access | You set this manually — see §12 |
| `RESEND_API_KEY` | Sends welcome + beta invite emails | **Not yet set in production.** resend.com → API Keys |

**Not yet in `globalEnv` but referenced in code and worth knowing about:**
- `SENTRY_AUTH_TOKEN` — not configured anywhere. Source maps are explicitly disabled in
  `next.config.ts` (`sourcemaps: { disable: true }`) because of this. Sentry error reports
  currently show minified stack traces. Setting this up is a good low-effort improvement
  (see §16).

To pull the full current production env into a local file for reference (never commit the
result): `vercel env pull`.

---

## 6. Database schema

Postgres via Neon, managed with Drizzle ORM. Schema source of truth:
`apps/web/src/server/db/schema.ts`. 8 migrations applied to date (`0000`–`0007`), tracked in
`apps/web/src/server/db/migrations/`.

**Core product tables:**
| Table | Purpose | Notes |
|---|---|---|
| `users` | One row per Clerk user (`id` = Clerk user ID) | Created lazily on first authenticated API call, not on Clerk signup webhook |
| `onboarding_profiles` | The questionnaire answers (age, gender, height/weight, goal, physique, skin/hair concerns, budget, confidence 1–10, sleep hours, gym experience) | 1:1 with `users`, PK is `user_id` |
| `daily_plans` | One row per user per day — the 7 generated mission descriptions (workout, nutrition, skincare, grooming, confidence, habit, motivation) | Unique on `(user_id, date)`; generated lazily on first `missions.getToday` call of the day, not by a cron job |
| `mission_completions` | Checkbox state per category per day | Unique on `(user_id, date, category)` |
| `habits` | User-defined habits | |
| `habit_entries` | Daily completion per habit | Unique on `(habit_id, date)` |
| `progress_entries` | Weight/measurements + before/after photo **Blob pathnames** (not URLs — see §14) | Unique on `(user_id, date)` |
| `chat_messages` | AI Coach conversation history | Indexed on `(user_id, created_at)`; last 30 fed back into Claude context on every message, no summarization |
| `streak_state` | Current/longest streak, last active date | 1:1 with `users` |

**Billing:**
| Table | Purpose | Notes |
|---|---|---|
| `subscriptions` | Mirrors Stripe subscription state, **kept in sync only by the webhook** | Never trust client state for entitlement; PK is `user_id`, unique on `stripe_customer_id` |

**Infra:**
| Table | Purpose |
|---|---|
| `api_rate_limits` | Fixed-window counter, PK `(key, window_start)` — see §16, this table grows unbounded |

**Beta system (Phase 9):**
| Table | Purpose | Notes |
|---|---|---|
| `waitlist_entries` | Signups, referral attribution, invite state | Unique on `email`, `referral_code`, `invite_code`. `invite_code` gates actual access. |
| `feedback_entries` | Feedback + bug reports from the in-app widget | Indexed on `user_id` |
| `feature_requests` | Public roadmap suggestions | |
| `feature_request_votes` | Upvotes, unique on `(feature_request_id, user_id)` | |

All foreign keys to `users.id` cascade on delete (except `waitlist_entries.joined_user_id`,
which sets NULL) — deleting a `users` row cleans up everything downstream automatically.

**Running migrations:** the Drizzle CLI binary is hoisted to the monorepo root, not
`apps/web/node_modules/.bin`. Run from `apps/web`:
```bash
node --env-file=.env.local ../../node_modules/.bin/drizzle-kit generate   # after schema.ts changes
node --env-file=.env.local ../../node_modules/.bin/drizzle-kit migrate    # apply to DATABASE_URL
```
`npm run db:studio` (from `apps/web`) opens Drizzle Studio for a GUI on the current
`DATABASE_URL`.

---

## 7. API endpoints

### tRPC (`/api/trpc/[trpc]`, single endpoint, all routers combined in `routers/_app.ts`)

Four procedure tiers, defined in `server/trpc.ts` — **always know which tier a given
procedure uses when debugging an access issue**:
- **`publicProcedure`** — no auth
- **`protectedProcedure`** — requires signed-in Clerk user; also enforces the per-user rate
  limit (120 req/min, fixed window) and lazily creates the `users` row
- **`paidProcedure`** — `protectedProcedure` + requires `hasActiveAccess()` (active/trialing
  subscription **or** beta member)
- **`adminProcedure`** — `protectedProcedure` + email must be in `ADMIN_EMAILS`

| Router | Procedures | Tier |
|---|---|---|
| `onboarding` | `get`, `submit` | protected |
| `missions` | `getToday`, `toggle` | protected (free-tier cap enforced inline — see below) |
| `habits` | `list`, `toggleToday` | paid |
| `progress` | `get`, `logEntry` | paid |
| `dashboard` | `get` | paid |
| `aiCoach` | `getMessages` | paid (message *sending* is a separate REST route, not tRPC — see below) |
| `billing` | `getStatus`, `createCheckoutSession`, `createPortalSession` | protected |
| `waitlist` | `join` (public), `checkInvite` (public), `adminList`, `adminInvite` | mixed |
| `beta` | `redeemInvite` | protected |
| `feedback` | `submit` (protected), `adminList`, `adminUpdateStatus` (admin) | mixed |
| `featureRequests` | `list`, `create`, `toggleVote` (protected), `adminUpdateStatus` (admin) | mixed |
| `admin` | `kpis` | admin |

**`missions.toggle` free-tier enforcement:** unsubscribed, non-beta users get exactly **one**
completed mission ever, tracked via `hasCompletedFirstMission()` in
`server/billing/access.ts`, before the API throws `FORBIDDEN`. This is intentionally
`protectedProcedure`, not `paidProcedure`, because free users need to reach it at all to get
their one free taste.

### REST routes (outside tRPC, listed with why)

| Route | Method | Purpose |
|---|---|---|
| `/api/chat` | POST | Streaming AI Coach responses. Not tRPC because tRPC doesn't stream raw text well; hand-rolled `ReadableStream` over Claude's SDK stream. Enforces `hasActiveAccess` + a 30 msg/hour cap independent of subscription (cost control against runaway usage during the 7-day free trial). |
| `/api/webhooks/stripe` | POST | Stripe subscription lifecycle → upserts `subscriptions` table. Verifies signature via `STRIPE_WEBHOOK_SECRET`. Handles `checkout.session.completed`, `customer.subscription.{created,updated,deleted}`. |
| `/api/upload/progress-photo` | POST, DELETE | Uploads before/after photos to Vercel Blob (private), replaces the previous photo of that kind for the day, best-effort deletes the old blob. 8MB cap, image MIME types only. |
| `/api/photos/[...pathname]` | GET | Proxies a private Blob object back to the authenticated owner (Blob is private, so the browser can't hit Vercel Blob URLs directly). |
| `/api/health` | GET | `SELECT 1` against Postgres, returns `{status: "ok"}` or 503. Used by Sentry/uptime monitoring. |
| `/api/trpc/[trpc]` | GET, POST, OPTIONS | The tRPC endpoint itself. Hand-rolls CORS (allowlist of `NEXT_PUBLIC_APP_URL` + `localhost:8081` for Expo dev; permissive in non-production) since tRPC's fetch adapter doesn't do CORS for you. |

---

## 8. Authentication flow

**Provider:** Clerk (`@clerk/nextjs` v7 on web, `@clerk/clerk-expo` on mobile), one shared
user base.

1. `src/proxy.ts` (this is Next 16's renamed `middleware.ts` — see §3) wraps every request in
   `clerkMiddleware()`. It explicitly protects `/dashboard`, `/ai-coach`, `/progress`,
   `/habits`, `/missions`, `/profile`, `/settings` via `auth.protect()`. **`/roadmap` and
   `/admin` are *not* in this matcher** — they render client-side and rely on the tRPC
   procedure tier (`protectedProcedure`/`adminProcedure`) for actual protection, plus a UX-only
   client check. This is intentional (see `admin/page.tsx` comment) but means an
   unauthenticated visit to `/admin` returns 200 with an empty/loading shell rather than a
   redirect — not a security hole, just worth knowing when debugging "why does this page
   look wrong before I sign in."
2. Clerk also sets the base Content-Security-Policy for the app; `proxy.ts` extends it with
   `connect-src` for Sentry's ingest domain.
3. On the server, every protected tRPC procedure calls `auth()` (via `context.ts` →
   `createContext()`) to get `userId`, then `protectedProcedure`'s middleware lazily inserts
   a `users` row if one doesn't exist yet (`onConflictDoNothing`). **There is no Clerk
   webhook wired up** — user rows are created on first authenticated API call, not on
   sign-up. A user who signs up but never calls a protected endpoint has no `users` row.
4. Admin access is **not** a Clerk role/permission — it's a plain email-string check
   (`isAdminEmail()` in `server/beta/access.ts`) against the `ADMIN_EMAILS` env var, resolved
   by fetching the user's primary email from Clerk on every `adminProcedure` call. Changing
   who's an admin means editing an env var and redeploying (or `vercel env` + redeploy) —
   there is no in-app UI for it.
5. Mobile auth uses the same Clerk instance; the Expo app's tRPC client sends the Clerk
   session token as a Bearer token rather than relying on cookies (this is also why the tRPC
   CORS allowlist includes `localhost:8081`, Expo's default dev port).

**Dev-instance gotcha (bit the team repeatedly during this build):** Clerk's dev/test
instance session identity can drift across dev-server restarts — the signed-in test account
in the browser doesn't always match what you'd expect. When debugging an auth/permission
issue locally, always confirm with
`window.Clerk.user?.primaryEmailAddress?.emailAddress` in the browser console before assuming
it's a code bug.

---

## 9. Stripe integration

- **Products/prices** were created once via `apps/web/scripts/setup-stripe.mjs` (run
  manually, not part of any pipeline) — two prices, monthly and annual, both with a 7-day
  trial baked into `subscription_data.trial_period_days` at checkout-session creation time
  (`server/routers/billing.ts`), not configured on the Price object itself.
- **Checkout:** `billing.createCheckoutSession` creates a Stripe Checkout session
  (`mode: "subscription"`), reusing the existing `stripe_customer_id` if the user has one.
  `client_reference_id` carries the Clerk `userId` through to the webhook.
- **Customer Portal:** `billing.createPortalSession` — lets users manage/cancel their own
  subscription without any custom UI.
- **Webhook** (`/api/webhooks/stripe`) is the **only** writer of the `subscriptions` table.
  It verifies the signature, then upserts on `checkout.session.completed` (subscription mode
  only) and all three `customer.subscription.*` events. **This means the webhook endpoint
  must be correctly registered in Stripe's dashboard pointing at production, with a matching
  `STRIPE_WEBHOOK_SECRET`, or subscriptions will silently never activate** even though
  Checkout completes successfully client-side. This was registered during Phase 3 — verify
  it's still live in Stripe dashboard → Developers → Webhooks if billing ever seems "stuck."
- **Entitlement check:** `hasActiveAccess()` in `server/billing/access.ts` is the single
  source of truth for "does this user have paid access" — `status === "trialing" || "active"`
  **or** beta member. Every gate in the app (server-side `paidProcedure`, the client-side
  `PaywallGate` component via `billing.getStatus`, `/api/chat`, the photo upload route) calls
  this one function. If you ever need to change what counts as "has access," change it here
  — do not duplicate the logic (this was a real bug caught and fixed during Phase 9: the
  paywall UI once computed access independently of the server gate and could show the wrong
  screen to beta users).
- Test mode is currently in use (`sk_test_...` keys). **Switching to live mode requires:**
  new live API keys, re-running (or manually recreating) the products/prices in live mode,
  updating `STRIPE_PRICE_MONTHLY`/`ANNUAL`, and registering a new live-mode webhook endpoint
  with its own signing secret.

---

## 10. Sentry integration

- `@sentry/nextjs` wraps `next.config.ts` via `withSentryConfig()`.
- Config files: `src/sentry.server.config.ts`, `src/sentry.edge.config.ts` (no client config
  file was needed/added — check current Sentry Next.js docs if client-side error capture
  seems to be missing, since the SDK's expected file set changes across versions).
- DSN comes from `NEXT_PUBLIC_SENTRY_DSN`.
- **Source maps are explicitly disabled** (`sourcemaps: { disable: true }` in
  `next.config.ts`) because no `SENTRY_AUTH_TOKEN` is configured. This means production
  error stack traces in the Sentry dashboard are minified/unreadable. Fixing this is cheap:
  create a Sentry auth token, add `SENTRY_AUTH_TOKEN` to Vercel env, remove the
  `sourcemaps: { disable: true }` override.
- `/api/health` exists specifically to give Sentry (or any uptime monitor) a lightweight
  DB-connectivity check independent of application errors.

---

## 11. Vercel Blob storage

- Used exclusively for progress photos (before/after), via `@vercel/blob`.
- **Access mode is `private`** — objects are not publicly reachable by their Blob URL.
  Reading a photo goes through `/api/photos/[...pathname]`, which checks Clerk auth before
  proxying the bytes back. Do not switch this to `access: "public"` without deliberately
  deciding that's acceptable — these are sensitive personal photos.
- Pathname convention: `progress-photos/{userId}/{before|after}-{timestamp}.{ext}`.
- `progress_entries.before_photo_url` / `after_photo_url` columns store the **Blob pathname**,
  not a URL — despite the column name. Don't be fooled by the naming when reading the
  schema.
- Upload replaces the previous photo of that kind for the *current day* only (one before +
  one after photo per day, per the `unique(user_id, date)` constraint on `progress_entries`);
  the old blob is deleted best-effort (failure there doesn't fail the request, just leaves an
  orphan — see §16).
- `BLOB_READ_WRITE_TOKEN` is scoped to one Blob store per Vercel project; regenerate it from
  Vercel → Storage → Blob if it's ever rotated, and update the env var everywhere.

---

## 12. Deployment process

**Vercel project is already linked** (`apps/web/.vercel/project.json`, project
`selfforge`, org `xxtypicalmattxx-1782s-projects`). GitHub is connected as the remote
(`Malexandre2000/selfforge`), but deploys in this project's history have generally been
triggered **manually via the Vercel CLI**, not by GitHub push-to-deploy — check Vercel
project settings to confirm whether auto-deploy-on-push is enabled before assuming a `git
push` alone will ship anything.

**Standard deploy:**
```bash
cd /path/to/repo/root        # NOT apps/web — vercel.json / project root expects repo root
npx vercel --prod --yes
```
Running this from inside `apps/web` fails with a "path does not exist" error — the Vercel
project's root directory setting expects to be invoked from the monorepo root and resolves
`apps/web` itself.

**Before deploying, always run from `apps/web`:**
```bash
npx tsc --noEmit -p tsconfig.json
npx eslint src --max-warnings=0
npm run build
```
All three must be clean. (Two pre-existing `react/no-unescaped-entities` lint errors exist in
`AICoachChat.tsx` and `FinalCta.tsx` as of this handoff — cosmetic, not blocking, safe to fix
opportunistically.)

**Environment variables** are managed via `vercel env add <NAME> production` (interactive —
pipe the value in, e.g. `printf 'value' | npx vercel env add NAME production`) or through the
Vercel dashboard. After adding/changing one, you must **redeploy** for it to take effect —
existing deployments don't pick up new env vars retroactively.

**Database migrations are not part of the deploy pipeline** — they must be run manually
against production `DATABASE_URL` before or after deploying code that depends on the new
schema (see §6 for the exact command). Neon is a single environment here, no separate
staging DB — be careful running migrations, there's no safety net.

**Pushing to GitHub:** this environment has no persistent GitHub credentials configured (by
design — nothing is stored between sessions). Pushing requires a one-time Personal Access
Token pasted at push time. This is a deliberate security posture, not a bug to fix.

---

## 13. Admin dashboard

URL: `/admin` (inside the authenticated app shell, linked... actually **not linked in the
sidebar** — it's a direct-URL-only page, intentionally not discoverable via navigation).

**Access control:** email must appear in the `ADMIN_EMAILS` env var (comma-separated,
case-insensitive match) — checked server-side on every `adminProcedure` call via a live
Clerk API lookup, not cached, not stored in the DB. Current production admins:
`xxtypicalmattxx@gmail.com`, `matthew.duchatellier@gmail.com`.

**Tabs** (`components/admin/AdminDashboard.tsx`):
- **Overview** — KPI tiles: waitlist signups, invited, joined, activation rate, feedback
  received, bug reports, feature requests. All computed live via `admin.kpis` (simple
  `count()` queries, no caching/warehouse — fine at current scale, revisit if the admin page
  ever feels slow).
- **Waitlist** — every signup, referral count (computed in-memory server-side, not a SQL
  aggregate — fine at hundreds of rows, would need rewriting as a real join/group-by past
  low thousands), one-click **Invite** button per row (generates an invite code, flips
  status to `invited`, attempts to send the invite email via Resend — see §14).
- **Feedback** — every feedback/bug submission with a status dropdown
  (New/Reviewed/Resolved).
- **Roadmap** — every feature request with vote count and a status dropdown
  (Open/Planned/Shipped/Declined) — the same status shown publicly on `/roadmap`.

There is no audit log of admin actions (who invited whom, who changed a status) — if that
matters later, it needs to be added.

---

## 14. Beta workflow

The beta layer sits **on top of** the paid product, not instead of it — invited beta users
get `hasActiveAccess() === true` for free, without ever touching Stripe, by being a "joined"
row in `waitlist_entries` (see §9's note on `hasActiveAccess`).

**End-to-end flow:**
1. Someone visits `/beta`, submits email (+ optional name, + optional `?ref=CODE` from a
   share link) → `waitlist.join` → new `waitlist_entries` row, status `waiting`, gets their
   own unique `referral_code`.
2. Admin reviews `/admin` → Waitlist tab, clicks **Invite** on someone → `waitlist.adminInvite`
   generates an `invite_code`, sets status `invited`, attempts to send an invite email via
   Resend containing `{APP_URL}/beta/join?code={invite_code}`.
3. **Resend is not yet activated in production** (`RESEND_API_KEY` unset) — the email send
   silently no-ops with a `console.warn`, nothing breaks, but **no email actually goes out
   right now**. Until the key is set, invite links must be copied manually (e.g. from the DB)
   and sent by hand.
4. Invitee opens `/beta/join?code=X` → code validated via `waitlist.checkInvite` → Clerk
   `<SignUp>` with `forceRedirectUrl=/beta/redeem?code=X` → after signup, `/beta/redeem`
   calls `beta.redeemInvite` → sets status `joined`, `joined_user_id`, `joined_at`, attempts
   welcome email (same Resend caveat) → redirects to `/onboarding`.
5. From that point on, this user has full product access, same as a paying subscriber, with
   no Stripe customer record at all.

**To activate email:** get a Resend API key (resend.com), `vercel env add RESEND_API_KEY
production`, redeploy. No code changes needed — `server/email/resend.ts` already checks for
the key's presence and degrades gracefully either way.

**Feedback + feature requests** (also part of the beta layer, but usable by any authenticated
user, not beta-gated specifically):
- Floating feedback widget on every authenticated page (`components/feedback/FeedbackWidget.tsx`)
  → `feedback.submit`, captures `pathname` automatically.
- `/roadmap` — public feature request board, auto-upvotes your own submission, toggleable
  votes.

---

## 15. Known limitations

Ranked roughly by how likely each is to bite first:

1. **Mobile app is not shippable as-is.** No EAS build profile committed, no
   RevenueCat/native IAP (so mobile users can never actually pay), no push notifications
   wired despite being in the original plan, and the paywall/beta gating built in Phase 2/9
   was never surfaced in the mobile UI — a free mobile user hitting a `paidProcedure`
   endpoint just gets a raw `FORBIDDEN` error, no graceful paywall screen.
2. **No Clerk webhook.** `users` rows are created lazily on first API call, not on signup.
   Combined with no admin audit trail, this makes "how many people have ever signed up" hard
   to answer precisely from the DB alone — cross-reference Clerk's own dashboard if that
   number matters.
3. **Sentry source maps are off** — production stack traces are minified. See §10.
4. **Resend isn't live in production.** See §14 — beta invite/welcome emails currently don't
   send.
5. **`api_rate_limits` table grows forever.** Old fixed-windows are never pruned (see the
   comment in `server/security/rateLimit.ts`). Fine at current volume; needs either a
   periodic delete-old-rows job or a swap to a TTL-based store (Redis) before it becomes a
   real table-size concern.
6. **AI Coach has no real long-term memory.** It resends the onboarding profile plus the
   last 30 raw chat messages as context on every call — no summarization, no semantic
   recall. Fine for now; will degrade (cost + relevance) as conversation history grows long
   for retained users, and the originally-planned pgvector memory system was never built.
7. **Daily plans are generated lazily**, not by a scheduled job — the very first
   `missions.getToday` call of the day for a user pays the Claude generation latency
   synchronously. Not currently a problem at this scale; would matter if daily-plan
   generation ever needs to happen for everyone at once (e.g. a "what's my plan" push
   notification at 6am).
8. **No automated test suite.** All verification in this project's history has been manual
   (TypeScript + ESLint + build + hands-on browser testing). There is no CI pipeline, no unit
   tests, no e2e tests. Any future engineer should assume regressions are only caught by
   manual testing until this changes.
9. **Single Neon branch/environment** — no staging database separate from production.
   Migrations and any manual `db:studio` edits happen directly against prod data. See §17.
10. **Admin allowlist is an env var, not a DB-backed role system.** Fine for a handful of
    admins; would need real RBAC before opening admin access more broadly.
11. **Best-effort Blob cleanup** on photo replace/delete can leave orphaned files if the
    delete call fails (deliberately non-blocking so it never fails the user's request) — no
    periodic sweep exists to catch these.

---

## 16. Future roadmap (deferred, not scheduled)

Ideas that came up during the build and were deliberately deferred rather than built, to keep
scope tight. **None of this is planned work right now** — the current directive is to freeze
feature development and focus on user acquisition. Listed here so it isn't lost:

- Dark mode (a real beta user requested this via the feature-request board during testing)
- Referral rewards (currently referral is attribution-only — no incentive/unlock for
  referring someone)
- Real semantic memory for the AI Coach (pgvector or similar, per original architecture)
- Scheduled daily-plan generation (cron/background job instead of lazy-on-request)
- Mobile app store submission + native IAP (RevenueCat) + push notifications
- Clerk signup webhook → eager `users` row creation + eager welcome email trigger
- Sentry source map upload (`SENTRY_AUTH_TOKEN`)
- Admin action audit log
- Real RBAC for admin instead of an env-var email allowlist
- Automated test suite / CI
- Rate-limit table cleanup job or migration to a TTL-based store
- Staging database / preview-branch DB strategy on Neon
- Live-mode Stripe cutover runbook (currently in test mode)

---

## 17. Backup and recovery procedures

**Database (Neon Postgres):**
- Neon provides automatic point-in-time recovery on paid plans — verify the current plan
  tier and PITR retention window in the Neon dashboard (Settings → Backup/Restore) before
  relying on it; this was not explicitly configured/verified as part of this build.
- **There is no separate backup script or export job in this repo.** For an extra layer of
  safety before any risky manual operation (bulk migration, manual data fix via
  `db:studio`), take a manual export first:
  ```bash
  pg_dump "$DATABASE_URL" -f backup-$(date +%Y%m%d-%H%M).sql
  ```
- **Recovery:** use Neon's dashboard PITR/branch-restore feature for point-in-time recovery,
  or restore a manual `pg_dump` with `psql "$DATABASE_URL" < backup.sql` into a fresh Neon
  branch first — never restore directly onto the live branch without testing.
- Migration history (`apps/web/src/server/db/migrations/`) is itself a form of schema
  backup/recovery — the full schema can be rebuilt from scratch by running all migrations in
  order against an empty database.

**File storage (Vercel Blob):**
- No automated backup exists for uploaded photos. Vercel Blob is the only copy. If this
  needs to change, the mitigation is either enabling Blob's own retention features (check
  current Vercel Blob plan capabilities) or writing a periodic sync job to a second storage
  provider — neither exists today.

**Secrets/environment variables:**
- The authoritative copy of every production env var lives in Vercel. There is no separate
  secrets backup. Run `vercel env pull` periodically (and store the result somewhere secure,
  outside git) if you want an offline copy for disaster recovery — this hasn't been
  established as a routine practice yet.

**Code:**
- GitHub (`Malexandre2000/selfforge`, `main` branch) is the backup for code and migration
  history. Keep it in sync — see §12's note that deploys have sometimes happened without a
  corresponding push; don't assume GitHub `main` always matches what's live in production
  without checking.

---

## 18. Maintenance checklist

**Weekly / as-needed while running the beta:**
- [ ] Check `/admin` → Overview for new waitlist signups; invite as capacity allows
- [ ] Check `/admin` → Feedback for new bug reports; triage status
- [ ] Check `/admin` → Roadmap for upvote trends on feature requests
- [ ] Check Sentry for new/recurring errors (remember: stack traces are minified until
      `SENTRY_AUTH_TOKEN` is added — see §10 and §16)
- [ ] Check Stripe dashboard for failed payments / churn if any paying (non-beta) users exist

**Before any deploy:**
- [ ] `npx tsc --noEmit` clean (from `apps/web`)
- [ ] `npx eslint src --max-warnings=0` clean (2 known pre-existing errors, see §12)
- [ ] `npm run build` clean (from `apps/web`)
- [ ] Any new/changed `schema.ts` has a generated + applied migration
- [ ] Any new env var is added to `turbo.json` → `globalEnv` **and** to Vercel production
      **and** the deploy is re-run after adding it
- [ ] Manually click through any changed flow in the browser — there's no automated test
      suite to catch regressions

**Monthly-ish:**
- [ ] `npm audit` at the repo root and `apps/web` — dependencies were not being routinely
      patched during this build; check for known-vulnerable packages
- [ ] Confirm the Stripe webhook endpoint is still registered and healthy (Stripe dashboard →
      Developers → Webhooks → recent deliveries)
- [ ] Spot-check `/api/health` returns 200
- [ ] Reassess `api_rate_limits` table row count (see §15, item 5) — decide if cleanup is
      needed yet

**Before any "big" change (switching Stripe to live mode, opening signups beyond invite-only,
adding real users at scale):**
- [ ] Revisit every item in §15 (Known Limitations) — several of them (mobile paywall gap,
      no Clerk webhook, single DB environment) become much higher-stakes once there's real
      money or a larger user base involved
- [ ] Confirm Neon's backup/PITR settings explicitly (see §17) — this was never verified
      during the original build, only assumed
