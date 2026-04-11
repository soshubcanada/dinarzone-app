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
