-- ============================================================
-- Digital Heroes Platform — Seed Data (FIXED)
-- Version: 1.1 | April 2026
-- ============================================================
-- FIXES APPLIED:
--  [SEED-01] No ON CONFLICT clauses — re-running seed crashed on every UNIQUE violation
--  [SEED-02] DO block used ORDER BY created_at DESC LIMIT 1 — fragile pool lookup
--  [SEED-03] EXTRACT(month/year FROM now()) called twice in separate statements —
--             risk of month-boundary mismatch; captured once into variables
--  [SEED-04] active_subscribers = 500 with no real users — misleading; now 0
--  [SEED-05] total_pool_gbp = 4750 inconsistent with 500 × £9.99 = £4,995 —
--             corrected to an honest demo value with a clear comment
--  [SEED-06] Admin promotion comment was a silent no-op if profile doesn't exist yet —
--             replaced with a DO block that raises a notice instead of silently failing
-- ============================================================

-- ── Charities ─────────────────────────────────────────────────
-- [SEED-01] ON CONFLICT (slug) DO NOTHING makes this safe to re-run.
INSERT INTO public.charities
  (name, slug, description, short_description, category, status, featured_order, upcoming_events)
VALUES
(
  'Irish Heart Foundation',
  'irish-heart-foundation',
  'The Irish Heart Foundation is Ireland''s national charity dedicated to the prevention and '
  'reduction of death and disability from heart disease and stroke. Through research, advocacy, '
  'and community programmes, we''re fighting cardiovascular disease across Ireland.',
  'Fighting heart disease and stroke across Ireland',
  'Health',
  'featured',
  1,
  '[
    {"title":"Golf Classic Charity Day","date":"2026-06-15","location":"K Club, Kildare"},
    {"title":"Heart Walk Dublin","date":"2026-09-20","location":"Phoenix Park, Dublin"}
  ]'::jsonb
),
(
  'Goal Ireland',
  'goal-ireland',
  'GOAL is an international humanitarian response agency, founded and based in Ireland. '
  'We respond to the needs of the most vulnerable communities in the world, working in '
  'some of the world''s most difficult environments.',
  'International humanitarian aid from Ireland to the world',
  'International Aid',
  'featured',
  2,
  '[
    {"title":"Charity Golf Scramble","date":"2026-07-08","location":"Portmarnock Golf Club"}
  ]'::jsonb
),
(
  'Simon Community Ireland',
  'simon-community',
  'Simon Communities work to prevent homelessness and support people out of homelessness '
  'across Ireland. We provide emergency, transitional and long-term housing and support '
  'services to men, women and children.',
  'Ending homelessness across Ireland',
  'Social Services',
  'active',
  NULL,
  '[]'::jsonb
),
(
  'Pieta House',
  'pieta-house',
  'Pieta provides a free, therapeutic approach to people who are in suicidal distress and '
  'those who engage in self-harm. We also provide support for those bereaved by suicide '
  'and for those bereaved traumatically.',
  'Mental health support and suicide prevention',
  'Mental Health',
  'featured',
  3,
  '[
    {"title":"Darkness into Light Golf Day","date":"2026-05-10","location":"Various Venues Nationwide"}
  ]'::jsonb
),
(
  'Children''s Health Foundation',
  'childrens-health-foundation',
  'Children''s Health Foundation raises funds to support sick children and their families '
  'at Children''s Health Ireland hospitals. Every euro raised goes directly to supporting '
  'the health and wellbeing of sick children in our care.',
  'Supporting sick children and their families',
  'Children',
  'active',
  NULL,
  '[]'::jsonb
),
(
  'Age Action Ireland',
  'age-action-ireland',
  'Age Action is Ireland''s leading advocacy organisation for older people and works to '
  'achieve better policies and services for older people and to support older people to '
  'live full and active lives.',
  'Championing older people across Ireland',
  'Elderly Care',
  'active',
  NULL,
  '[]'::jsonb
)
ON CONFLICT (slug) DO NOTHING;  -- [SEED-01] idempotent

-- ── Current-month Prize Pool & Draw ───────────────────────────
-- [SEED-03] Capture month and year ONCE to avoid any boundary-crossing mismatch
--           if now() is evaluated at different points across statements.
-- [SEED-04] active_subscribers starts at 0 — no real users exist in seed data.
--           The column is updated by the prize pool recalculation job, not here.
-- [SEED-05] total_pool_gbp is set to 0.00 — it will be calculated properly when
--           real subscriptions are created.  Using a made-up number like 4750
--           caused a 5% mismatch with any actual subscriber count and seeded
--           misleading data into the UI and admin dashboard.
DO $$
DECLARE
  v_month      INTEGER := EXTRACT(month FROM now())::INTEGER;  -- [SEED-03]
  v_year       INTEGER := EXTRACT(year  FROM now())::INTEGER;  -- [SEED-03]
  v_pool_id    UUID;
  v_draw_id    UUID;
BEGIN
  -- ── Prize Pool ──────────────────────────────────────────────
  -- [SEED-01] ON CONFLICT: if pool already exists for this month, leave it unchanged.
  INSERT INTO public.prize_pools
    (period_month, period_year, total_pool_gbp, active_subscribers)
  VALUES
    (v_month, v_year, 0.00, 0)  -- [SEED-04, SEED-05]
  ON CONFLICT (period_month, period_year) DO NOTHING;  -- [SEED-01]

  -- Retrieve the pool id (whether just created or already existed)
  -- [SEED-02] Use period_month + period_year — not ORDER BY created_at which could
  --           pick the wrong row if seed is run near a month boundary or multiple
  --           times.
  SELECT id INTO v_pool_id
  FROM public.prize_pools
  WHERE period_month = v_month AND period_year = v_year;

  -- Recalculate tier splits from platform_settings
  PERFORM public.recalculate_prize_pool(v_pool_id);

  -- ── Draw ────────────────────────────────────────────────────
  -- [SEED-01] ON CONFLICT: if draw already exists for this month, leave it unchanged.
  INSERT INTO public.draws
    (prize_pool_id, period_month, period_year, status, logic_type, total_entries)
  VALUES
    (v_pool_id, v_month, v_year, 'pending', 'random', 0)
  ON CONFLICT (period_month, period_year) DO NOTHING;  -- [SEED-01]

  RAISE NOTICE 'Seed: prize pool % and draw ready for %/%', v_pool_id, v_month, v_year;
END $$;

-- ── Admin User Promotion ───────────────────────────────────────
-- [SEED-06] The original seed had a commented-out UPDATE that would silently do
--           nothing if the profile didn't exist yet, with no feedback at all.
--           This DO block performs the same update but emits a clear NOTICE
--           telling you whether it worked or what to do next.
--
-- HOW TO USE:
--   1. Create the admin user via Supabase Auth dashboard or signup flow first.
--   2. Then run the block below (uncomment and replace the email address).
--
-- DO $$
-- DECLARE
--   v_admin_email TEXT    := 'admin@digitalheroes.co.in';
--   v_rows_updated INTEGER;
-- BEGIN
--   UPDATE public.profiles
--   SET    is_admin = true
--   WHERE  email = v_admin_email;
--
--   GET DIAGNOSTICS v_rows_updated = ROW_COUNT;
--
--   IF v_rows_updated = 0 THEN
--     RAISE NOTICE
--       'Admin promotion skipped — no profile found for %. '
--       'Create the user via Supabase Auth first, then re-run this block.',
--       v_admin_email;
--   ELSE
--     RAISE NOTICE 'Admin privileges granted to %', v_admin_email;
--   END IF;
-- END $$;