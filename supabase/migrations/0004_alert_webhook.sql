-- ============================================================================
-- Fires the `notify-alert` edge function asynchronously whenever a new row
-- lands in public.alerts, using pg_net (enabled by default on Supabase).
--
-- IMPORTANT: this migration references your project ref + service role key
-- as Postgres settings that only exist once you set them yourself:
--
--   alter database postgres set app.settings.edge_base_url = 'https://<project-ref>.functions.supabase.co';
--   alter database postgres set app.settings.service_role_key = '<service-role-key>';
--
-- Run those two ALTER DATABASE statements once (SQL editor, as a superuser),
-- then this migration. Safe to skip entirely if you'd rather keep alert
-- emails on the Express side only (backend/lib/mailer.js already sends them
-- for anything logged through the Express tracking routes).
-- ============================================================================

create extension if not exists pg_net;

create or replace function public.notify_alert_via_edge_function()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  edge_base_url text;
  service_key text;
begin
  begin
    edge_base_url := current_setting('app.settings.edge_base_url', true);
    service_key := current_setting('app.settings.service_role_key', true);
  exception when others then
    return new;
  end;

  if edge_base_url is null or service_key is null then
    -- Not configured — silently skip, Express-side email still covers
    -- anything logged through the Node tracking routes.
    return new;
  end if;

  perform net.http_post(
    url := edge_base_url || '/notify-alert',
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || service_key),
    body := jsonb_build_object('record', to_jsonb(new))
  );

  return new;
end;
$$;

drop trigger if exists trg_notify_alert on public.alerts;
create trigger trg_notify_alert
  after insert on public.alerts
  for each row execute function public.notify_alert_via_edge_function();