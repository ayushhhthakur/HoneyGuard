-- ============================================================================
-- HoneyGuard security domain — categories, tokens, token_logs, alerts
-- Every table here is scoped by org_id and RLS-gated on org membership.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- categories
-- ----------------------------------------------------------------------------
create table if not exists public.categories (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations (id) on delete cascade,
  category     text not null,
  description  text,
  created_at   timestamptz not null default now(),
  created_by   uuid references public.profiles (id) on delete set null,
  unique (org_id, category)
);

-- ----------------------------------------------------------------------------
-- tokens (the honeytokens themselves)
-- ----------------------------------------------------------------------------
create table if not exists public.tokens (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations (id) on delete cascade,
  token_name   text not null,
  description  text,
  category     text not null,
  token        text not null unique,
  imageurl     text,
  imagepath    text,
  filename     text,
  mimetype     text,
  size         text,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  created_by   uuid references public.profiles (id) on delete set null,
  metadata     jsonb not null default '{}'::jsonb
);

create index if not exists tokens_org_idx on public.tokens (org_id);
create index if not exists tokens_category_idx on public.tokens (org_id, category);
create index if not exists tokens_created_at_idx on public.tokens (created_at desc);

-- ----------------------------------------------------------------------------
-- token_logs (every honeytoken interaction — the attack signal)
-- org_id is denormalized onto the log row so RLS/queries don't need a join
-- against tokens for every single realtime insert.
-- ----------------------------------------------------------------------------
create table if not exists public.token_logs (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations (id) on delete cascade,
  token        text not null references public.tokens (token) on delete cascade,
  event        text not null,
  status       text not null,
  ip_address   text,
  user_agent   text,
  os           text,
  browser      text,
  device       text,
  country      text,
  region       text,
  city         text,
  timezone     text,
  isp          text,
  latitude     double precision,
  longitude    double precision,
  "timestamp"  timestamptz not null default now(),
  metadata     jsonb not null default '{}'::jsonb
);

create index if not exists token_logs_org_idx on public.token_logs (org_id);
create index if not exists token_logs_token_idx on public.token_logs (token);
create index if not exists token_logs_timestamp_idx on public.token_logs ("timestamp" desc);
create index if not exists token_logs_ip_idx on public.token_logs (ip_address);

-- ----------------------------------------------------------------------------
-- alerts (derived signal — created when a log looks suspicious)
-- ----------------------------------------------------------------------------
create table if not exists public.alerts (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.organizations (id) on delete cascade,
  token         text references public.tokens (token) on delete set null,
  log_id        uuid references public.token_logs (id) on delete set null,
  type          text not null,
  severity      text not null default 'medium' check (severity in ('low', 'medium', 'high', 'critical')),
  message       text not null,
  details       jsonb not null default '{}'::jsonb,
  status        text not null default 'open' check (status in ('open', 'acknowledged', 'resolved')),
  created_at    timestamptz not null default now(),
  resolved_at   timestamptz,
  resolved_by   uuid references public.profiles (id) on delete set null
);

create index if not exists alerts_org_idx on public.alerts (org_id);
create index if not exists alerts_status_idx on public.alerts (org_id, status);
create index if not exists alerts_created_at_idx on public.alerts (created_at desc);

-- ----------------------------------------------------------------------------
-- RLS — every policy is gated on org membership via is_org_member()
-- ----------------------------------------------------------------------------
alter table public.categories enable row level security;
alter table public.tokens     enable row level security;
alter table public.token_logs enable row level security;
alter table public.alerts     enable row level security;

drop policy if exists "categories_select_members" on public.categories;
create policy "categories_select_members"
  on public.categories for select
  to authenticated
  using (public.is_org_member(org_id, auth.uid()));

drop policy if exists "tokens_select_members" on public.tokens;
create policy "tokens_select_members"
  on public.tokens for select
  to authenticated
  using (public.is_org_member(org_id, auth.uid()));

drop policy if exists "token_logs_select_members" on public.token_logs;
create policy "token_logs_select_members"
  on public.token_logs for select
  to authenticated
  using (public.is_org_member(org_id, auth.uid()));

drop policy if exists "alerts_select_members" on public.alerts;
create policy "alerts_select_members"
  on public.alerts for select
  to authenticated
  using (public.is_org_member(org_id, auth.uid()));

-- ----------------------------------------------------------------------------
-- Realtime: publish the tables the dashboard watches live
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'tokens') then
    alter publication supabase_realtime add table public.tokens;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'token_logs') then
    alter publication supabase_realtime add table public.token_logs;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'alerts') then
    alter publication supabase_realtime add table public.alerts;
  end if;
end $$;
