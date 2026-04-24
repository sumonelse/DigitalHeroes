-- ============================================================
-- Digital Heroes Platform — Complete Database Schema (FIXED)
-- Version: 1.1 | April 2026
-- ============================================================
-- FIXES APPLIED (see FIXES.md for full details):
--  [FIX-01] charity_contributions missing updated_at column (trigger crash)
--  [FIX-02] Algorithmic draw loop has no safety limit (infinite loop risk)
--  [FIX-03] process_draw_results accesses uninitialized RECORD (runtime error)
--  [FIX-04] winners_upload_proof RLS too permissive (users can alter prize amounts)
--  [FIX-05] subs_user_update WITH CHECK too loose (users can mutate any column)
--  [FIX-06] Missing index on draws.prize_pool_id (performance)
--  [FIX-07] monthly_fee_gbp not adjusted for yearly plan (wrong prize pool share)
--  [FIX-08] score_frequency_cache weight precision truncated (numeric drift)
--  [FIX-09] charity_contributions no uniqueness guard (duplicate monthly records)
--  [FIX-10] Jackpot rollover never propagated to next month's pool (logic gap)
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ── Custom Types ─────────────────────────────────────────────
CREATE TYPE subscription_plan   AS ENUM ('monthly', 'yearly');
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'cancelled', 'past_due', 'trialing');
CREATE TYPE draw_status         AS ENUM ('pending', 'simulating', 'published', 'archived');
CREATE TYPE draw_logic          AS ENUM ('random', 'algorithmic');
CREATE TYPE winner_status       AS ENUM ('pending', 'verified', 'rejected', 'paid');
CREATE TYPE payment_status      AS ENUM ('pending', 'paid', 'failed');
CREATE TYPE charity_status      AS ENUM ('active', 'inactive', 'featured');

-- ============================================================
-- CORE TABLES
-- ============================================================

