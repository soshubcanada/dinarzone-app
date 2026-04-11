# DinarZone — Master Developer Handoff

> **Status:** Pre-production. Public landing pages live. Authenticated app + APIs scaffolded with 74 uncommitted TypeScript errors to resolve before shipping.
> **Last prod commit:** `65c9877` (chore: French Unicode accents on clients landing)
> **Branch:** `main` — auto-deploys to Vercel on push
> **Production URL:** https://dinarzone-app-git-main-soshubcanada-3027s-projects.vercel.app

---

## 1. What DinarZone Is

A premium fintech remittance app for Canada → Maghreb corridors (Canada → Algeria first), inspired by Wise/Revolut/Binance UX. Key differentiators:

- **Real FX rates** (no bank markup) — currently locked to 99.5 DZD/CAD in the UI
- **Instant BaridiMob delivery** (primary payout rail) + cash pickup via POS agent network
- **FINTRAC-regulated** (Canadian MSB), 3-tier KYC (Sumsub), PCI-DSS via Stripe
- **Three languages**: FR (default), EN, AR (with RTL header support in middleware)

Two distinct marketing funnels:
- `/[locale]` — primary funnel (referenced by original "DinarZone remittance app" commit)
- `/[locale]/clients` — separate client acquisition landing with hero image + live calculator

---

## 2. Stack Snapshot

| Layer | Version | Notes |
|---|---|---|
| Next.js | **16.2.2** | App Router, **Turbopack** build (`next build` uses Turbo) |
| React | 19.2.4 | Server Components everywhere; client components explicitly `"use client"` |
| TypeScript | ^5 | Strict mode, `tsc --noEmit` runs as part of Vercel build |
| Tailwind | **v4** | `@tailwindcss/postcss` — no `tailwind.config.js`, uses CSS-first config |
| Supabase | `@supabase/ssr@^0.10` + `supabase-js@^2.102` | SSR cookies via `src/lib/supabase/{client,server}.ts` |
| Stripe | `@stripe/stripe-js@^9.1`, `stripe@^22` | Payment intents + webhooks |
| next-intl | ^4.9 | 3 message files in `messages/{fr,en,ar}.json` |
| Framer Motion | **^12.38** | ⚠️ Strict typing — `type: "spring" as const` required |
| Zustand | ^5.0 | `useKycStore`, `useTransferStore` |
| Zod | ^4.3 | All form validation + API route parsing |
| Mapbox GL | ^3.21 | For POS agent pickup map (not yet wired to a page) |

**Don't mix up:** This repo is `dinarzone-app`. Project `etabli` is completely separate (see user memory `feedback_separate_projects.md`).

---

## 3. Directory Map (what actually matters)

