-- ============================================================================
-- device_fingerprints — deep client fingerprint captured when a target
-- interacts with a honeytoken (e.g. opens the tracking pixel / fake link).
-- Populated by the public fingerprint-collection endpoint (Express route or
-- the track edge function), never by the dashboard.
-- ============================================================================

create table if not exists public.device_fingerprints (
  id                uuid primary key default gen_random_uuid(),
  org_id            uuid not null references public.organizations (id) on delete cascade,
  token             text references public.tokens (token) on delete set null,
  log_id            uuid references public.token_logs (id) on delete set null,

  -- stable-ish composite id computed client-side from everything below
  fingerprint_hash  text,

  -- network / request-level (redundant with token_logs, kept for joinless lookups)
  ip_address        text,
  user_agent        text,

  -- rendering fingerprints
  canvas_hash       text,
  webgl_hash        text,
  webgl_vendor      text,
  webgl_renderer    text,
  audio_hash        text,

  -- environment leaks
  screen_resolution text,
  color_depth       int,
  pixel_ratio       real,
  timezone          text,
  languages         text[],
  platform          text,
  hardware_concurrency int,
  device_memory     real,
  touch_support     boolean,
  fonts             text[],
  plugins           text[],
  cookies_enabled   boolean,
  do_not_track      text,
  webdriver         boolean,      -- navigator.webdriver === true is a strong bot/automation signal
  incognito_guess   boolean,

  raw               jsonb not null default '{}'::jsonb, -- everything else, unfiltered
  created_at        timestamptz not null default now()
);

create index if not exists fingerprints_org_idx on public.device_fingerprints (org_id);
create index if not exists fingerprints_token_idx on public.device_fingerprints (token);
create index if not exists fingerprints_hash_idx on public.device_fingerprints (fingerprint_hash);

alter table public.device_fingerprints enable row level security;

drop policy if exists "fingerprints_select_members" on public.device_fingerprints;
create policy "fingerprints_select_members"
  on public.device_fingerprints for select
  to authenticated
  using (public.is_org_member(org_id, auth.uid()));

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'device_fingerprints') then
    alter publication supabase_realtime add table public.device_fingerprints;
  end if;
end $$;
