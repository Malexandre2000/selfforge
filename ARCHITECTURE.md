# SelfForge — Architecture

**Mission:** Help people become the most confident version of themselves through self-care (fitness, nutrition, skincare, haircare, style, grooming, confidence, habits, sleep, motivation, discipline).

**Feel:** Apple × Notion × Linear × Stripe. Black / white / gray. Minimal, luxury, mobile-first, premium — the AI should feel like a mentor, not a chatbot.

**Platforms:** Web app (Next.js) + native mobile app (Expo/React Native), sharing one backend and one design language.

---

## 1. Tech Stack

### Monorepo
- **npm workspaces + Turborepo** — one repo, shared packages, cached/parallel builds. (Originally planned pnpm; this machine's Node install has root-owned `/usr/local/bin`, so npm workspaces avoids fighting permissions — functionally equivalent for our needs.)

### Frontend — Web (marketing + web app)
- **Next.js 15** (App Router, React Server Components, TypeScript)
- **Tailwind CSS v4** + a small hand-built primitive layer (not full shadcn — premium products shouldn't look like shadcn defaults; we use it only as an accessibility/behavior base for things like dialogs/menus)
- **Framer Motion** for animation (page transitions, hover states, streak/progress reveals)
- **next/font** with a two-font luxury pairing: **Inter** (body/UI, geometric & clean) + **Fraunces** (display/headlines, warm serif — gives the "premium mentor" feel instead of generic SaaS)

### Frontend — Mobile (native app)
- **Expo (React Native) + Expo Router** — file-based routing mirrors the web app's mental model
- **NativeWind** — Tailwind syntax in RN, so the same design tokens (colors, spacing, radii, type scale) drive both apps from one source
- **Reanimated + Moti** for native-feeling animation
- **Expo Push Notifications** for daily plan/streak nudges

### Shared packages
- `packages/design-tokens` — single source of truth for color scale, spacing, radii, typography, motion curves. Consumed by web Tailwind config *and* NativeWind config.
- `packages/types` — Zod schemas for every domain object (OnboardingProfile, DailyPlan, HabitEntry, ProgressEntry, ChatMessage…). Validated identically on client and server.
- `packages/api-client` — typed tRPC client used by both apps.

### Backend
- **tRPC** router hosted via Next.js Route Handlers — one backend, typed end-to-end, called natively from the web app (RSC/hooks) and over HTTP from the Expo app. No second backend service to run/deploy/pay for.
- **Auth: Clerk** — first-class Next.js *and* Expo SDKs, handles email/social login/session across both apps against one user table.
- **Database: Postgres (Neon)** — serverless, branches per preview deploy.
- **ORM: Drizzle** — lightweight, edge-friendly, type-safe.
- **File storage: Cloudflare R2** (S3-compatible) for progress photos — **private buckets, signed URLs only**, never public. Before/after photos are sensitive; encryption at rest + short-lived signed URLs are non-negotiable here.
- **Background jobs: Trigger.dev** — nightly "generate tomorrow's plan" job, streak/consistency recalculation, push notification delivery, re-engagement nudges.
- **AI: Anthropic Claude** via the Vercel AI SDK for streaming chat.
  - Claude Sonnet for the coaching conversation and daily plan generation (quality matters — this is the whole product).
  - Claude Haiku for cheap background tasks (tagging, summarization).
- **Payments: Stripe** (web) + **RevenueCat** (wraps Apple/Google IAP for mobile — Apple requires native IAP for in-app digital subscriptions, so raw Stripe won't fly on iOS; RevenueCat syncs entitlements across both).
- **Analytics: PostHog** (product analytics, session replay, feature flags — self-hostable, fits the "serious startup" bar).
- **Email: Resend** (welcome, daily digest, streak-at-risk nudges).
- **Error monitoring: Sentry** (web + Expo).

### Deployment
- Web → **Vercel**. Mobile → **EAS Build/Submit**. DB → **Neon**. Jobs → **Trigger.dev cloud**.

---

## 2. AI Memory Architecture

The coach must feel like it remembers you, not like a fresh ChatGPT tab every session.

- **Structured profile** (onboarding answers + evolving state: current weights, measurements, confidence score history, habit completion history) lives in Postgres as first-class rows — this is ground truth, not something the model has to recall from text.
- **Rolling conversation summary**: after each coaching session, Claude (Haiku) compresses it into a short structured summary appended to a `user_memory_log` table (not the full transcript). This is what gets re-injected into future system prompts — cheap, bounded, doesn't blow the context window as history grows.
- **Semantic recall**: embeddings of memory-log entries stored in Postgres via `pgvector`, so the coach can pull "the 3 most relevant past moments" (e.g. "user mentioned feeling self-conscious about skin two weeks ago") into context instead of always using the last N messages.
- **Daily plan generation job** (Trigger.dev, runs nightly per user) reads: profile + last 7 days of habit/workout/nutrition completions + memory log → produces tomorrow's 7 items (workout, nutrition, skincare, grooming, confidence challenge, habit, motivation quote) → stored as rows, not regenerated live, so the dashboard is instant and consistent all day.

---

## 3. Data Model (core entities)

```
User (via Clerk) ──┬─ OnboardingProfile (age, gender, height, weight, goal,
                    │    current_physique, skin_concerns, hair_concerns,
                    │    budget, confidence_1_10, sleep, gym_experience, current_habits)
                    ├─ Roadmap (generated milestones, phase plan)
                    ├─ DailyPlan (date, workout, nutrition, skincare, grooming,
                    │    confidence_challenge, habit, motivation) — one per day
                    ├─ HabitEntry (habit_id, date, completed)
                    ├─ ProgressEntry (date, weight, measurements, photo_url[private], notes)
                    ├─ ChatMessage (role, content, created_at)
                    ├─ MemoryLogEntry (summary_text, embedding, created_at)
                    ├─ StreakState (current_streak, longest_streak, last_active_date)
                    └─ Subscription (stripe/revenuecat status, tier)
```

---

## 4. Pages → Platform Mapping

| Page | Web | Mobile | Notes |
|---|---|---|---|
| Landing Page | ✅ | — | Marketing only, web/SEO surface |
| Pricing | ✅ | (paywall screen, not a "page") | Mobile uses native paywall via RevenueCat |
| Authentication | ✅ | ✅ | Clerk on both |
| Onboarding | ✅ | ✅ | Same question flow, shared Zod schema |
| Dashboard | ✅ | ✅ | Streak, confidence score, consistency score, timeline, before/after gallery, milestones |
| AI Coach | ✅ | ✅ | Streaming chat, memory-aware |
| Progress Tracker | ✅ | ✅ | Charts + photo gallery |
| Habit Tracker | ✅ | ✅ | |
| Daily Missions | ✅ | ✅ | Today's 7 items |
| Profile | ✅ | ✅ | |
| Settings | ✅ | ✅ | |

---

## 5. Build Order

1. Monorepo scaffold + design tokens
2. Landing Page (web) — proves out the visual language before anything else
3. Auth + Onboarding (both apps, shared schema)
4. Backend: tRPC router, DB schema, daily plan generation job
5. Dashboard, AI Coach, Progress Tracker, Habit Tracker, Daily Missions
6. Profile, Settings, Pricing
7. Mobile-specific polish (push notifications, native paywall)

We're building one page at a time, starting with the Landing Page.
