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
