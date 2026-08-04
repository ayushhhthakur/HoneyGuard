-- ============================================================================
-- audit_logs — append-only record of security-sensitive actions (role
-- changes, member removal, token/category deletion, invite lifecycle).
-- Written by the backend (service role) only; readable by org admins/owners.
-- ============================================================================

create table if not exists public.audit_logs (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations (id) on delete cascade,
  actor_id     uuid references public.profiles (id) on delete set null,
  action       text not null,
  target_type  text,
  target_id    text,
  metadata     jsonb not null default '{}'::jsonb,
  ip_address   text,
  created_at   timestamptz not null default now()
);

create index if not exists audit_logs_org_idx on public.audit_logs (org_id, created_at desc);
create index if not exists audit_logs_action_idx on public.audit_logs (action);

alter table public.audit_logs enable row level security;

-- Only admins/owners can read the audit trail for their org. No client-side
-- write policy is defined — inserts only ever happen via the service-role
-- backend, same convention as every other table in this schema.
drop policy if exists "audit_logs_select_admins" on public.audit_logs;
create policy "audit_logs_select_admins"
  on public.audit_logs for select
  to authenticated
  using (
    exists (
      select 1 from public.memberships m
      where m.org_id = public.audit_logs.org_id
        and m.user_id = auth.uid()
        and m.role in ('admin', 'owner')
    )
  );
