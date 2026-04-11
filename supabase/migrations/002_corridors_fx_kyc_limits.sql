-- DinarZone Migration 002: Currency Corridors, FX Locking & KYC Monthly Limits
-- Adds the rate engine's corridor model to the database + monthly usage tracking

-- ==========================================
-- CURRENCY CORRIDORS (replaces flat exchange_rates)
-- Maps to the rate engine: mid_market_rate × (1 - dz_margin_percent)
-- ==========================================
create table public.currency_corridors (
  id serial primary key,
  corridor_code char(5) not null unique, -- e.g. 'CA-DZ'
  source_currency char(3) not null,
  target_currency char(3) not null,
  mid_market_rate numeric(18,6) not null,
  dz_margin_percent numeric(5,4) not null default 0.008, -- 0.8%
  fee_flat numeric(10,2) not null default 0.00,
  fee_percent numeric(5,4) not null default 0.0000,
  min_amount numeric(10,2) not null default 10.00,
  max_amount numeric(10,2) not null default 10000.00,
  is_active boolean not null default true,
  rate_source text not null default 'manual', -- 'manual', 'thunes', 'openexchangerates'
  last_rate_fetch timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Seed corridors matching the rate engine constants
insert into public.currency_corridors (corridor_code, source_currency, target_currency, mid_market_rate, dz_margin_percent, min_amount, max_amount) values
  ('CA-DZ', 'CAD', 'DZD', 100.300000, 0.0080, 10, 10000),
  ('CA-TN', 'CAD', 'TND', 2.300000,   0.0090, 10, 10000),
  ('CA-QA', 'CAD', 'QAR', 2.740000,   0.0070, 10, 10000),
  ('CA-AE', 'CAD', 'AED', 2.760000,   0.0070, 10, 10000),
  ('QA-DZ', 'QAR', 'DZD', 37.600000,  0.0120, 10, 10000),
  ('QA-TN', 'QAR', 'TND', 0.860000,   0.0120, 10, 10000),
  ('QA-AE', 'QAR', 'AED', 1.010000,   0.0050, 10, 10000),
  ('AE-DZ', 'AED', 'DZD', 37.200000,  0.0110, 10, 10000),
  ('AE-TN', 'AED', 'TND', 0.850000,   0.0110, 10, 10000),
  ('DZ-TN', 'DZD', 'TND', 0.023300,   0.0150, 10, 10000);

create index idx_corridors_active on public.currency_corridors(is_active) where is_active = true;
create index idx_corridors_currencies on public.currency_corridors(source_currency, target_currency);

-- RLS: corridors are public-readable
alter table public.currency_corridors enable row level security;
create policy "Anyone can view active corridors"
  on public.currency_corridors for select using (is_active = true);

-- Updated_at trigger
create trigger set_corridors_updated_at
  before update on public.currency_corridors
  for each row execute procedure public.set_updated_at();

-- ==========================================
-- FEE TIERS (database-driven fee schedule)
-- ==========================================
create table public.fee_tiers (
  id serial primary key,
  max_amount numeric(12,2) not null, -- upper bound (NULL = no limit)
  fixed_fee numeric(10,2) not null,
  percent_fee numeric(5,4) not null default 0.0000,
  corridor_code char(5), -- NULL = applies globally
  created_at timestamptz not null default now()
);

-- Seed global fee tiers matching the rate engine
insert into public.fee_tiers (max_amount, fixed_fee, percent_fee) values
  (100.00,    1.99, 0.0000),
  (500.00,    3.99, 0.0000),
  (1000.00,   4.99, 0.0000),
  (3000.00,   4.99, 0.0050),
  (5000.00,   4.99, 0.0030),
  (999999.99, 4.99, 0.0020);

-- RLS: fee tiers are public-readable
alter table public.fee_tiers enable row level security;
create policy "Anyone can view fee tiers"
  on public.fee_tiers for select using (true);

-- ==========================================
-- DELIVERY SURCHARGES
-- ==========================================
create table public.delivery_surcharges (
  id serial primary key,
  delivery_method text not null unique,
  surcharge numeric(10,2) not null default 0.00
);

insert into public.delivery_surcharges (delivery_method, surcharge) values
  ('baridimob_ccp', 0.00),
  ('cash_pickup',   2.00),
  ('bank_transfer', 0.00),
  ('d17_laposte',   0.00),
  ('exchange_house', 1.50),
  ('virtual_card',  0.00);

alter table public.delivery_surcharges enable row level security;
create policy "Anyone can view surcharges"
  on public.delivery_surcharges for select using (true);

-- ==========================================
-- KYC MONTHLY USAGE TRACKING
-- ==========================================
create table public.kyc_monthly_usage (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  period char(7) not null, -- 'YYYY-MM' format
  total_sent_cad numeric(12,2) not null default 0.00,
  transaction_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, period)
);

create index idx_kyc_usage_user_period on public.kyc_monthly_usage(user_id, period);

alter table public.kyc_monthly_usage enable row level security;
create policy "Users can view own usage"
  on public.kyc_monthly_usage for select using (auth.uid() = user_id);

create trigger set_kyc_usage_updated_at
  before update on public.kyc_monthly_usage
  for each row execute procedure public.set_updated_at();

