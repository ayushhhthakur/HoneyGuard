// POST /track-event/:token  body: { category: 'aws'|'financial'|'healthcare'|'generic', ...extra }
import { corsHeaders, getClientIp, findToken, logActivity } from '../_shared/helpers.ts';

const EVENT_BY_CATEGORY: Record<string, string> = {
  aws: 'AWS_ACCESS',
  financial: 'FINANCIAL_ACCESS',
  healthcare: 'HEALTHCARE_ACCESS',
  generic: 'suspicious',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const url = new URL(req.url);
  const token = url.pathname.split('/').pop();
  const body = await req.json().catch(() => ({}));

  if (!token) {
    return new Response(JSON.stringify({ success: false, error: 'Missing token' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const tokenRow = await findToken(token);
  if (!tokenRow || !tokenRow.is_active) {
    return new Response(JSON.stringify({ success: false, error: 'Token not found or inactive' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const category = (body.category || tokenRow.category || 'generic').toLowerCase();
  const event = EVENT_BY_CATEGORY[category] || 'suspicious';

  await logActivity({
    tokenRow,
    event,
    status: 'SUCCESS',
    ip: getClientIp(req),
    userAgent: req.headers.get('user-agent') || '',
    metadata: { ...body, referer: req.headers.get('referer') || 'direct' },
  });

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