```
src/
├── app/
│   ├── [locale]/
│   │   ├── page.tsx                    ← primary funnel landing
│   │   ├── clients/page.tsx            ← 2nd landing (329 lines, committed)
│   │   │
│   │   ├── (app)/                      ← authenticated area (untracked folder!)
│   │   │   ├── dashboard/page.tsx      (425 lines, Talabat-style)
│   │   │   ├── send/
│   │   │   │   ├── page.tsx            (106 lines — stepper orchestrator)
│   │   │   │   └── components/         ← Step{Amount,Recipient,Delivery,Payment,Review,Confirmation,Calculator}.tsx
│   │   │   ├── history/
│   │   │   ├── track/[id]/
│   │   │   ├── recipients/
│   │   │   ├── profile/
│   │   │   ├── kyc/ + kyc/onboarding/
│   │   │   ├── referral/
│   │   │   ├── withdrawal-ticket/
│   │   │   └── agents/                 ← end-user view of POS agent network
│   │   │
│   │   ├── (agent)/                    ← POS agent dashboard (untracked!)
│   │   │   ├── agent-dashboard/page.tsx
│   │   │   ├── agent-dashboard/verify/page.tsx  ⚠️ 2 TS errors here
│   │   │   └── partner-onboarding/page.tsx
│   │   │
│   │   ├── (admin)/admin/              ← internal ops (untracked!)
│   │   │
│   │   └── (auth)/
│   │       ├── login/ · register/ (506 lines, Wise-style) · verify/
│   │
│   └── api/                            ← 13 route handlers
│       ├── auth/{login,register}/
│       ├── transfers/ · quotes/ · rates/ · recipients/
│       ├── kyc/ + kyc/upgrade/
│       ├── referral/ · partners/ · admin/partners/
│       └── webhooks/stripe/ + webhooks/sumsub/
│
├── components/
│   ├── ui/                             ← 19 primitives (Button, Input, Modal, Toast,
│   │                                      BottomSheet, SwipeToPay, VirtualCard,
│   │                                      FlagIcon, AnimatedCounter, Skeleton…)
│   ├── dashboard/ · auth/ · kyc/ · profile/ · transfer/
│   ├── navigation/ · layout/ · security/ · theme/ · shared/
│
├── lib/
│   ├── supabase/{client,server}.ts     ← SSR cookie handling
│   ├── schemas/{auth,transfer,recipient}.ts  ← Zod schemas
│   ├── engine/rates.ts                 ← FX rate logic
│   ├── hooks/{useAuth,useRates}.ts
│   ├── stripe/ · constants/ · types/ · utils/
│
└── store/
    ├── useKycStore.ts
    └── useTransferStore.ts

messages/                               ← i18n (fr default, en, ar)
├── fr.json
├── en.json
└── ar.json

supabase/migrations/                    ← 4 migrations, 16 tables total
├── 001_initial_schema.sql              (243 L) profiles, recipients, transfers, agents, kyc_documents, exchange_rates, notifications
├── 002_corridors_fx_kyc_limits.sql     (283 L) currency_corridors, fee_tiers, delivery_surcharges, kyc_monthly_usage, rate_locks
├── 003_pos_agents.sql                  (137 L) pos_agents
└── 004_referral_rewards.sql            (187 L) referral_rewards, wallet_balances, wallet_transactions

middleware.ts                           ← locale redirect + auth + rate limit + CSP
next.config.ts                          ← security headers (duplicate of middleware CSP)
public/clients/hero-bg.jpg              ← 597 KB, Algerian couple receiving DZD
```

---

## 4. Routes Inventory

### Public (no auth)
| Route | File | Purpose |
|---|---|---|
| `/` | `src/app/page.tsx` | Root redirect to `/fr` |
| `/[locale]` | `src/app/[locale]/page.tsx` | Primary marketing funnel |
| `/[locale]/clients` | `src/app/[locale]/clients/page.tsx` | **Separate client acquisition funnel** (deployed 2026-04-09) |
| `/[locale]/login` | `(auth)/login/page.tsx` | |
| `/[locale]/register` | `(auth)/register/page.tsx` | Wise-style, 506 L, tier toggle + social + password meter + trust badges |
| `/[locale]/verify` | `(auth)/verify/page.tsx` | Email/OTP verify |

### Authenticated — End User `(app)` group
| Route | Purpose |
|---|---|
| `/[locale]/dashboard` | Social proof bar, promo carousel, quick actions, live rates ticker, activity feed |
| `/[locale]/send` | 7-step transfer flow via `(app)/send/components/Step*.tsx` |
| `/[locale]/track/[id]` | Live transfer tracking |
| `/[locale]/history` | Past transfers |
| `/[locale]/recipients` | Beneficiary CRUD |
| `/[locale]/profile` | User settings |
| `/[locale]/kyc` + `/kyc/onboarding` | Sumsub KYC flow |
| `/[locale]/referral` | Referral rewards |
| `/[locale]/withdrawal-ticket` | POS pickup ticket generation |
| `/[locale]/agents` | End-user view of POS agent map |

### Authenticated — Agent `(agent)` group
| Route | Purpose |
|---|---|
| `/[locale]/agent-dashboard` | POS agent home |
| `/[locale]/agent-dashboard/verify` | Verify ticket + payout customer ⚠️ **has 2 TS spring errors** |
| `/[locale]/partner-onboarding` | New partner signup |

### Admin `(admin)` group
| Route | Purpose |
|---|---|
| `/[locale]/admin` | Internal ops dashboard |

