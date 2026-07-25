-- ============================================================================
-- HoneyGuard core schema — identity, organizations, memberships, invites
-- Multi-tenant model: a user (profile) can belong to N organizations, with a
-- different RBAC role in each. All security data (tokens, logs, alerts) is
-- scoped to an organization.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- profiles — identity only, 1:1 with auth.users. NOT where RBAC lives.
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  email        text not null,
  full_name    text,
  is_active    boolean not null default true, -- platform-level kill switch
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.profiles is 'Identity only. RBAC role lives per-org in memberships.';

-- ----------------------------------------------------------------------------
-- organizations — the tenant boundary
-- ----------------------------------------------------------------------------
create table if not exists public.organizations (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  slug         text not null unique,
  created_at   timestamptz not null default now(),
  created_by   uuid references public.profiles (id) on delete set null
);

-- ----------------------------------------------------------------------------
-- memberships — the RBAC join table (user x org -> role)
-- ----------------------------------------------------------------------------
create table if not exists public.memberships (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations (id) on delete cascade,
  user_id      uuid not null references public.profiles (id) on delete cascade,
  role         text not null default 'viewer' check (role in ('owner', 'admin', 'analyst', 'viewer')),
  created_at   timestamptz not null default now(),
  unique (org_id, user_id)
);

comment on column public.memberships.role is
  'owner: billing + delete org + everything admin can do. admin: manage members/invites, tokens, categories, alerts. analyst: create/manage tokens, resolve alerts. viewer: read-only.';

create index if not exists memberships_user_idx on public.memberships (user_id);
create index if not exists memberships_org_idx on public.memberships (org_id);

-- ----------------------------------------------------------------------------
-- invites — email-based invitations into an org
-- ----------------------------------------------------------------------------
create table if not exists public.invites (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations (id) on delete cascade,
  email        text not null,
  role         text not null default 'viewer' check (role in ('admin', 'analyst', 'viewer')),
  token        text not null unique default md5(gen_random_uuid()::text || clock_timestamp()::text),
  invited_by   uuid references public.profiles (id) on delete set null,
  status       text not null default 'pending' check (status in ('pending', 'accepted', 'revoked', 'expired')),
  created_at   timestamptz not null default now(),
  expires_at   timestamptz not null default (now() + interval '7 days'),
  accepted_at  timestamptz,
  unique (org_id, email, status)
);

create index if not exists invites_email_idx on public.invites (email);
create index if not exists invites_token_idx on public.invites (token);

-- ----------------------------------------------------------------------------
-- helper functions used throughout RLS policies + the backend
-- ----------------------------------------------------------------------------
create or replace function public.is_org_member(p_org_id uuid, p_user_id uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.memberships
    where org_id = p_org_id and user_id = p_user_id
  );
$$;

create or replace function public.member_role(p_org_id uuid, p_user_id uuid)
returns text
language sql
stable
security definer set search_path = public
as $$
  select role from public.memberships
  where org_id = p_org_id and user_id = p_user_id
  limit 1;
$$;

-- ----------------------------------------------------------------------------
-- updated_at trigger
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- auto-create a profile whenever a new auth.users row appears. Organization
-- membership is NOT auto-created here — a fresh signup either creates their
-- own org (first-run "create your organization" step in the dashboard) or
-- accepts an invite, both handled explicitly by the backend so we never
-- silently drop someone into the wrong tenant.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- RLS
-- Reads happen two ways: (a) the dashboard's realtime subscriptions, using
-- the signed-in user's own JWT against the anon key — these need real SELECT
-- policies scoped by org membership; (b) the Express backend using the
-- service-role key, which bypasses RLS and does its own membership/role
-- checks (see backend/middleware/org.js). No client-side write policies are
-- defined anywhere in this schema — every mutation goes through the API.
-- ----------------------------------------------------------------------------
alter table public.profiles     enable row level security;
alter table public.organizations enable row level security;
alter table public.memberships  enable row level security;
alter table public.invites      enable row level security;

drop policy if exists "profiles_select_self" on public.profiles;
create policy "profiles_select_self"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

drop policy if exists "profiles_select_org_mates" on public.profiles;
create policy "profiles_select_org_mates"
  on public.profiles for select
  to authenticated
  using (
    exists (
      select 1 from public.memberships m1
      join public.memberships m2 on m1.org_id = m2.org_id
      where m1.user_id = auth.uid() and m2.user_id = public.profiles.id
    )
  );

drop policy if exists "organizations_select_member" on public.organizations;
create policy "organizations_select_member"
  on public.organizations for select
  to authenticated
  using (public.is_org_member(id, auth.uid()));

drop policy if exists "memberships_select_org_mates" on public.memberships;
create policy "memberships_select_org_mates"
  on public.memberships for select
  to authenticated
  using (public.is_org_member(org_id, auth.uid()));

drop policy if exists "invites_select_org_mates" on public.invites;
create policy "invites_select_org_mates"
  on public.invites for select
  to authenticated
  using (public.is_org_member(org_id, auth.uid()));
