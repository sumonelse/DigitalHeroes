# Digital Heroes — Full-Stack Platform

> Golf performance tracking + monthly prize draws + charity fundraising.
> Built with Next.js 16, Supabase, Stripe, and Tailwind v4.

---

## Tech Stack

| Layer      | Technology                                     |
| ---------- | ---------------------------------------------- |
| Framework  | Next.js 16.2 (App Router, Server Actions, PPR) |
| Database   | Supabase / PostgreSQL                          |
| Auth       | Supabase Auth (email/password + magic link)    |
| Payments   | Stripe Subscriptions + Billing Portal          |
| Styling    | Tailwind CSS 4.2 (CSS-native config)           |
| Animation  | Motion 12.38 (motion/react)                    |
| Fonts      | Playfair Display + DM Sans                     |
| Deployment | Vercel (new account) + Supabase (new project)  |

---

## Architecture

```
app/
├── (public)/           # Homepage, charities, how-it-works
├── login/              # Auth pages
├── signup/
├── onboarding/         # Post-signup wizard
├── dashboard/          # Protected user area
│   ├── page.tsx        # Overview bento grid
│   ├── scores/         # Score CRUD (rolling 5-window)
│   ├── draws/          # Enter monthly draw
│   ├── charities/      # Charity selection + %
│   ├── winners/        # Winnings + proof upload
│   └── settings/       # Profile + subscription mgmt
├── admin/              # Admin-only (is_admin=true)
│   ├── page.tsx        # Stats overview
│   ├── users/          # User management
│   ├── draws/          # Run simulations + publish
│   ├── charities/      # Add/edit/delete charities
│   ├── winners/        # Verify + mark paid
│   └── analytics/      # Reports
├── api/
│   ├── webhooks/stripe/ # Stripe event handler
│   ├── checkout/        # Checkout session
│   └── draws/           # Draw API endpoints
└── auth/callback/       # Email verification handler

components/features/
├── home/               # Landing page sections
├── auth/               # AuthForm
├── dashboard/          # DashboardOverview, Sidebar, Settings, Winners
├── scores/             # ScoreManager (full CRUD)
├── draws/              # DrawEntry
├── charities/          # CharitySelector
└── admin/              # All admin components

app/actions/            # Server Actions (business logic)
├── auth.ts             # signIn, signUp, signOut
├── scores.ts           # addScore, updateScore, deleteScore
├── subscriptions.ts    # createCheckout, Stripe webhook handler
├── draws.ts            # enterDraw, adminPublishDraw, simulation
└── admin.ts            # All admin operations

supabase/
├── schema.sql          # Complete schema with RLS + grants + triggers
└── seed.sql            # Sample charities + initial draw
```

---

## Quick Start — Local Development

```bash
# 1. Clone and install
git clone <your-repo>
cd digital-heroes
npm install

# 2. Set up environment
cp .env.example .env.local
# Fill in your Supabase + Stripe keys

# 3. Run database migrations (in Supabase SQL editor)
# Copy and paste supabase/schema.sql → run
# Copy and paste supabase/seed.sql → run

# 4. Start dev server
npm run dev
```

---

## Supabase Setup

### 1. Create New Project

