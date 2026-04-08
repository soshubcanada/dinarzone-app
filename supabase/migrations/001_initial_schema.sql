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
