-- ============================================================
-- Digital Heroes Platform — Seed Data
-- ============================================================

-- Sample Charities
INSERT INTO public.charities (name, slug, description, short_description, category, status, featured_order, upcoming_events) VALUES
(
  'Irish Heart Foundation',
  'irish-heart-foundation',
  'The Irish Heart Foundation is Ireland''s national charity dedicated to the prevention and reduction of death and disability from heart disease and stroke. Through research, advocacy, and community programmes, we''re fighting cardiovascular disease across Ireland.',
  'Fighting heart disease and stroke across Ireland',
  'Health',
  'featured',
  1,
  '[{"title":"Golf Classic Charity Day","date":"2026-06-15","location":"K Club, Kildare"},{"title":"Heart Walk Dublin","date":"2026-09-20","location":"Phoenix Park, Dublin"}]'::jsonb
),
(
  'Goal Ireland',
  'goal-ireland',
  'GOAL is an international humanitarian response agency, founded and based in Ireland. We respond to the needs of the most vulnerable communities in the world, working in some of the world''s most difficult environments.',
  'International humanitarian aid from Ireland to the world',
  'International Aid',
  'featured',
  2,
  '[{"title":"Charity Golf Scramble","date":"2026-07-08","location":"Portmarnock Golf Club"}]'::jsonb
),
(
  'Simon Community Ireland',
  'simon-community',
  'Simon Communities work to prevent homelessness and support people out of homelessness across Ireland. We provide emergency, transitional and long-term housing and support services to men, women and children.',
  'Ending homelessness across Ireland',
  'Social Services',
  'active',
  NULL,
  '[]'::jsonb
),
(
  'Pieta House',
  'pieta-house',
  'Pieta provides a free, therapeutic approach to people who are in suicidal distress and those who engage in self-harm. We also provide support for those bereaved by suicide and for those bereaved traumatically.',
  'Mental health support and suicide prevention',
  'Mental Health',
  'featured',
  3,
  '[{"title":"Darkness into Light Golf Day","date":"2026-05-10","location":"Various Venues Nationwide"}]'::jsonb
),
(
  'Children''s Health Foundation',
  'childrens-health-foundation',
  'Children''s Health Foundation raises funds to support sick children and their families at Children''s Health Ireland hospitals. Every euro raised goes directly to supporting the health and wellbeing of sick children in our care.',
  'Supporting sick children and their families',
  'Children',
  'active',
  NULL,
  '[]'::jsonb
),
(
  'Age Action Ireland',
  'age-action-ireland',
  'Age Action is Ireland''s leading advocacy organisation for older people and works to achieve better policies and services for older people and to support older people to live full and active lives.',
  'Championing older people across Ireland',
  'Elderly Care',
  'active',
  NULL,
  '[]'::jsonb
);

-- Sample Draw (current month)
WITH current_pool AS (
  INSERT INTO public.prize_pools (period_month, period_year, total_pool_gbp, active_subscribers)
  VALUES (EXTRACT(month FROM now())::INTEGER, EXTRACT(year FROM now())::INTEGER, 4750.00, 500)
  RETURNING id
)
INSERT INTO public.draws (prize_pool_id, period_month, period_year, status, logic_type, total_entries)
SELECT id, EXTRACT(month FROM now())::INTEGER, EXTRACT(year FROM now())::INTEGER, 'pending', 'random', 0
FROM current_pool;

-- Update prize pool tiers for the created pool
DO $$
DECLARE v_pool_id UUID;
BEGIN
  SELECT id INTO v_pool_id FROM public.prize_pools ORDER BY created_at DESC LIMIT 1;
  PERFORM public.recalculate_prize_pool(v_pool_id);
END $$;

-- Platform admin user (to be created via Supabase Auth, then updated)
-- UPDATE public.profiles SET is_admin = true WHERE email = 'admin@digitalheroes.co.in';
