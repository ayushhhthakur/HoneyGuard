// GET /track-pixel/:token — the tracking pixel. Deployed at the edge so a
// honeytoken embedded in an email/doc anywhere in the world resolves fast
// enough that nobody notices it's instrumented.
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
  if (!tokenRow || !tokenRow.is_active || !tokenRow.imageurl) {
    return new Response('Not found', { status: 404, headers: corsHeaders });
  }

  await logActivity({
    tokenRow,
    event: 'IMAGE_ACCESS',
    status: 'SUCCESS',
    ip: getClientIp(req),
    userAgent: req.headers.get('user-agent') || '',
    metadata: { referer: req.headers.get('referer') || 'direct' },
  });

  return Response.redirect(tokenRow.imageurl, 302);
});
