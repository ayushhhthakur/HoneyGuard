// Invoked by a Postgres trigger (see supabase/migrations/0004_alert_webhook.sql)
// whenever a new row lands in `alerts`. Looks up who to notify, then asks
// the Express backend to actually send the email through ITS OWN configured
// SMTP credentials (see backend/src/services/mailer.service.js).
//
// SECURITY NOTE: an earlier version of this function held its own copy of
// the SMTP credentials in Deno secrets and forwarded them to Express on
// every call. That's unnecessary secret sprawl (the same credential living
// in two places) and, combined with a permissive Express endpoint, turned
// into an SSRF/open-relay primitive. This function now only ever sends the
// alert CONTENT + recipient list; Express is the only place SMTP
// credentials are configured, full stop.
import { corsHeaders, supabaseAdmin } from '../_shared/helpers.ts';

const BACKEND_ALERT_WEBHOOK_URL = Deno.env.get('BACKEND_ALERT_WEBHOOK_URL');
const ALERT_WEBHOOK_SECRET = Deno.env.get('ALERT_WEBHOOK_SECRET');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const payload = await req.json();
    const alert = payload.record ?? payload; // pg_net trigger payload shape

    if (!BACKEND_ALERT_WEBHOOK_URL || !ALERT_WEBHOOK_SECRET) {
      console.warn('BACKEND_ALERT_WEBHOOK_URL or ALERT_WEBHOOK_SECRET missing — skipping alert email relay');
      return new Response(JSON.stringify({ success: true, skipped: 'missing relay config' }), {
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

    const res = await fetch(BACKEND_ALERT_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'x-alert-webhook-secret': ALERT_WEBHOOK_SECRET,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ alert, recipients: emails }),
    });

    if (!res.ok) {
      console.error('Alert email relay webhook error', await res.text());
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