### API Routes (13)
| Route | Method(s) | Notes |
|---|---|---|
| `/api/auth/login` | POST | Zod `loginSchema`, rate limit 10/min |
| `/api/auth/register` | POST | Zod `registerSchema`, rate limit 5/min |
| `/api/transfers` | GET, POST | Rate limit 20/min |
| `/api/quotes` | ? | Rate limit 30/min |
| `/api/rates` | GET | 5-min cache, rate limit 60/min |
| `/api/recipients` | GET, POST | |
| `/api/kyc` + `/kyc/upgrade` | POST | Rate limit 5/min on upgrade |
| `/api/referral` | | |
| `/api/partners` + `/api/admin/partners` | | |
| `/api/webhooks/stripe` | POST | Signature verification required |
| `/api/webhooks/sumsub` | POST | KYC status updates |

---

## 5. Database Schema (16 tables across 4 migrations)

**Migration 001 — Core** (`001_initial_schema.sql`, 243 L)
- `profiles` — user profile, extends `auth.users`
- `recipients` — beneficiaries (Algerian bank accounts, BaridiMob, CCP)
- `transfers` — transfer ledger
- `agents` — (legacy table — see `pos_agents` in 003)
- `kyc_documents` — uploaded KYC docs
- `exchange_rates` — historical FX snapshots
- `notifications` — in-app notification queue

**Migration 002 — Corridors / FX / KYC limits** (283 L)
- `currency_corridors` — enabled source→destination pairs
- `fee_tiers` — bracketed fee schedule
- `delivery_surcharges` — per delivery method fee add-ons
- `kyc_monthly_usage` — monthly volume tracker per tier
- `rate_locks` — 15-min locked rate quotes (matches the "Taux garanti (15 min)" UI)

**Migration 003 — POS Agents** (137 L)
- `pos_agents` — physical cash pickup locations (paired with Mapbox)

**Migration 004 — Referral & Wallet** (187 L)
- `referral_rewards` — referral ledger
- `wallet_balances` — user wallet state
- `wallet_transactions` — wallet activity log

All tables expected to have RLS enabled (commit message for 7f89fb4 claims RLS policies + triggers). **Verify RLS on every table before going live.**

---

## 6. Middleware & Security

`middleware.ts` is fully written (uncommitted modification) and implements:

1. **Locale redirect** — `/` → `/fr` (default), preserves path
2. **Auth guard scaffold** — `PUBLIC_PATHS = ["/login","/register","/forgot-password","/verify"]`, `ADMIN_PATHS = ["/admin"]`
3. **Security headers** — full OWASP set:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
   - `Permissions-Policy: camera=(), microphone=(), geolocation=(self), payment=(self)`
   - Full CSP (allows Stripe + Supabase + `https:` images)
4. **In-memory rate limiter** — per IP × path, 1-min window:
   - `/api/auth/login`: 10
   - `/api/auth/register`: 5
   - `/api/kyc/upgrade`: 5
   - `/api/transfers`: 20
   - `/api/quotes`: 30
   - `/api/rates`: 60

⚠️ **The in-memory rate limiter does NOT work on Vercel (stateless functions).** Must migrate to Upstash Redis or Vercel KV before production. This is a **P0 blocker**.

`next.config.ts` also sets the same security headers (redundant with middleware — pick one source of truth).

---

## 7. Environment Variables

Copy `.env.local.example` to `.env.local`. Required vars:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...        # server-only, never expose

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Sumsub (KYC)
SUMSUB_APP_TOKEN=...
SUMSUB_SECRET_KEY=...

# Thunes (payout rail)
THUNES_API_KEY=...
THUNES_API_SECRET=...
THUNES_BASE_URL=https://api-mt.thunes.com

# Mapbox (POS agent map)
NEXT_PUBLIC_MAPBOX_TOKEN=pk...

