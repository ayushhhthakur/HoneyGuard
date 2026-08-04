# HoneyGuard — Supabase setup

## 1. Run the migrations (in order)
In the Supabase SQL editor, or via `supabase db push` with the CLI:

1. `0001_core_and_orgs.sql` — profiles, organizations, memberships, invites
2. `0002_security_domain.sql` — categories, tokens, token_logs, alerts (+ RLS + realtime)
3. `0003_fingerprints.sql` — device_fingerprints table
4. `0004_alert_webhook.sql` — fires `notify-alert` via `pg_net` on every new alert row
5. `0005_audit_logs.sql` — audit_logs table (admin/owner-readable audit trail)

## 2. Deploy the edge functions
```bash
supabase functions deploy track-pixel --no-verify-jwt
supabase functions deploy track-event --no-verify-jwt
supabase functions deploy track-fingerprint --no-verify-jwt
supabase functions deploy verify-token --no-verify-jwt
supabase functions deploy notify-alert --no-verify-jwt
```
`--no-verify-jwt` is required for the four public tracking functions — they're hit by
whoever/whatever trips a honeytoken, not by an authenticated dashboard user.
`notify-alert` is only ever called server-side (by the Postgres trigger), so it's safe
to leave open too — it does its own recipient lookup and never trusts the caller.

## 3. Set edge function secrets
```bash
supabase secrets set BACKEND_ALERT_WEBHOOK_URL="https://your-backend.example.com/internal/notify-alert-email"
supabase secrets set ALERT_WEBHOOK_SECRET="your-long-random-shared-secret"
```
These two are required for `notify-alert` to relay an alert's content + recipient list
to your backend, which sends the actual email.

**SMTP credentials live in exactly one place: `backend/.env` (`SMTP_HOST`/`SMTP_USER`/
`SMTP_PASS`/...).** The edge function never sees them — it only ever sends alert
content and a list of recipient addresses over the webhook, authenticated by
`ALERT_WEBHOOK_SECRET`. Don't duplicate SMTP credentials into Supabase secrets; a
credential that exists in exactly one place is one less place it can leak from.

## 4. (Optional) Wire the DB → edge function alert webhook
Only needed if you deployed `notify-alert` and want alerts created via the *edge*
tracking functions (not the Express backend) to also trigger email. Run once, as a
superuser, in the SQL editor:
```sql
alter database postgres set app.settings.edge_base_url = 'https://<project-ref>.functions.supabase.co';
alter database postgres set app.settings.service_role_key = '<service-role-key>';
```

## 5. Point your honeytokens at the edge functions
- Tracking pixel: `https://<project-ref>.functions.supabase.co/track-pixel/<token>`
- Fingerprint collector: served by the Express backend at `/fp.js`, posts to
  `https://<project-ref>.functions.supabase.co/track-fingerprint/<token>`
- Generic/AWS/financial/healthcare pings: `POST .../track-event/<token>`

## 6. First user = first admin
The very first person to sign up doesn't get an org automatically — they see a
"create your organization" screen in the dashboard on first login, and become that
org's `owner`. Everyone who joins after that either creates their own org or accepts
an email invite (Team page → Invite).