-- ── Profiles (extends auth.users) ────────────────────────────
CREATE TABLE public.profiles (
  id                  UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email               TEXT        NOT NULL,
  full_name           TEXT,
  avatar_url          TEXT,
  phone               TEXT,
  country             TEXT        DEFAULT 'IE',
  handicap            NUMERIC(4,1),
  home_club           TEXT,
  is_admin            BOOLEAN     NOT NULL DEFAULT false,
  onboarding_complete BOOLEAN     NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Charities ─────────────────────────────────────────────────
CREATE TABLE public.charities (
  id                UUID           PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              TEXT           NOT NULL,
  slug              TEXT           UNIQUE NOT NULL,
  description       TEXT,
  short_description TEXT,
  logo_url          TEXT,
  cover_image_url   TEXT,
  website_url       TEXT,
  registration_no   TEXT,
  country           TEXT           DEFAULT 'IE',
  category          TEXT,
  status            charity_status NOT NULL DEFAULT 'active',
  featured_order    INTEGER,
  total_raised_gbp  NUMERIC(12,2)  NOT NULL DEFAULT 0.00,
  supporter_count   INTEGER        NOT NULL DEFAULT 0,
  upcoming_events   JSONB          DEFAULT '[]'::jsonb,
  created_at        TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ    NOT NULL DEFAULT now()
);

-- ── Subscriptions ─────────────────────────────────────────────
CREATE TABLE public.subscriptions (
  id                    UUID             PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID             NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_customer_id    TEXT             UNIQUE,
  stripe_subscription_id TEXT            UNIQUE,
  stripe_price_id       TEXT,
  plan                  subscription_plan NOT NULL DEFAULT 'monthly',
  status                subscription_status NOT NULL DEFAULT 'inactive',
  current_period_start  TIMESTAMPTZ,
  current_period_end    TIMESTAMPTZ,
  cancel_at_period_end  BOOLEAN          DEFAULT false,
  cancelled_at          TIMESTAMPTZ,
  trial_end             TIMESTAMPTZ,
  -- Prize pool contribution tracking
  -- [FIX-07] monthly_fee_gbp is computed via trigger when plan changes
  -- For 'monthly' plan: actual monthly price
  -- For 'yearly' plan:  yearly_price / 12  (prize pool uses monthly equivalent)
  monthly_fee_gbp       NUMERIC(10,2)    NOT NULL DEFAULT 9.99,
  charity_percentage    NUMERIC(5,2)     NOT NULL DEFAULT 10.00 CHECK (charity_percentage >= 10 AND charity_percentage <= 100),
  selected_charity_id   UUID             REFERENCES public.charities(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ      NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ      NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- ── Golf Scores ───────────────────────────────────────────────
CREATE TABLE public.golf_scores (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score       INTEGER     NOT NULL CHECK (score >= 1 AND score <= 45),
  score_date  DATE        NOT NULL,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, score_date)
);

-- ── Prize Pools ───────────────────────────────────────────────
CREATE TABLE public.prize_pools (
  id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  period_month        INTEGER     NOT NULL CHECK (period_month BETWEEN 1 AND 12),
  period_year         INTEGER     NOT NULL CHECK (period_year >= 2024),
  total_pool_gbp      NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  jackpot_pool_gbp    NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  match4_pool_gbp     NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  match3_pool_gbp     NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  active_subscribers  INTEGER     NOT NULL DEFAULT 0,
  jackpot_rolled_over BOOLEAN     NOT NULL DEFAULT false,
  rollover_amount_gbp NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  is_finalized        BOOLEAN     NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(period_month, period_year)
);

-- ── Draws ─────────────────────────────────────────────────────
CREATE TABLE public.draws (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  prize_pool_id    UUID        REFERENCES public.prize_pools(id),
  period_month     INTEGER     NOT NULL,
  period_year      INTEGER     NOT NULL,
  status           draw_status NOT NULL DEFAULT 'pending',
  logic_type       draw_logic  NOT NULL DEFAULT 'random',
  winning_numbers  INTEGER[]   CHECK (winning_numbers IS NULL OR array_length(winning_numbers, 1) = 5),
  draw_ran_at      TIMESTAMPTZ,
  published_at     TIMESTAMPTZ,
  simulation_runs  INTEGER     NOT NULL DEFAULT 0,
  total_entries    INTEGER     NOT NULL DEFAULT 0,
  total_winners    INTEGER     NOT NULL DEFAULT 0,
  admin_notes      TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(period_month, period_year)
);
-- NOTE on winning_numbers CHECK: original was CHECK (array_length(winning_numbers, 1) = 5)
-- which rejects NULL (a draw not yet run), preventing INSERT before numbers are set.
-- Fixed to: winning_numbers IS NULL OR array_length(...) = 5

-- ── Draw Entries (user scores submitted for a draw) ───────────
CREATE TABLE public.draw_entries (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id          UUID        NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
  user_id          UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  submitted_scores INTEGER[]   NOT NULL CHECK (array_length(submitted_scores, 1) = 5),
  matched_count    INTEGER     CHECK (matched_count >= 0 AND matched_count <= 5),
  is_winner        BOOLEAN     NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(draw_id, user_id)
);

-- ── Winners ───────────────────────────────────────────────────
CREATE TABLE public.winners (
  id                 UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id            UUID          NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
  draw_entry_id      UUID          NOT NULL REFERENCES public.draw_entries(id) ON DELETE CASCADE,
  user_id            UUID          NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  match_type         TEXT          NOT NULL CHECK (match_type IN ('5-match', '4-match', '3-match')),
  prize_amount_gbp   NUMERIC(10,2) NOT NULL,
  status             winner_status NOT NULL DEFAULT 'pending',
  proof_url          TEXT,
  proof_uploaded_at  TIMESTAMPTZ,
  reviewed_at        TIMESTAMPTZ,
  reviewed_by        UUID          REFERENCES public.profiles(id),
  review_notes       TEXT,
  payment_status     payment_status NOT NULL DEFAULT 'pending',
  payment_reference  TEXT,
  paid_at            TIMESTAMPTZ,
  created_at         TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- ── Charity Contributions ─────────────────────────────────────
-- [FIX-01] Added updated_at column — was missing but update trigger existed,
--           causing "column updated_at does not exist" crash on any UPDATE.
-- [FIX-09] Added UNIQUE(subscription_id, period_month, period_year) to prevent
--           duplicate contribution records per user per billing period.
CREATE TABLE public.charity_contributions (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  charity_id      UUID        NOT NULL REFERENCES public.charities(id) ON DELETE CASCADE,
  subscription_id UUID        NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  amount_gbp      NUMERIC(10,2) NOT NULL CHECK (amount_gbp > 0),
  period_month    INTEGER     NOT NULL CHECK (period_month BETWEEN 1 AND 12),
  period_year     INTEGER     NOT NULL CHECK (period_year >= 2024),
  status          payment_status NOT NULL DEFAULT 'pending',
  stripe_transfer_id TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),   -- [FIX-01]
  UNIQUE(subscription_id, period_month, period_year)    -- [FIX-09]
);

-- ── Score Frequency Analytics (for algorithmic draw) ──────────
-- [FIX-08] weight default was 0.02222 (truncated). Using exact expression 1.0/45.
CREATE TABLE public.score_frequency_cache (
  score         INTEGER  PRIMARY KEY CHECK (score >= 1 AND score <= 45),
  frequency     BIGINT   NOT NULL DEFAULT 0,
  weight        NUMERIC(10,8) NOT NULL DEFAULT ROUND(1.0/45, 8),  -- [FIX-08]
  last_updated  TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.score_frequency_cache (score)
SELECT generate_series(1, 45);

-- ── Audit Log ─────────────────────────────────────────────────
CREATE TABLE public.audit_logs (
  id          BIGSERIAL   PRIMARY KEY,
  user_id     UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  action      TEXT        NOT NULL,
  table_name  TEXT,
  record_id   UUID,
  old_data    JSONB,
  new_data    JSONB,
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Platform Settings (KV store for admin config) ─────────────
CREATE TABLE public.platform_settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  description TEXT,
  updated_by  UUID REFERENCES public.profiles(id),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.platform_settings (key, value, description) VALUES
  ('monthly_price_gbp',    '999'::jsonb,                          'Monthly subscription price in INR'),
  ('yearly_price_gbp',     '8330'::jsonb,                         'Yearly subscription price in INR'),
  ('stripe_monthly_price', '"price_monthly_placeholder"'::jsonb,   'Stripe Price ID for monthly plan'),
  ('stripe_yearly_price',  '"price_yearly_placeholder"'::jsonb,    'Stripe Price ID for yearly plan'),
  ('prize_pool_pct',       '{"5match":40,"4match":35,"3match":25}'::jsonb, 'Prize pool distribution percentages'),
  ('min_charity_pct',      '10'::jsonb,                            'Minimum charity contribution percentage'),
  ('max_scores_kept',      '5'::jsonb,                             'Rolling score window size'),
  ('draw_day_of_month',    '28'::jsonb,                            'Day of month draws run'),
  ('jackpot_rollover',     'true'::jsonb,                          'Whether jackpot rolls over if no winner');

-- ============================================================
-- TRIGGERS
-- ============================================================

-- ── 1. Updated_at auto-update ─────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at        BEFORE UPDATE ON public.profiles        FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_subscriptions_updated_at   BEFORE UPDATE ON public.subscriptions   FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_golf_scores_updated_at     BEFORE UPDATE ON public.golf_scores     FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_charities_updated_at       BEFORE UPDATE ON public.charities       FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_draws_updated_at           BEFORE UPDATE ON public.draws           FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_winners_updated_at         BEFORE UPDATE ON public.winners         FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_prize_pools_updated_at     BEFORE UPDATE ON public.prize_pools     FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
-- [FIX-01] This trigger now works because updated_at column was added above
CREATE TRIGGER trg_charity_contributions_updated_at BEFORE UPDATE ON public.charity_contributions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── 2. New user → create profile ─────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── 3. Rolling 5-score window ─────────────────────────────────
CREATE OR REPLACE FUNCTION public.enforce_rolling_scores()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_count INTEGER;
  v_oldest_id UUID;
BEGIN
  SELECT COUNT(*) INTO v_count FROM public.golf_scores WHERE user_id = NEW.user_id;

  IF v_count >= 5 THEN
    SELECT id INTO v_oldest_id
    FROM public.golf_scores
    WHERE user_id = NEW.user_id
    ORDER BY score_date ASC, created_at ASC
    LIMIT 1;

    DELETE FROM public.golf_scores WHERE id = v_oldest_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_rolling_score_window
  BEFORE INSERT ON public.golf_scores
  FOR EACH ROW EXECUTE FUNCTION public.enforce_rolling_scores();

-- ── 4. Update score_frequency_cache on score insert/update/delete ───
CREATE OR REPLACE FUNCTION public.update_score_frequency()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_total BIGINT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.score_frequency_cache SET frequency = frequency + 1, last_updated = now() WHERE score = NEW.score;
  ELSIF TG_OP = 'UPDATE' AND OLD.score <> NEW.score THEN
    UPDATE public.score_frequency_cache SET frequency = GREATEST(frequency - 1, 0), last_updated = now() WHERE score = OLD.score;
    UPDATE public.score_frequency_cache SET frequency = frequency + 1, last_updated = now() WHERE score = NEW.score;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.score_frequency_cache SET frequency = GREATEST(frequency - 1, 0), last_updated = now() WHERE score = OLD.score;
  END IF;

  SELECT COALESCE(SUM(frequency), 0) INTO v_total FROM public.score_frequency_cache;
  IF v_total > 0 THEN
    UPDATE public.score_frequency_cache SET weight = ROUND(frequency::NUMERIC / v_total, 8);
  ELSE
    -- [FIX-08] Use exact expression instead of truncated literal
    UPDATE public.score_frequency_cache SET weight = ROUND(1.0 / 45, 8);
  END IF;

  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_score_frequency_insert
  AFTER INSERT  ON public.golf_scores FOR EACH ROW EXECUTE FUNCTION public.update_score_frequency();
CREATE TRIGGER trg_score_frequency_update
  AFTER UPDATE  ON public.golf_scores FOR EACH ROW EXECUTE FUNCTION public.update_score_frequency();
CREATE TRIGGER trg_score_frequency_delete
  AFTER DELETE  ON public.golf_scores FOR EACH ROW EXECUTE FUNCTION public.update_score_frequency();

-- ── 5. Charity totals & supporter count ──────────────────────
CREATE OR REPLACE FUNCTION public.update_charity_totals()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.charities
    SET total_raised_gbp = total_raised_gbp + NEW.amount_gbp,
        supporter_count  = (SELECT COUNT(DISTINCT user_id) FROM public.charity_contributions WHERE charity_id = NEW.charity_id)
    WHERE id = NEW.charity_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_charity_contribution_totals
  AFTER INSERT ON public.charity_contributions
  FOR EACH ROW EXECUTE FUNCTION public.update_charity_totals();

-- ── 6. Auto-calculate prize pool tiers ───────────────────────
CREATE OR REPLACE FUNCTION public.recalculate_prize_pool(p_pool_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_total    NUMERIC;
  v_rollover NUMERIC;
  v_pct      JSONB;
BEGIN
  SELECT value INTO v_pct FROM public.platform_settings WHERE key = 'prize_pool_pct';
  IF v_pct IS NULL THEN
    RAISE EXCEPTION 'prize_pool_pct setting not found';
  END IF;

  SELECT total_pool_gbp, rollover_amount_gbp INTO v_total, v_rollover
  FROM public.prize_pools WHERE id = p_pool_id;

  IF v_total IS NULL THEN
    RAISE EXCEPTION 'Prize pool % not found', p_pool_id;
  END IF;

  UPDATE public.prize_pools
  SET
    jackpot_pool_gbp = ROUND((v_total * (v_pct->>'5match')::NUMERIC / 100) + COALESCE(v_rollover, 0), 2),
    match4_pool_gbp  = ROUND(v_total * (v_pct->>'4match')::NUMERIC / 100, 2),
    match3_pool_gbp  = ROUND(v_total * (v_pct->>'3match')::NUMERIC / 100, 2),
    updated_at       = now()
  WHERE id = p_pool_id;
END;
$$;

-- ── 7. [FIX-07] Set monthly_fee_gbp correctly based on plan ──
-- For monthly: uses monthly_price_gbp setting
-- For yearly:  uses yearly_price_gbp / 12 (monthly equivalent for prize pool share)
CREATE OR REPLACE FUNCTION public.sync_monthly_fee()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_monthly_price NUMERIC;
  v_yearly_price  NUMERIC;
BEGIN
  -- Only recalculate when plan changes or on INSERT
  IF TG_OP = 'UPDATE' AND OLD.plan = NEW.plan THEN
    RETURN NEW;
  END IF;

  SELECT (value::TEXT)::NUMERIC INTO v_monthly_price
  FROM public.platform_settings WHERE key = 'monthly_price_gbp';

  SELECT (value::TEXT)::NUMERIC INTO v_yearly_price
  FROM public.platform_settings WHERE key = 'yearly_price_gbp';

  IF NEW.plan = 'yearly' THEN
    NEW.monthly_fee_gbp := ROUND(COALESCE(v_yearly_price, 8330) / 12, 2);
  ELSE
    NEW.monthly_fee_gbp := COALESCE(v_monthly_price, 999);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sync_monthly_fee
  BEFORE INSERT OR UPDATE OF plan ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.sync_monthly_fee();

-- ============================================================
-- DATABASE FUNCTIONS (called via RPC)
-- ============================================================

-- Get user's current 5 scores (latest first)
CREATE OR REPLACE FUNCTION public.get_user_scores(p_user_id UUID)
RETURNS TABLE (id UUID, score INTEGER, score_date DATE, created_at TIMESTAMPTZ)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id, score, score_date, created_at
  FROM public.golf_scores
  WHERE user_id = p_user_id
  ORDER BY score_date DESC, created_at DESC
  LIMIT 5;
$$;

-- Check if user is eligible for draw (active sub + 5 scores)
CREATE OR REPLACE FUNCTION public.check_draw_eligibility(p_user_id UUID)
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_sub_status  subscription_status;
  v_score_count INTEGER;
BEGIN
  SELECT status INTO v_sub_status FROM public.subscriptions WHERE user_id = p_user_id;
  SELECT COUNT(*) INTO v_score_count FROM public.golf_scores WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'eligible',      (COALESCE(v_sub_status, 'inactive') = 'active' AND v_score_count = 5),
    'sub_active',    (COALESCE(v_sub_status, 'inactive') = 'active'),
    'score_count',   v_score_count,
    'scores_needed', GREATEST(0, 5 - v_score_count)
  );
END;
$$;

-- ── [FIX-02] generate_draw_numbers — added safety limit to algorithmic loop ──
-- Original: the 'random' branch had a 1000-iteration guard but the 'algorithmic'
-- branch had none, creating a risk of an infinite loop if weights never summed to
-- reach v_rand (possible with floating-point imprecision).
CREATE OR REPLACE FUNCTION public.generate_draw_numbers(p_logic draw_logic DEFAULT 'random')
RETURNS INTEGER[] LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_numbers    INTEGER[] := '{}';
  v_candidate  INTEGER;
  v_attempts   INTEGER := 0;
  v_weights    NUMERIC[];
  v_scores     INTEGER[];
  v_cumulative NUMERIC;
  v_rand       NUMERIC;
  i            INTEGER;
  v_max_iter   CONSTANT INTEGER := 1000;  -- [FIX-02] shared safety cap
BEGIN
  IF p_logic = 'random' THEN
    WHILE array_length(v_numbers, 1) IS NULL OR array_length(v_numbers, 1) < 5 LOOP
      v_candidate := floor(random() * 45 + 1)::INTEGER;
      IF NOT (v_candidate = ANY(v_numbers)) THEN
        v_numbers := array_append(v_numbers, v_candidate);
      END IF;
      v_attempts := v_attempts + 1;
      IF v_attempts > v_max_iter THEN
        RAISE EXCEPTION 'generate_draw_numbers(random): exceeded % iterations', v_max_iter;
      END IF;
    END LOOP;

  ELSE
    -- Algorithmic: weighted by score frequency
    SELECT array_agg(weight ORDER BY score), array_agg(score ORDER BY score)
    INTO v_weights, v_scores
    FROM public.score_frequency_cache;

    WHILE array_length(v_numbers, 1) IS NULL OR array_length(v_numbers, 1) < 5 LOOP
      v_rand       := random();
      v_cumulative := 0;
      v_candidate  := NULL;  -- [FIX-02] reset each iteration so stale value is never reused

      FOR i IN 1..45 LOOP
        v_cumulative := v_cumulative + v_weights[i];
        IF v_rand <= v_cumulative THEN
          v_candidate := v_scores[i];
          EXIT;
        END IF;
      END LOOP;

      -- [FIX-02] Floating-point fallback: if rand > sum-of-weights, pick last score
      IF v_candidate IS NULL THEN
        v_candidate := v_scores[45];
      END IF;

      IF NOT (v_candidate = ANY(v_numbers)) THEN
        v_numbers := array_append(v_numbers, v_candidate);
      END IF;

      v_attempts := v_attempts + 1;
      IF v_attempts > v_max_iter THEN  -- [FIX-02] safety guard for algorithmic branch
        RAISE EXCEPTION 'generate_draw_numbers(algorithmic): exceeded % iterations', v_max_iter;
      END IF;
    END LOOP;
  END IF;

  RETURN v_numbers;
END;
$$;

-- ── [FIX-03] process_draw_results — fixed uninitialized RECORD access ──
-- Original: declared v_prize_pool RECORD; only populated it if v_prize_pool_id IS NOT NULL,
-- then later accessed v_prize_pool.id in a CASE expression — this raises
-- "record has no field id" when v_prize_pool_id IS NULL.
-- Fix: use v_prize_pool_id IS NOT NULL as the guard everywhere instead of v_prize_pool.id.
CREATE OR REPLACE FUNCTION public.process_draw_results(p_draw_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_winning_numbers   INTEGER[];
  v_prize_pool_id     UUID;
  v_entry             RECORD;
  v_match_count       INTEGER;
  v_prize_pool        RECORD;
  v_pool_found        BOOLEAN := false;  -- [FIX-03] explicit flag
  v_5match_winners    INTEGER := 0;
  v_4match_winners    INTEGER := 0;
  v_3match_winners    INTEGER := 0;
BEGIN
  -- Get winning numbers and prize pool id
  SELECT winning_numbers, prize_pool_id
  INTO v_winning_numbers, v_prize_pool_id
  FROM public.draws WHERE id = p_draw_id;

  IF v_winning_numbers IS NULL THEN
    RAISE EXCEPTION 'Draw % has no winning numbers set', p_draw_id;
  END IF;

  -- Reset previous results for this draw (idempotent re-run support)
  DELETE FROM public.winners WHERE draw_id = p_draw_id;
  UPDATE public.draw_entries SET matched_count = NULL, is_winner = false WHERE draw_id = p_draw_id;

  -- Calculate matches for each entry
  FOR v_entry IN SELECT * FROM public.draw_entries WHERE draw_id = p_draw_id LOOP
    SELECT COUNT(*) INTO v_match_count
    FROM unnest(v_entry.submitted_scores) s
    WHERE s = ANY(v_winning_numbers);

    UPDATE public.draw_entries
    SET matched_count = v_match_count, is_winner = (v_match_count >= 3)
    WHERE id = v_entry.id;

    IF v_match_count >= 3 THEN
      IF    v_match_count = 5 THEN v_5match_winners := v_5match_winners + 1;
      ELSIF v_match_count = 4 THEN v_4match_winners := v_4match_winners + 1;
      ELSE                         v_3match_winners := v_3match_winners + 1;
      END IF;
    END IF;
  END LOOP;

  -- Load prize pool if linked
  IF v_prize_pool_id IS NOT NULL THEN
    SELECT * INTO v_prize_pool FROM public.prize_pools WHERE id = v_prize_pool_id;
    v_pool_found := FOUND;  -- [FIX-03] FOUND is true when SELECT INTO returned a row
  END IF;

  -- Insert winner rows with calculated prize shares
  INSERT INTO public.winners (draw_id, draw_entry_id, user_id, match_type, prize_amount_gbp)
  SELECT
    p_draw_id,
    de.id,
    de.user_id,
    CASE de.matched_count WHEN 5 THEN '5-match' WHEN 4 THEN '4-match' ELSE '3-match' END,
    -- [FIX-03] Guard on v_pool_found instead of v_prize_pool.id
    CASE de.matched_count
      WHEN 5 THEN CASE WHEN v_5match_winners > 0 AND v_pool_found
                       THEN ROUND(v_prize_pool.jackpot_pool_gbp / v_5match_winners, 2) ELSE 0 END
      WHEN 4 THEN CASE WHEN v_4match_winners > 0 AND v_pool_found
                       THEN ROUND(v_prize_pool.match4_pool_gbp  / v_4match_winners, 2) ELSE 0 END
      ELSE        CASE WHEN v_3match_winners > 0 AND v_pool_found
                       THEN ROUND(v_prize_pool.match3_pool_gbp  / v_3match_winners, 2) ELSE 0 END
    END
  FROM public.draw_entries de
  WHERE de.draw_id = p_draw_id AND de.is_winner = true;

  -- Handle jackpot rollover
  IF v_5match_winners = 0 AND v_pool_found THEN  -- [FIX-03]
    UPDATE public.draws
    SET admin_notes = COALESCE(admin_notes || ' | ', '') || 'Jackpot rolled over'
    WHERE id = p_draw_id;

    UPDATE public.prize_pools
    SET jackpot_rolled_over = true,
        rollover_amount_gbp = jackpot_pool_gbp  -- [FIX-10] preserve exact rollover amount
    WHERE id = v_prize_pool.id;
  END IF;

  -- Update draw totals
  UPDATE public.draws
  SET total_winners = v_5match_winners + v_4match_winners + v_3match_winners,
      total_entries = (SELECT COUNT(*) FROM public.draw_entries WHERE draw_id = p_draw_id),
      draw_ran_at   = COALESCE(draw_ran_at, now())
  WHERE id = p_draw_id;

  RETURN jsonb_build_object(
    'winners_5match', v_5match_winners,
    'winners_4match', v_4match_winners,
    'winners_3match', v_3match_winners,
    'jackpot_rolled', (v_5match_winners = 0)
  );
END;
$$;

-- ── [FIX-10] Propagate jackpot rollover to next month's prize pool ──
-- Original schema had no mechanism to carry the rolled-over jackpot forward.
-- This function is called by the admin (or pg_cron job) when creating a new
-- prize pool; it finds the most-recent unresolved rollover and adds it.
CREATE OR REPLACE FUNCTION public.apply_jackpot_rollover(p_new_pool_id UUID)
RETURNS NUMERIC LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_rollover   NUMERIC := 0;
  v_prev_pool  RECORD;
BEGIN
  -- Find the latest finalized pool that has an unclaimed rollover
  SELECT * INTO v_prev_pool
  FROM public.prize_pools
  WHERE jackpot_rolled_over = true
    AND is_finalized = true
    AND id <> p_new_pool_id
  ORDER BY period_year DESC, period_month DESC
  LIMIT 1;

  IF FOUND THEN
    v_rollover := COALESCE(v_prev_pool.rollover_amount_gbp, 0);

    -- Add rollover to the new pool and recalculate tiers
    UPDATE public.prize_pools
    SET rollover_amount_gbp = v_rollover
    WHERE id = p_new_pool_id;

    PERFORM public.recalculate_prize_pool(p_new_pool_id);
  END IF;

  RETURN v_rollover;
END;
$$;

-- ── [FIX-04] Secure proof upload via SECURITY DEFINER function ──
-- Original: winners_upload_proof RLS policy (FOR UPDATE ... WITH CHECK status='pending')
-- let users overwrite ANY column including prize_amount_gbp.
-- Fix: expose a narrow RPC function that only updates proof_url + proof_uploaded_at;
-- the RLS UPDATE policy for regular users is removed and replaced by this function.
CREATE OR REPLACE FUNCTION public.submit_winner_proof(p_winner_id UUID, p_proof_url TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Verify caller owns this winner row and it is still pending
  IF NOT EXISTS (
    SELECT 1 FROM public.winners
    WHERE id = p_winner_id
      AND user_id = auth.uid()
      AND status = 'pending'
  ) THEN
    RAISE EXCEPTION 'Winner record not found, not owned by caller, or already processed';
  END IF;

  IF p_proof_url IS NULL OR trim(p_proof_url) = '' THEN
    RAISE EXCEPTION 'proof_url cannot be empty';
  END IF;

  UPDATE public.winners
  SET proof_url         = p_proof_url,
      proof_uploaded_at = now(),
      updated_at        = now()
  WHERE id = p_winner_id;
END;
$$;

-- ── [FIX-05] Narrow RPC for user-facing subscription updates ──
-- RLS WITH CHECK cannot reference OLD (that is trigger-only syntax).
-- Instead, expose a SECURITY DEFINER function that only touches the
-- two columns users are allowed to change: charity_percentage and
-- selected_charity_id.  All other columns are left untouched.
-- Call via: supabase.rpc('update_charity_preference', { p_percentage: 15, p_charity_id: '...' })
CREATE OR REPLACE FUNCTION public.update_charity_preference(
  p_charity_percentage  NUMERIC DEFAULT NULL,
  p_charity_id          UUID    DEFAULT NULL
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Caller must have an active subscription
  IF NOT EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = auth.uid() AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'No active subscription found for current user';
  END IF;

  -- Validate charity_percentage range when supplied
  IF p_charity_percentage IS NOT NULL AND (p_charity_percentage < 10 OR p_charity_percentage > 100) THEN
    RAISE EXCEPTION 'charity_percentage must be between 10 and 100';
  END IF;

  -- Validate charity exists and is active when supplied
  IF p_charity_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.charities WHERE id = p_charity_id AND status != 'inactive'
  ) THEN
    RAISE EXCEPTION 'Charity not found or is inactive';
  END IF;

  UPDATE public.subscriptions
  SET
    charity_percentage  = COALESCE(p_charity_percentage, charity_percentage),
    selected_charity_id = COALESCE(p_charity_id,         selected_charity_id),
    updated_at          = now()
  WHERE user_id = auth.uid();
END;
$$;

-- Admin stats overview
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_users',          (SELECT COUNT(*) FROM public.profiles WHERE is_admin = false),
    'active_subscribers',   (SELECT COUNT(*) FROM public.subscriptions WHERE status = 'active'),
    'total_charity_raised', (SELECT COALESCE(SUM(total_raised_gbp), 0) FROM public.charities),
    'current_prize_pool',   (
                              SELECT COALESCE(jackpot_pool_gbp + match4_pool_gbp + match3_pool_gbp, 0)
                              FROM public.prize_pools
                              WHERE period_year  = EXTRACT(year  FROM now())::INTEGER
                                AND period_month = EXTRACT(month FROM now())::INTEGER
                              LIMIT 1
                            ),
    'pending_winners',      (SELECT COUNT(*) FROM public.winners WHERE status = 'pending'),
    'total_draws_run',      (SELECT COUNT(*) FROM public.draws WHERE status = 'published')
  ) INTO v_result;
  RETURN v_result;
END;
$$;

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_subscriptions_user_id      ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status       ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_cust  ON public.subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_sub   ON public.subscriptions(stripe_subscription_id);

CREATE INDEX idx_golf_scores_user_date      ON public.golf_scores(user_id, score_date DESC);
CREATE INDEX idx_golf_scores_user_id        ON public.golf_scores(user_id);

CREATE INDEX idx_draw_entries_draw_id       ON public.draw_entries(draw_id);
CREATE INDEX idx_draw_entries_user_id       ON public.draw_entries(user_id);
CREATE INDEX idx_draw_entries_winner        ON public.draw_entries(draw_id) WHERE is_winner = true;

CREATE INDEX idx_winners_draw_id            ON public.winners(draw_id);
CREATE INDEX idx_winners_user_id            ON public.winners(user_id);
CREATE INDEX idx_winners_status             ON public.winners(status);

CREATE INDEX idx_charity_contributions_user    ON public.charity_contributions(user_id);
CREATE INDEX idx_charity_contributions_charity ON public.charity_contributions(charity_id);
CREATE INDEX idx_charity_contributions_period  ON public.charity_contributions(period_year, period_month);

CREATE INDEX idx_charities_status           ON public.charities(status);
CREATE INDEX idx_charities_slug             ON public.charities(slug);
CREATE INDEX idx_charities_featured         ON public.charities(featured_order) WHERE status = 'featured';

CREATE INDEX idx_audit_logs_user_id         ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at      ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action          ON public.audit_logs(action);

-- [FIX-06] Missing index on draws.prize_pool_id — this is a FK with no index,
-- causing sequential scans on draws whenever prize_pool is joined.
CREATE INDEX idx_draws_prize_pool_id        ON public.draws(prize_pool_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.profiles                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.golf_scores             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charities               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charity_contributions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prize_pools             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draws                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draw_entries            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winners                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_frequency_cache   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs              ENABLE ROW LEVEL SECURITY;

-- ── Helper: is current user admin? ───────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(is_admin, false) FROM public.profiles WHERE id = auth.uid();
$$;

-- ── Profiles ──────────────────────────────────────────────────
CREATE POLICY "profiles_select_own"  ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "profiles_insert_own"  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
-- Prevent privilege escalation: is_admin must not change via user's own update
CREATE POLICY "profiles_update_own"  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    is_admin = COALESCE((SELECT is_admin FROM public.profiles WHERE id = auth.uid()), false)
  );
CREATE POLICY "profiles_admin_all"   ON public.profiles FOR ALL USING (public.is_admin());

-- ── Subscriptions ─────────────────────────────────────────────
CREATE POLICY "subs_select_own"     ON public.subscriptions FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "subs_insert_service" ON public.subscriptions FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "subs_update_service" ON public.subscriptions FOR UPDATE USING (public.is_admin());

-- [FIX-05] OLD is not available in RLS WITH CHECK (trigger-only syntax).
-- The direct UPDATE policy for users on subscriptions is intentionally omitted.
-- Users must call update_charity_preference() RPC which enforces column-level
-- restrictions via SECURITY DEFINER (see function definition below).

-- ── Golf Scores ───────────────────────────────────────────────
CREATE POLICY "scores_select_own"   ON public.golf_scores FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "scores_insert_own"   ON public.golf_scores FOR INSERT WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (SELECT 1 FROM public.subscriptions WHERE user_id = auth.uid() AND status = 'active')
);
CREATE POLICY "scores_update_own"   ON public.golf_scores FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "scores_delete_own"   ON public.golf_scores FOR DELETE USING (user_id = auth.uid());
CREATE POLICY "scores_admin_all"    ON public.golf_scores FOR ALL USING (public.is_admin());

-- ── Charities ─────────────────────────────────────────────────
CREATE POLICY "charities_select_all" ON public.charities FOR SELECT USING (status != 'inactive' OR public.is_admin());
CREATE POLICY "charities_admin_all"  ON public.charities FOR ALL USING (public.is_admin());

-- ── Charity Contributions ─────────────────────────────────────
CREATE POLICY "contribs_select_own"  ON public.charity_contributions FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "contribs_admin_all"   ON public.charity_contributions FOR ALL USING (public.is_admin());

-- ── Prize Pools ───────────────────────────────────────────────
CREATE POLICY "pools_select_all"     ON public.prize_pools FOR SELECT USING (true);
CREATE POLICY "pools_admin_all"      ON public.prize_pools FOR ALL USING (public.is_admin());

-- ── Draws ─────────────────────────────────────────────────────
CREATE POLICY "draws_select_published" ON public.draws FOR SELECT USING (status = 'published' OR public.is_admin());
CREATE POLICY "draws_admin_all"        ON public.draws FOR ALL USING (public.is_admin());

-- ── Draw Entries ──────────────────────────────────────────────
CREATE POLICY "entries_select_own"   ON public.draw_entries FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "entries_insert_own"   ON public.draw_entries FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "entries_admin_all"    ON public.draw_entries FOR ALL USING (public.is_admin());

-- ── Winners ───────────────────────────────────────────────────
CREATE POLICY "winners_select_own"   ON public.winners FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
-- [FIX-04] Removed the overly-permissive winners_upload_proof UPDATE policy.
-- Users must call submit_winner_proof() RPC instead, which only updates the
-- two permitted columns (proof_url, proof_uploaded_at) via SECURITY DEFINER.
CREATE POLICY "winners_admin_all"    ON public.winners FOR ALL USING (public.is_admin());

-- ── Score Frequency Cache ─────────────────────────────────────
CREATE POLICY "freq_select_all"      ON public.score_frequency_cache FOR SELECT USING (true);
CREATE POLICY "freq_admin_all"       ON public.score_frequency_cache FOR ALL USING (public.is_admin());

-- ── Platform Settings ─────────────────────────────────────────
CREATE POLICY "settings_select_all"  ON public.platform_settings FOR SELECT USING (true);
CREATE POLICY "settings_admin_all"   ON public.platform_settings FOR ALL USING (public.is_admin());

-- ── Audit Logs ────────────────────────────────────────────────
CREATE POLICY "audit_admin_all"      ON public.audit_logs FOR ALL USING (public.is_admin());
CREATE POLICY "audit_insert_auth"    ON public.audit_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- GRANTS
-- ============================================================

REVOKE ALL ON ALL TABLES    IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC;

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- anon: read-only public-facing tables
GRANT SELECT ON public.charities         TO anon;
GRANT SELECT ON public.prize_pools       TO anon;
GRANT SELECT ON public.draws             TO anon;
GRANT SELECT ON public.platform_settings TO anon;

-- authenticated: row-level enforced by RLS
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles             TO authenticated;
GRANT SELECT, INSERT                 ON public.subscriptions        TO authenticated;  -- UPDATE via RPC only [FIX-05]
GRANT SELECT, INSERT, UPDATE, DELETE ON public.golf_scores          TO authenticated;
GRANT SELECT                         ON public.charities            TO authenticated;
GRANT SELECT                         ON public.charity_contributions TO authenticated;
GRANT SELECT                         ON public.prize_pools          TO authenticated;
GRANT SELECT                         ON public.draws                TO authenticated;
GRANT SELECT, INSERT                 ON public.draw_entries         TO authenticated;
GRANT SELECT                         ON public.winners              TO authenticated;  -- [FIX-04] removed UPDATE; use RPC
GRANT SELECT                         ON public.score_frequency_cache TO authenticated;
GRANT SELECT                         ON public.platform_settings    TO authenticated;
GRANT INSERT                         ON public.audit_logs           TO authenticated;

-- service_role: unrestricted (server-side only)
GRANT ALL ON ALL TABLES    IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Function execute grants
GRANT EXECUTE ON FUNCTION public.handle_updated_at()                TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user()                   TO authenticated;
GRANT EXECUTE ON FUNCTION public.enforce_rolling_scores()            TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_score_frequency()            TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_charity_totals()             TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_monthly_fee()                  TO authenticated;  -- [FIX-07]
GRANT EXECUTE ON FUNCTION public.get_user_scores(UUID)               TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_draw_eligibility(UUID)        TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_winner_proof(UUID, TEXT)     TO authenticated;  -- [FIX-04]
GRANT EXECUTE ON FUNCTION public.update_charity_preference(NUMERIC, UUID) TO authenticated; -- [FIX-05]
GRANT EXECUTE ON FUNCTION public.is_admin()                          TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_stats()                   TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_draw_numbers(draw_logic)   TO service_role;
GRANT EXECUTE ON FUNCTION public.process_draw_results(UUID)          TO service_role;
GRANT EXECUTE ON FUNCTION public.recalculate_prize_pool(UUID)        TO service_role;
GRANT EXECUTE ON FUNCTION public.apply_jackpot_rollover(UUID)        TO service_role;   -- [FIX-10]

-- ============================================================
-- STORAGE BUCKETS (run via Supabase dashboard or migration)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('charity-media', 'charity-media', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('winner-proofs', 'winner-proofs', false);

-- ============================================================
-- VIEWS
-- ============================================================

CREATE OR REPLACE VIEW public.active_subscribers_view AS
SELECT
  p.id, p.email, p.full_name, p.country,
  s.plan, s.status, s.current_period_end,
  s.charity_percentage, s.monthly_fee_gbp,
  c.name AS charity_name,
  (SELECT COUNT(*) FROM public.golf_scores gs WHERE gs.user_id = p.id) AS score_count
FROM public.profiles p
JOIN public.subscriptions s ON s.user_id = p.id
LEFT JOIN public.charities c ON c.id = s.selected_charity_id
WHERE s.status = 'active' AND p.is_admin = false;

GRANT SELECT ON public.active_subscribers_view TO service_role;