# Twilio (SMS OTP)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
```

⚠️ **None of these are wired to Vercel production yet** for the authenticated pages — only the public landings work without env. Set them in Vercel → Project Settings → Environment Variables before enabling auth routes.

---

## 8. Deployment (Vercel)

- **Git integration:** `soshubcanada/dinarzone-app` → pushes to `main` trigger auto-deploy
- **Project ID:** `prj_4BRmlMUUJd29ennTIGe2Ww93SRpc`
- **Team ID:** `team_bZlcNtJBZvphTk8mqGyb9dbo`
- **Builder:** Turbopack
- **Last successful deploy:** `dpl_Ca99gkQedKL35RDpxJMkgHKZc8Pk` (commit `abb2c15`)
- **Production aliases:**
  - `dinarzone-app-git-main-soshubcanada-3027s-projects.vercel.app` (main branch)

### How to deploy manually
```bash
vercel --prod --yes        # from repo root (uses .vercel/project.json)
```

### How to inspect a failed build
```bash
vercel inspect <deployment-url> --logs
# or via Vercel MCP: get_deployment_build_logs
```

---

## 9. Known Issues & Tech Debt (read before shipping)

### P0 — Blockers
1. **74 TypeScript errors in uncommitted files.** Run `npx tsc --noEmit` — you'll see `type: "spring"` errors in Framer Motion calls across:
   - `(agent)/agent-dashboard/verify/page.tsx:138,163`
   - Many `(app)/` pages, `(auth)/verify/`, `(admin)/admin/`, `(app)/send/components/Step*.tsx`
   - `components/ui/BottomSheet.tsx`, `SwipeToPay.tsx`, `PremiumButton.tsx`, `AnimatedCounter.tsx`, etc.
   - **Fix pattern:** replace `transition={{ type: "spring", ... }}` with `transition={{ type: "spring" as const, ... }}` (Framer Motion v12 requires strict literal typing)
   - Also Supabase "never" type errors in route handlers — regenerate DB types: `supabase gen types typescript --project-id <id> > src/lib/types/database.ts`

2. **In-memory rate limiter won't work on Vercel.** Migrate `rateLimitMap` to Upstash Redis or Vercel KV.

3. **65 files uncommitted on `main`** (see `git status`). Must be committed in logical batches — NOT in one massive blob — to keep history reviewable. Suggested batches:
   - Admin routes (`(admin)/`, `api/admin/`)
   - Agent routes (`(agent)/`, `api/partners/`)
   - App routes additions (`kyc/onboarding/`, `referral/`, `withdrawal-ticket/`, `send/components/StepCalculator.tsx`, `track/`)
   - Auth additions (`(auth)/verify/`, `(auth)/error.tsx`)
   - Component additions (`components/{auth,dashboard,kyc,navigation,profile,security,theme}/`)
   - UI primitives additions (`components/ui/`)
   - Store + lib additions (`store/`, `lib/engine/`, `lib/types/`, `lib/utils/`)
   - Migrations 002/003/004
   - `middleware.ts`, `next.config.ts`, `src/app/globals.css`, `src/app/layout.tsx`
   - Modified send flow, dashboard, profile, kyc, login
   - Modified API routes
   - Modified schemas, hooks, supabase clients

4. **Duplicate CSP** in `middleware.ts` AND `next.config.ts`. Middleware wins at runtime but `next.config.ts` still applies — consolidate.

5. **RLS verification pending.** Run `select tablename, rowsecurity from pg_tables where schemaname='public'` and ensure every table has policies.

### P1 — Before beta
- **Exchange rate is hardcoded** to `99.5` in the UI (`clients/page.tsx:10`). Wire to `/api/rates` which should pull from `exchange_rates` table.
- **Fees are hardcoded** (`TRANSFER_FEE = 2.5` in `clients/page.tsx`). Should pull from `fee_tiers` via `/api/quotes`.
- **No tests.** Zero `*.test.ts`, `*.spec.ts`, or `__tests__/` in the tree. Add at minimum: Zod schema tests, API route handler tests, critical component smoke tests (register form, send flow stepper).
- **`i18n` only has one language fully populated** (`fr.json`). `en.json` and `ar.json` exist but likely sparse — audit before shipping.
- **Webhook signature verification** — verify `api/webhooks/stripe/route.ts` and `sumsub/route.ts` actually validate signatures (don't ship without this).
- **RTL for Arabic** — middleware sets an RTL header but components need `dir="rtl"` support audit.

### P2 — Polish
- `next.config.ts` has **no** `images.remotePatterns` — intentional (hero uses CSS background-image to avoid Next/Image optimization). If you switch to `<Image>`, add remotePatterns.
- `mapbox-gl` is in deps but no page imports it yet — wire up POS agent map on `/agents`.
- `next-themes` was added in `5750a8c` but no ThemeProvider wrapping the root layout — connect it or remove the dep.
- Consolidate all `type: "spring" as const` casts into a shared `src/lib/utils/motion.ts` helper.

---

## 10. Working with the Clients Landing (`src/app/[locale]/clients/page.tsx`)

**The most recently shipped work.** 329 lines, `"use client"`, TypeScript strict.

**Constants:**
```ts
const EXCHANGE_RATE = 99.5;       // TODO: wire to /api/rates
const TRANSFER_FEE = 2.5;         // TODO: wire to /api/quotes
const HERO_IMAGE_URL = "/clients/hero-bg.jpg";  // 597 KB, served locally
```

**Hero rendering strategy:** CSS `background-image` (NOT Next/Image) — bypasses optimization and avoids CSP/ORB issues with external hotlinks. The image is a genuine Algerian couple receiving a DZD notification — on-brand emotional hook.

**Calculator:**
```ts
const [sendAmount, setSendAmount] = useState<string>("1000");
const receiveAmount = useMemo(() => {
  const n = parseFloat(sendAmount) || 0;
  return (n * EXCHANGE_RATE).toLocaleString("fr-DZ", { minimumFractionDigits: 2 });
}, [sendAmount]);
```
Note the fee is displayed ("Frais fixes") but NOT subtracted from receive amount — per the user's explicit request this landing shows gross conversion (different from the primary funnel calculator which may subtract fees).

**Colors** — don't touch without asking:
- `#070B14` — page background
- `#0F1523` — card background
- `#00A84D` → `#42E88F` — primary green gradient
- `#B8923B` — gold accent (DZD badge)
- `#7B8DB5` — muted text
- `#F0F4FA` — body text on hero