-- ==========================================
-- FX RATE LOCKS (persisted quotes)
-- ==========================================
create table public.rate_locks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  corridor_id int references public.currency_corridors(id) not null,
  send_amount numeric(12,2) not null,
  send_currency char(3) not null,
  receive_amount numeric(14,2) not null,
  receive_currency char(3) not null,
  locked_rate numeric(18,6) not null,
  mid_market_rate numeric(18,6) not null,
  fee_charged numeric(10,2) not null,
  total_charged numeric(12,2) not null,
  delivery_method text,
  locked_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used boolean not null default false,
  transfer_id uuid references public.transfers(id)
);

create index idx_rate_locks_user on public.rate_locks(user_id);
create index idx_rate_locks_active on public.rate_locks(user_id, used, expires_at)
  where used = false;

alter table public.rate_locks enable row level security;
create policy "Users can view own rate locks"
  on public.rate_locks for select using (auth.uid() = user_id);
create policy "Users can create own rate locks"
  on public.rate_locks for insert with check (auth.uid() = user_id);

-- ==========================================
-- ENHANCE TRANSFERS: link to corridor + rate lock
-- ==========================================
alter table public.transfers
  add column if not exists corridor_id int references public.currency_corridors(id),
  add column if not exists rate_lock_id uuid references public.rate_locks(id),
  add column if not exists mid_market_rate numeric(18,6),
  add column if not exists dz_margin_applied numeric(5,4),
  add column if not exists fee_breakdown jsonb;

-- ==========================================
-- ENHANCE PROFILES: monthly limit tracking
-- ==========================================
alter table public.profiles
  add column if not exists monthly_limit_cad numeric(12,2) not null default 0.00,
  add column if not exists email_verified boolean not null default false,
  add column if not exists phone_verified boolean not null default false;

-- Set monthly limits based on existing kyc_tier
update public.profiles set monthly_limit_cad = case
  when kyc_tier = 'tier_0' then 0.00
  when kyc_tier = 'tier_1' then 200.00
  when kyc_tier = 'tier_2' then 2000.00
  when kyc_tier = 'tier_3' then 10000.00
  else 0.00
end;

-- ==========================================
-- STORED FUNCTIONS
-- ==========================================

-- Get DZ rate for a corridor (mid_market × (1 - margin))
create or replace function public.get_dz_rate(p_corridor_code text)
returns numeric as $$
  select round(mid_market_rate * (1 - dz_margin_percent), 4)
  from public.currency_corridors
  where corridor_code = p_corridor_code and is_active = true;
$$ language sql stable;

-- Calculate fee for an amount (finds matching tier)
create or replace function public.calculate_fee(
  p_amount numeric,
  p_corridor_code text default null
)
returns table(fixed_fee numeric, percent_fee numeric, total_fee numeric) as $$
  select
    ft.fixed_fee,
    round(p_amount * ft.percent_fee, 2) as percent_fee,
    round(ft.fixed_fee + (p_amount * ft.percent_fee), 2) as total_fee
  from public.fee_tiers ft
  where ft.max_amount >= p_amount
    and (ft.corridor_code = p_corridor_code or ft.corridor_code is null)
  order by ft.max_amount asc
  limit 1;
$$ language sql stable;

-- Check if user can send (KYC limit enforcement)
create or replace function public.can_user_send(
  p_user_id uuid,
  p_amount_cad numeric
)
returns boolean as $$
declare
  v_tier text;
  v_limit numeric;
  v_used numeric;
  v_period text;
begin
  -- Get user tier and limit
  select kyc_tier, monthly_limit_cad into v_tier, v_limit
  from public.profiles where id = p_user_id;

  if v_tier = 'tier_0' then return false; end if;

  -- Get current month usage
  v_period := to_char(now(), 'YYYY-MM');
  select coalesce(total_sent_cad, 0) into v_used
  from public.kyc_monthly_usage
  where user_id = p_user_id and period = v_period;

  if v_used is null then v_used := 0; end if;

  return (v_used + p_amount_cad) <= v_limit;
end;
$$ language plpgsql stable security definer;

-- Record monthly usage after transfer
create or replace function public.record_monthly_usage()
returns trigger as $$
begin
  if new.status = 'paid' and (old.status is null or old.status != 'paid') then
    insert into public.kyc_monthly_usage (user_id, period, total_sent_cad, transaction_count)
    values (
      new.user_id,
      to_char(now(), 'YYYY-MM'),
      new.send_amount,
      1
    )
    on conflict (user_id, period) do update set
      total_sent_cad = public.kyc_monthly_usage.total_sent_cad + new.send_amount,
      transaction_count = public.kyc_monthly_usage.transaction_count + 1,
      updated_at = now();
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_transfer_paid
  after insert or update on public.transfers
  for each row execute procedure public.record_monthly_usage();

-- Auto-update monthly_limit_cad when kyc_tier changes
create or replace function public.sync_kyc_limit()
returns trigger as $$
begin
  new.monthly_limit_cad := case
    when new.kyc_tier = 'tier_0' then 0.00
    when new.kyc_tier = 'tier_1' then 200.00
    when new.kyc_tier = 'tier_2' then 2000.00
    when new.kyc_tier = 'tier_3' then 10000.00
    else 0.00
  end;
  return new;
end;
$$ language plpgsql;

create trigger on_kyc_tier_change
  before update of kyc_tier on public.profiles
  for each row execute procedure public.sync_kyc_limit();