- Go to [supabase.com](https://supabase.com) → New Project
- Region: EU West (Ireland) for lowest latency
- Save your database password securely

### 2. Run Schema

- Dashboard → SQL Editor → New query
- Paste contents of `supabase/schema.sql` → Run
- Paste contents of `supabase/seed.sql` → Run

### 3. Configure Auth

- Authentication → Settings
- Site URL: `https://your-domain.vercel.app`
- Redirect URLs: `https://your-domain.vercel.app/auth/callback`
- Email templates: Customize as needed

### 4. Create Storage Buckets

- Storage → New bucket: `avatars` (public)
- Storage → New bucket: `charity-media` (public)
- Storage → New bucket: `winner-proofs` (private)

### 5. Create Admin User

```sql
-- After signing up with your admin email:
UPDATE public.profiles SET is_admin = true WHERE email = 'admin@yoursite.com';
```

### 6. Regenerate TypeScript Types

```bash
npm run db:types
```

---

## Stripe Setup

### 1. Create Products

In Stripe Dashboard → Products → Add product:

- **Monthly Plan**: ₹9.99/month recurring
- **Yearly Plan**: ₹99.99/year recurring

Copy the Price IDs, then update in Supabase:

```sql
UPDATE platform_settings SET value = '"price_xxx"' WHERE key = 'stripe_monthly_price';
UPDATE platform_settings SET value = '"price_xxx"' WHERE key = 'stripe_yearly_price';
```

### 2. Configure Webhook

- Stripe Dashboard → Developers → Webhooks → Add endpoint
- URL: `https://your-domain.vercel.app/api/webhooks/stripe`
- Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- Copy webhook secret → add to env as `STRIPE_WEBHOOK_SECRET`

### 3. Test with Stripe CLI (local)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## Vercel Deployment

```bash
# 1. Create NEW Vercel account (per requirements)
# 2. Import from GitHub
# 3. Add all environment variables from .env.example
# 4. Deploy
vercel --prod
```

**Required Environment Variables in Vercel:**

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_APP_URL
```

---

## Monthly Draw Workflow (Admin)

1. **End of Month**: Go to `/admin` → Click "Create Next Month Pool"
   - Auto-calculates prize pool from active subscribers
   - Creates the draw record for next month

2. **Run Simulation**: Go to `/admin/draws`
   - Select draw logic (Random or Algorithmic/Weighted by score frequency)
   - Click "Run Simulation" to preview numbers (can run multiple times)

3. **Publish Draw**: Click "Publish Draw"
   - Assigns final winning numbers
   - Processes all entries, calculates matches
   - Creates winner records
   - Handles jackpot rollover if no 5-match

4. **Verify Winners**: Go to `/admin/winners`
   - Review proof uploads from winners
   - Approve or reject with notes
   - Mark as paid with payment reference

---

## Key Features Implemented

### ✅ Score System

- Rolling 5-score window (DB trigger auto-removes oldest)
- One score per date (unique constraint)
- Edit and delete with optimistic UI
- Score frequency cache for algorithmic draws

### ✅ Draw Engine

- Random draw: `generate_draw_numbers('random')` — pure lottery
- Algorithmic draw: weighted by score frequency across all users
- Admin simulation mode (preview without publishing)
- Prize pool auto-split (40/35/25%)
- Jackpot rollover to next month

### ✅ Charity System

- User selects charity at onboarding
- Configurable contribution % (min 10%)
- Charity directory with featured/spotlight
- Contribution tracking per month

### ✅ Winner Flow

- Eligibility checked: active sub + 5 scores
- Match calculation via PostgreSQL function
- Proof upload to Supabase Storage
- Admin review (approve/reject)
- Payment tracking with reference

### ✅ Subscription

- Monthly (₹9.99) and Yearly (₹99.99) plans
- Stripe Checkout → webhook → DB update
- Stripe Customer Portal for self-service
- Real-time status validation via middleware

### ✅ RLS & Security

- Row-level security on every table
- Service role only for privileged operations
- Admin flag enforced at DB + middleware level
- Webhook signature verification

---

## Testing Checklist

```
✓ User signup & email confirmation
✓ Login / logout
✓ Onboarding wizard
✓ Subscription — monthly (use Stripe test card: 4242 4242 4242 4242)
✓ Subscription — yearly
✓ Score entry (1-45 range, duplicate date rejection)
✓ Rolling window (add 6th score, first removed)
✓ Draw entry (needs 5 scores + active sub)
✓ Admin: create prize pool
✓ Admin: run simulation (random + algorithmic)
✓ Admin: publish draw
✓ Admin: verify winner + mark paid
✓ Charity selection + percentage slider
✓ Winner proof upload
✓ Responsive design (mobile + desktop)
✓ Admin panel (set is_admin=true in DB first)
```

---

## Score Range Reference (Stableford)

| Score | Meaning                 |
| ----- | ----------------------- |
| 0     | Not valid (min 1)       |
| 1     | Bogey or worse          |
| 2     | Par                     |
| 3     | Birdie                  |
| 4     | Eagle                   |
| 5+    | Albatross+              |
| 45    | Maximum (perfect round) |

Range enforced at DB level (CHECK constraint) and UI level.
