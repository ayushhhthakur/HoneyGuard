// Invoked by a Postgres trigger (see supabase/migrations/0004_alert_webhook.sql)
// whenever a new row lands in `alerts`. Runs at the edge and talks to Resend
// over plain HTTPS — no SMTP socket needed, which is the main reason this
// lives here instead of in the Express backend (Deno edge runtimes don't do
// long-lived SMTP connections well).
import { corsHeaders, supabaseAdmin } from '../_shared/helpers.ts';

const BACKEND_ALERT_WEBHOOK_URL = Deno.env.get('BACKEND_ALERT_WEBHOOK_URL');
const ALERT_WEBHOOK_SECRET = Deno.env.get('ALERT_WEBHOOK_SECRET');
const SMTP_HOST = Deno.env.get('SMTP_HOST');
const SMTP_PORT = Deno.env.get('SMTP_PORT');
const SMTP_SECURE = Deno.env.get('SMTP_SECURE');
const SMTP_USER = Deno.env.get('SMTP_USER');
const SMTP_PASS = Deno.env.get('SMTP_PASS');
const ALERT_FROM_NAME = Deno.env.get('ALERT_FROM_NAME');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const payload = await req.json();
    const alert = payload.record ?? payload; // pg_net trigger payload shape

    if (!BACKEND_ALERT_WEBHOOK_URL || !ALERT_WEBHOOK_SECRET) {
      console.warn('BACKEND_ALERT_WEBHOOK_URL or ALERT_WEBHOOK_SECRET missing — skipping SMTP alert relay');
      return new Response(JSON.stringify({ success: true, skipped: 'missing SMTP relay config' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Who to notify: every admin/owner in the alert's org
    const { data: recipients } = await supabaseAdmin
      .from('memberships')
      .select('profiles(email)')
      .eq('org_id', alert.org_id)
      .in('role', ['owner', 'admin']);

    const emails = (recipients || []).map((r: any) => r.profiles?.email).filter(Boolean);
    if (emails.length === 0) {
      return new Response(JSON.stringify({ success: true, skipped: 'no recipients' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const smtpConfig = SMTP_HOST && SMTP_USER && SMTP_PASS
      ? {
          host: SMTP_HOST,
          port: SMTP_PORT || '465',
          secure: SMTP_SECURE || 'true',
          user: SMTP_USER,
          pass: SMTP_PASS,
          fromName: ALERT_FROM_NAME || 'HoneyGuard Security',
        }
      : null;

    const res = await fetch(BACKEND_ALERT_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'x-alert-webhook-secret': ALERT_WEBHOOK_SECRET,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        alert,
        recipients: emails,
        smtp: smtpConfig,
      }),
    });

    if (!res.ok) {
      console.error('SMTP relay webhook error', await res.text());
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('notify-alert error', error);
    return new Response(JSON.stringify({ success: false, error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
