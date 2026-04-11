-- ============================================================================
-- DinarZone — Combined migrations for one-shot run in Supabase SQL Editor
-- Project: vdmfeqytgcmwqvzobcai
-- How to run:
--   1. Open https://supabase.com/dashboard/project/vdmfeqytgcmwqvzobcai/sql/new
--   2. Paste this entire file
--   3. Click "Run" (bottom right)
--   4. Verify: no errors, "Success. No rows returned."
-- Idempotent-safe: uses `if not exists` / `create or replace` where possible
-- ============================================================================

-- ============================================================================
-- 001_initial_schema.sql
-- ============================================================================

-- DinarZone Database Schema
-- Run via Supabase Dashboard > SQL Editor or `supabase db push`

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==========================================
-- PROFILES (extends Supabase auth.users)
-- ==========================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  phone text,
  country char(2) not null default 'CA',
  account_type text not null default 'personal' check (account_type in ('personal', 'business')),
  business_name text,
  business_type text,
  business_registration text,
  kyc_tier text not null default 'tier_0' check (kyc_tier in ('tier_0', 'tier_1', 'tier_2', 'tier_3')),
  kyc_verified_at timestamptz,
  preferred_locale char(2) not null default 'fr',
  referral_code text unique,
  referred_by text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone, country, account_type, business_name, business_type)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'country', 'CA'),
    coalesce(new.raw_user_meta_data->>'account_type', 'personal'),
    new.raw_user_meta_data->>'business_name',
    new.raw_user_meta_data->>'business_type'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==========================================
