// GET /verify-token/:token — used by decoy pages/scripts to confirm a token
// is still live before doing anything else. Logged like any other touch.
import { corsHeaders, getClientIp, findToken, logActivity } from '../_shared/helpers.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const url = new URL(req.url);
  const token = url.pathname.split('/').pop();
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

  await logActivity({
    tokenRow,
    event: 'VERIFY',
    status: 'SUCCESS',
    ip: getClientIp(req),
    userAgent: req.headers.get('user-agent') || '',
  });

  return new Response(
    JSON.stringify({ success: true, data: { token: tokenRow.token, category: tokenRow.category, is_active: tokenRow.is_active } }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});
