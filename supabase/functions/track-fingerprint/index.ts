// POST /track-fingerprint/:token — receives the payload from the self-hosted
// fp.js collector (see backend/public/fp.js) and stores it verbatim plus a
// few promoted columns for fast filtering.
import { corsHeaders, getClientIp, findToken, logActivity, supabaseAdmin } from '../_shared/helpers.ts';

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
  if (!token) {
    return new Response(JSON.stringify({ success: false, error: 'Missing token' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const tokenRow = await findToken(token);
  if (!tokenRow) {
    return new Response(JSON.stringify({ success: false, error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const ip = getClientIp(req);
  const userAgent = req.headers.get('user-agent') || '';
  const fp = await req.json().catch(() => ({} as Record<string, unknown>));

  const log = await logActivity({
    tokenRow,
    event: 'FINGERPRINT',
    status: 'SUCCESS',
    ip,
    userAgent,
    metadata: { source: 'fingerprint-collector' },
  });

  const { error } = await supabaseAdmin.from('device_fingerprints').insert([
    {
      org_id: tokenRow.org_id,
      token: tokenRow.token,
      log_id: log?.id ?? null,
      fingerprint_hash: fp.fingerprintHash ?? null,
      ip_address: ip,
      user_agent: userAgent,
      canvas_hash: fp.canvasHash ?? null,
      webgl_hash: fp.webglHash ?? null,
      webgl_vendor: fp.webglVendor ?? null,
      webgl_renderer: fp.webglRenderer ?? null,
      audio_hash: fp.audioHash ?? null,
      screen_resolution: fp.screenResolution ?? null,
      color_depth: fp.colorDepth ?? null,
      pixel_ratio: fp.pixelRatio ?? null,
      timezone: fp.timezone ?? null,
      languages: fp.languages ?? null,
      platform: fp.platform ?? null,
      hardware_concurrency: fp.hardwareConcurrency ?? null,
      device_memory: fp.deviceMemory ?? null,
      touch_support: fp.touchSupport ?? null,
      fonts: fp.fonts ?? null,
      plugins: fp.plugins ?? null,
      cookies_enabled: fp.cookiesEnabled ?? null,
      do_not_track: fp.doNotTrack ?? null,
      webdriver: fp.webdriver ?? null,
      incognito_guess: fp.incognitoGuess ?? null,
      raw: fp,
    },
  ]);

  if (error) {
    console.error('fingerprint insert failed', error.message);
    return new Response(JSON.stringify({ success: false, error: 'Failed to record fingerprint' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
