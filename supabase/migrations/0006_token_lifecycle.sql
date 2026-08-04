-- ============================================================================
-- Token lifecycle — extends `tokens` to support the full deception-platform
-- catalogue (26 token types across credentials, cloud, documents, business
-- records, messaging/API keys, storage URLs) instead of the original four
-- hardcoded categories.
--
-- Design notes:
--   * `category` keeps its original meaning (a user-organizable grouping,
--     backed by the `categories` table) — unchanged, non-breaking.
--   * `token_type` is new: the specific registry key (e.g. 'aws_credentials',
--     'word_document', 'stripe_key') that drives which generator, format,
--     and tracking mechanism applies. See backend/src/domain/tokenTypes.
--   * `imageurl`/`imagepath`/`filename`/`mimetype`/`size` are reused as-is
--     for ANY file-based token (PDF/Word/Excel/PPT/HTML/Image), not just
--     images — renaming them would be a bigger migration for no behavioral
--     gain, so the columns are just used more broadly now.
-- ============================================================================

alter table public.tokens
  add column if not exists token_type      text,
  add column if not exists tags            text[] not null default '{}'::text[],
  add column if not exists status          text not null default 'active'
                                              check (status in ('active', 'rotated', 'expired', 'revoked')),
  add column if not exists expires_at      timestamptz,
  add column if not exists rotated_at      timestamptz,
  add column if not exists rotated_from    uuid references public.tokens (id) on delete set null,
  add column if not exists delivery_method text, -- 'file' | 'string' | 'url'
  add column if not exists file_format     text; -- 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'html' | 'image' | null

create index if not exists tokens_token_type_idx on public.tokens (org_id, token_type);
create index if not exists tokens_status_idx on public.tokens (org_id, status);
create index if not exists tokens_expires_at_idx on public.tokens (expires_at) where expires_at is not null;
create index if not exists tokens_tags_idx on public.tokens using gin (tags);

-- ----------------------------------------------------------------------------
-- token_rotations — append-only history of rotation events. A rotation
-- creates a brand-new token row (new value, same token_type/category) and
-- marks the old one `rotated`; this table links them and records why.
-- ----------------------------------------------------------------------------
create table if not exists public.token_rotations (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references public.organizations (id) on delete cascade,
  previous_token  text not null,
  new_token       text not null,
  reason          text,
  rotated_by      uuid references public.profiles (id) on delete set null,
  rotated_at      timestamptz not null default now()
);

create index if not exists token_rotations_org_idx on public.token_rotations (org_id, rotated_at desc);

alter table public.token_rotations enable row level security;

drop policy if exists "token_rotations_select_members" on public.token_rotations;
create policy "token_rotations_select_members"
  on public.token_rotations for select
  to authenticated
  using (public.is_org_member(org_id, auth.uid()));

-- ----------------------------------------------------------------------------
-- Auto-expire: a lightweight function the backend calls opportunistically
-- (see tokenLifecycle.service.js) rather than relying solely on a cron —
-- but also safe to run on a schedule (pg_cron / edge function) if you want
-- expiry to happen even when nobody's looking at the dashboard.
-- ----------------------------------------------------------------------------
create or replace function public.expire_due_tokens(p_org_id uuid default null)
returns integer
language sql
as $$
  with expired as (
    update public.tokens
    set status = 'expired'
    where status = 'active'
      and expires_at is not null
      and expires_at <= now()
      and (p_org_id is null or org_id = p_org_id)
    returning id
  )
  select count(*)::integer from expired;
$$;