-- RECIPIENTS (beneficiaries)
-- ==========================================
create table public.recipients (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  full_name text not null,
  country char(2) not null,
  phone text,
  delivery_method text not null check (delivery_method in (
    'baridimob_ccp', 'cash_pickup', 'bank_transfer', 'd17_laposte', 'exchange_house', 'virtual_card'
  )),
  ccp_number text,
  bank_name text,
  iban text,
  preferred_agent uuid,
  city text,
  nickname text,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_recipients_user on public.recipients(user_id);

-- ==========================================
-- TRANSFERS
-- ==========================================
create table public.transfers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  tracking_code text unique not null,
  from_country char(2) not null,
  to_country char(2) not null,
  send_amount numeric(12,2) not null check (send_amount > 0),
  send_currency char(3) not null,
  receive_amount numeric(14,2) not null check (receive_amount > 0),
  receive_currency char(3) not null,
  exchange_rate numeric(12,6) not null,
  fee numeric(10,2) not null default 0,
  delivery_method text not null,
  recipient_name text not null,
  recipient_phone text,
  recipient_account text,
  recipient_id uuid references public.recipients(id),
  agent_id uuid,
  status text not null default 'draft' check (status in (
    'draft', 'pending_payment', 'paid', 'payment_failed',
    'processing', 'sent_to_provider', 'in_transit',
    'available_for_pickup', 'delivered', 'cancelled', 'refunded'
  )),
  stripe_payment_id text,
  thunes_transaction_id text,
  paid_at timestamptz,
  delivered_at timestamptz,
  failure_reason text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_transfers_user on public.transfers(user_id);
create index idx_transfers_status on public.transfers(status);
create index idx_transfers_tracking on public.transfers(tracking_code);

-- ==========================================
-- AGENTS (cash pickup points)
-- ==========================================
create table public.agents (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  country char(2) not null,
  city text not null,
  address text not null,
  phone text,
  lat numeric(10,7),
  lng numeric(10,7),
  delivery_methods text[] not null default '{}',
  opening_hours text,
  float_balance numeric(14,2) not null default 0,
  is_active boolean not null default true,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_agents_country_city on public.agents(country, city);
create index idx_agents_active on public.agents(is_active) where is_active = true;

-- ==========================================
-- KYC DOCUMENTS
-- ==========================================
create table public.kyc_documents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  document_type text not null check (document_type in (
    'passport', 'national_id', 'drivers_license', 'selfie', 'proof_of_address', 'business_registration'
  )),
  file_url text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  sumsub_check_id text,
  rejection_reason text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index idx_kyc_user on public.kyc_documents(user_id);

-- ==========================================
-- EXCHANGE RATES CACHE
-- ==========================================
create table public.exchange_rates (
  id uuid primary key default uuid_generate_v4(),
  from_currency char(3) not null,
  to_currency char(3) not null,
  rate numeric(12,6) not null,
  fee_percent numeric(5,2) not null default 1.5,
  min_amount numeric(10,2),
  max_amount numeric(10,2),
  source text not null default 'manual',
  fetched_at timestamptz not null default now(),
  unique(from_currency, to_currency)
);

-- ==========================================
-- NOTIFICATIONS
-- ==========================================
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('transfer_status', 'kyc_update', 'rate_alert', 'promo', 'system')),
  title text not null,
  body text not null,
  data jsonb,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_notifications_user on public.notifications(user_id);
create index idx_notifications_unread on public.notifications(user_id) where read = false;

-- ==========================================
-- ROW LEVEL SECURITY
-- ==========================================
alter table public.profiles enable row level security;
alter table public.recipients enable row level security;
alter table public.transfers enable row level security;
alter table public.kyc_documents enable row level security;
alter table public.notifications enable row level security;
alter table public.agents enable row level security;
alter table public.exchange_rates enable row level security;

-- Profiles: users can only read/update their own
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Recipients: users can CRUD their own
create policy "Users can view own recipients" on public.recipients for select using (auth.uid() = user_id);
create policy "Users can insert own recipients" on public.recipients for insert with check (auth.uid() = user_id);
create policy "Users can update own recipients" on public.recipients for update using (auth.uid() = user_id);
create policy "Users can delete own recipients" on public.recipients for delete using (auth.uid() = user_id);

-- Transfers: users can read own, insert own
create policy "Users can view own transfers" on public.transfers for select using (auth.uid() = user_id);
create policy "Users can create own transfers" on public.transfers for insert with check (auth.uid() = user_id);

-- KYC: users can read/insert own
create policy "Users can view own kyc docs" on public.kyc_documents for select using (auth.uid() = user_id);
create policy "Users can submit kyc docs" on public.kyc_documents for insert with check (auth.uid() = user_id);

-- Notifications: users can read/update own
create policy "Users can view own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "Users can mark own notifications read" on public.notifications for update using (auth.uid() = user_id);

-- Agents: everyone can read active agents
create policy "Anyone can view active agents" on public.agents for select using (is_active = true);

-- Exchange rates: everyone can read
create policy "Anyone can view exchange rates" on public.exchange_rates for select using (true);

-- ==========================================
-- UPDATED_AT TRIGGER
-- ==========================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
create trigger set_recipients_updated_at before update on public.recipients for each row execute procedure public.set_updated_at();
create trigger set_transfers_updated_at before update on public.transfers for each row execute procedure public.set_updated_at();


-- ============================================================================
-- 002_corridors_fx_kyc_limits.sql
-- ============================================================================

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


-- ============================================================================
-- 003_pos_agents.sql
-- ============================================================================

-- DinarZone Migration 003: Point-of-Sale Partner Agents
-- Stores partner applications (kiosques, agences de voyage, superettes)
-- Distinct from `agents` table which holds verified pickup points

-- ==========================================
-- POS AGENTS (partner applications)
-- ==========================================
create table public.pos_agents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,

  -- Business identity
  business_name text not null,
  rc_number text not null,               -- Registre de Commerce / NIF
  address text not null,
  city text,
  country char(2) not null default 'DZ',
  phone text,

  -- Storefront
  store_photo_url text,
  opening_hours text,
  lat numeric(10,7),
  lng numeric(10,7),

  -- Commission & delivery
  commission_percent numeric(4,2) not null default 1.50,  -- 1.5% per transaction
  delivery_methods text[] not null default '{cash_pickup}',

  -- Approval workflow
  status text not null default 'pending' check (status in (
    'pending',       -- submitted, awaiting review
    'approved',      -- ops team validated
    'rejected',      -- denied (reason in rejection_reason)
    'suspended'      -- temporarily disabled
  )),
  rejection_reason text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,

  -- AML compliance
  aml_accepted boolean not null default false,
  commission_accepted boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_pos_agents_status on public.pos_agents(status);
create index idx_pos_agents_country on public.pos_agents(country, city);
create index idx_pos_agents_user on public.pos_agents(user_id);

-- ==========================================
-- ROW LEVEL SECURITY
-- ==========================================
alter table public.pos_agents enable row level security;

-- Users can view their own applications
create policy "Users can view own pos applications"
  on public.pos_agents for select
  using (auth.uid() = user_id);

-- Users can submit applications
create policy "Users can submit pos application"
  on public.pos_agents for insert
  with check (auth.uid() = user_id);

-- Users can update their own pending applications
create policy "Users can update own pending application"
  on public.pos_agents for update
  using (auth.uid() = user_id and status = 'pending');

-- Public: anyone can view approved agents (for the agent map)
create policy "Anyone can view approved agents"
  on public.pos_agents for select
  using (status = 'approved');

-- ==========================================
-- AUTO-PROMOTE: When approved, create entry in agents table
-- ==========================================
create or replace function public.promote_pos_to_agent()
returns trigger as $$
begin
  if new.status = 'approved' and old.status = 'pending' then
    insert into public.agents (
      name, country, city, address, phone, lat, lng,
      delivery_methods, opening_hours, is_active, verified_at
    ) values (
      new.business_name,
      new.country,
      coalesce(new.city, ''),
      new.address,
      new.phone,
      new.lat,
      new.lng,
      new.delivery_methods,
      new.opening_hours,
      true,
      now()
    );

    -- Notify the partner
    insert into public.notifications (user_id, type, title, body, data)
    values (
      new.user_id,
      'system',
      'Candidature approuvee',
      'Votre point de service ' || new.business_name || ' est maintenant actif sur DinarZone.',
      jsonb_build_object('pos_agent_id', new.id, 'status', 'approved')
    );
  end if;

  if new.status = 'rejected' and old.status = 'pending' then
    insert into public.notifications (user_id, type, title, body, data)
    values (
      new.user_id,
      'system',
      'Candidature refusee',
      'Votre candidature pour ' || new.business_name || ' n''a pas ete retenue. Motif: ' || coalesce(new.rejection_reason, 'Non specifie'),
      jsonb_build_object('pos_agent_id', new.id, 'status', 'rejected')
    );
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_pos_agent_status_change
  after update of status on public.pos_agents
  for each row execute procedure public.promote_pos_to_agent();

-- ==========================================
-- UPDATED_AT TRIGGER
-- ==========================================
create trigger set_pos_agents_updated_at
  before update on public.pos_agents
  for each row execute procedure public.set_updated_at();


-- ============================================================================
-- 004_referral_rewards.sql
-- ============================================================================

-- DinarZone Migration 004: Referral Rewards System
-- Tracks referral bonuses triggered on first qualifying transfer

-- ==========================================
-- REFERRAL REWARDS
-- ==========================================
create table public.referral_rewards (
  id uuid primary key default uuid_generate_v4(),

  -- The referrer (person who shared the code)
  referrer_id uuid references public.profiles(id) on delete set null not null,

  -- The referred user (person who signed up with the code)
  referred_id uuid references public.profiles(id) on delete set null not null,

  -- The transfer that triggered the reward
  transfer_id uuid references public.transfers(id) on delete set null not null,

  -- Reward amounts
  referrer_reward numeric(10,2) not null default 10.00,
  referred_reward numeric(10,2) not null default 10.00,
  reward_currency char(3) not null default 'CAD',

  -- Status tracking
  status text not null default 'pending' check (status in (
    'pending',    -- reward created, awaiting credit
    'credited',   -- both parties credited
    'failed',     -- crediting failed
    'revoked'     -- revoked (e.g. fraudulent transfer)
  )),

  credited_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_referral_rewards_referrer on public.referral_rewards(referrer_id);
create index idx_referral_rewards_referred on public.referral_rewards(referred_id);
create unique index idx_referral_rewards_transfer on public.referral_rewards(transfer_id);

-- ==========================================
-- WALLET BALANCES (credit/promo balances)
-- ==========================================
create table public.wallet_balances (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  currency char(3) not null default 'CAD',
  balance numeric(12,2) not null default 0.00 check (balance >= 0),
  updated_at timestamptz not null default now(),
  unique(user_id, currency)
);

create index idx_wallet_balances_user on public.wallet_balances(user_id);

-- ==========================================
-- WALLET TRANSACTIONS (audit trail)
-- ==========================================
create table public.wallet_transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  amount numeric(10,2) not null,
  currency char(3) not null default 'CAD',
  type text not null check (type in (
    'referral_bonus',     -- earned from referral
    'promo_credit',       -- promotional credit
    'transfer_discount',  -- applied to a transfer
    'withdrawal'          -- cashed out
  )),
  description text,
  reference_id uuid,  -- links to referral_rewards.id or transfer.id
  created_at timestamptz not null default now()
);

create index idx_wallet_transactions_user on public.wallet_transactions(user_id);

-- ==========================================
-- FUNCTION: Credit referral rewards
-- Called from the application (Stripe webhook handler)
-- ==========================================
create or replace function public.credit_referral_reward(
  p_referrer_id uuid,
  p_referred_id uuid,
  p_transfer_id uuid,
  p_reward_amount numeric default 10.00,
  p_currency char(3) default 'CAD'
)
returns uuid as $$
declare
  v_reward_id uuid;
begin
  -- Insert the reward record
  insert into public.referral_rewards (
    referrer_id, referred_id, transfer_id,
    referrer_reward, referred_reward, reward_currency, status, credited_at
  ) values (
    p_referrer_id, p_referred_id, p_transfer_id,
    p_reward_amount, p_reward_amount, p_currency, 'credited', now()
  )
  returning id into v_reward_id;

  -- Upsert referrer wallet balance
  insert into public.wallet_balances (user_id, currency, balance)
  values (p_referrer_id, p_currency, p_reward_amount)
  on conflict (user_id, currency)
  do update set balance = wallet_balances.balance + p_reward_amount, updated_at = now();

  -- Upsert referred wallet balance
  insert into public.wallet_balances (user_id, currency, balance)
  values (p_referred_id, p_currency, p_reward_amount)
  on conflict (user_id, currency)
  do update set balance = wallet_balances.balance + p_reward_amount, updated_at = now();

  -- Audit trail: referrer
  insert into public.wallet_transactions (user_id, amount, currency, type, description, reference_id)
  values (p_referrer_id, p_reward_amount, p_currency, 'referral_bonus',
    'Bonus parrainage — votre filleul a complete son premier transfert', v_reward_id);

  -- Audit trail: referred
  insert into public.wallet_transactions (user_id, amount, currency, type, description, reference_id)
  values (p_referred_id, p_reward_amount, p_currency, 'referral_bonus',
    'Bonus de bienvenue — premier transfert avec code parrainage', v_reward_id);

  -- Notify referrer
  insert into public.notifications (user_id, type, title, body, data)
  values (
    p_referrer_id, 'promo',
    'Bonus parrainage recu',
    'Vous avez gagne ' || p_reward_amount || ' ' || p_currency || ' ! Votre filleul a complete son premier transfert.',
    jsonb_build_object('reward_id', v_reward_id, 'amount', p_reward_amount, 'currency', p_currency)
  );

  -- Notify referred
  insert into public.notifications (user_id, type, title, body, data)
  values (
    p_referred_id, 'promo',
    'Bonus de bienvenue credite',
    'Felicitations ! ' || p_reward_amount || ' ' || p_currency || ' ont ete ajoutes a votre solde.',
    jsonb_build_object('reward_id', v_reward_id, 'amount', p_reward_amount, 'currency', p_currency)
  );

  return v_reward_id;
end;
$$ language plpgsql security definer;

-- ==========================================
-- ROW LEVEL SECURITY
-- ==========================================
alter table public.referral_rewards enable row level security;
alter table public.wallet_balances enable row level security;
alter table public.wallet_transactions enable row level security;

-- Users can view their own rewards (as referrer or referred)
create policy "Users can view own referral rewards"
  on public.referral_rewards for select
  using (auth.uid() = referrer_id or auth.uid() = referred_id);

-- Users can view own wallet
create policy "Users can view own wallet balance"
  on public.wallet_balances for select
  using (auth.uid() = user_id);

-- Users can view own wallet transactions
create policy "Users can view own wallet transactions"
  on public.wallet_transactions for select
  using (auth.uid() = user_id);

-- ==========================================
-- AUTO-GENERATE REFERRAL CODE ON PROFILE CREATE
-- ==========================================
create or replace function public.generate_referral_code()
returns trigger as $$
begin
  if new.referral_code is null then
    new.referral_code := upper(
      regexp_replace(split_part(new.full_name, ' ', 1), '[^A-Za-z]', '', 'g')
    ) || '-DZ' || to_char(extract(year from now())::int % 100, 'FM00');
    -- Handle duplicates by appending random suffix
    while exists (select 1 from public.profiles where referral_code = new.referral_code and id != new.id) loop
      new.referral_code := new.referral_code || chr(65 + floor(random() * 26)::int);
    end loop;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger set_referral_code
  before insert on public.profiles
  for each row execute procedure public.generate_referral_code();