**All SVG icons are inline** — no emoji anywhere (hard rule). If you add new icons, create a component function in the same file or move them to `components/ui/icons/`.

**French Unicode accents** — all copy uses proper Unicode (é, è, à, ç, ù). Don't regress to ASCII.

**Animations** — uses `framer-motion` with `initial`/`animate`/`whileInView`. No `type: "spring"` usage on this page, so it compiles cleanly.

---

## 11. Starting Fresh (new developer onboarding)

```bash
# 1. Clone
git clone git@github.com:soshubcanada/dinarzone-app.git
cd dinarzone-app

# 2. Install
npm install

# 3. Env
cp .env.local.example .env.local
# populate all keys — ask Patrick for credentials

# 4. Supabase
# Connect to Supabase project, run migrations in order:
# 001 → 002 → 003 → 004
# Regenerate TS types:
supabase gen types typescript --project-id <id> > src/lib/types/database.ts

# 5. Run dev server
npm run dev
# open http://localhost:3000/fr/clients — should render with hero image

# 6. Verify build
npm run build          # ← WILL FAIL right now, 74 TS errors to fix first
npx tsc --noEmit       # ← 74 errors, fix spring typings + regenerate DB types
```

---

## 12. Contact & Ownership

- **Product owner:** Patrick Cadet (`grp255@Patricks-MacBook-Air.local`)
- **GitHub org:** `soshubcanada` (public)
- **Vercel team:** `soshubcanada-3027s-projects`
- **Related project (separate repo — do NOT mix):** `etabli` / `soshub-canada` (see `memory/feedback_separate_projects.md`)

---

## 13. Immediate Next Actions (prioritized)

1. **Resolve 74 TS errors** → targeted commit fixing `spring` typings + regenerating Supabase DB types
2. **Commit the 65 pending files in logical batches** (see §9 P0 #3)
3. **Replace in-memory rate limiter** with Upstash/Vercel KV
4. **Wire `/api/rates` + `/api/quotes`** to replace hardcoded `EXCHANGE_RATE` / `TRANSFER_FEE`
5. **Set env vars in Vercel prod** for Supabase + Stripe + Sumsub + Thunes + Twilio + Mapbox
6. **Add RLS policy verification script** → run against prod DB
7. **Write Zod schema tests + webhook signature tests** (minimum viable test suite)
8. **Audit `en.json` + `ar.json`** for translation completeness
9. **Verify RTL rendering** for Arabic locale
10. **Decommission duplicate CSP** in `next.config.ts` (keep middleware as source of truth)

---

*Generated 2026-04-09. Keep this doc next to `package.json` and update it whenever architecture shifts.*
