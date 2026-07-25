import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { getClientIp } from '../lib/metadata.js';
import { findTokenOrgId, logTokenActivity } from '../lib/activity.js';

const router = Router();

// GET /verify-token/:token
router.get('/verify-token/:token', async (req, res) => {
  const tokenRow = await findTokenOrgId(req.params.token);
  if (!tokenRow || !tokenRow.is_active) {
    return res.status(404).json({ success: false, error: 'Token not found or inactive' });
  }
  await logTokenActivity({
    tokenRow,
    event: 'VERIFY',
    status: 'SUCCESS',
    requestIp: getClientIp(req),
    userAgent: req.get('user-agent'),
  });
  res.json({ success: true, data: { token: tokenRow.token, category: tokenRow.category, is_active: tokenRow.is_active } });
});

// GET /image/:token — tracked image honeytoken entrypoint.
// The caller only sees the image itself; logging and fingerprinting happen invisibly.
router.get('/image/:token', async (req, res) => {
  const clientIp = getClientIp(req);
  const userAgent = req.get('user-agent');
  const tokenRow = await findTokenOrgId(req.params.token);

  if (!tokenRow) {
    return res.status(404).json({ success: false, error: 'Not found' });
  }
  if (!tokenRow.is_active || !tokenRow.imageurl) {
    return res.status(404).json({ success: false, error: 'Not found' });
  }

  await logTokenActivity({
    tokenRow,
    event: 'IMAGE_ACCESS',
    status: 'SUCCESS',
    requestIp: clientIp,
    userAgent,
    metadata: { referer: req.get('referer') || 'direct', query: req.query },
  });

  const apiBase = `${req.protocol}://${req.get('host')}`;
  const safeImageUrl = tokenRow.imageurl;

  res.set('Content-Type', 'text/html').send(`<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title></title></head>
<body style="margin:0;background:#000;min-height:100vh;display:flex;align-items:center;justify-content:center;overflow:hidden;">
  <img src="${safeImageUrl}" alt="" style="display:block;max-width:100vw;max-height:100vh;object-fit:contain;" />
  <script src="${apiBase}/fp.js" data-token="${tokenRow.token}" data-api="${apiBase}" async></script>
</body></html>`);
});

// GET /image-preview/:token — tracked browser preview for image honeytokens.
// This is the route you want when you need both IP logging and browser fingerprinting.
router.get('/image-preview/:token', async (req, res) => {
  const clientIp = getClientIp(req);
  const userAgent = req.get('user-agent');
  const tokenRow = await findTokenOrgId(req.params.token);

  if (!tokenRow) {
    return res.status(404).send('Not found');
  }
  if (!tokenRow.is_active || !tokenRow.imageurl) {
    return res.status(404).send('Not found');
  }

  await logTokenActivity({
    tokenRow,
    event: 'IMAGE_ACCESS',
    status: 'SUCCESS',
    requestIp: clientIp,
    userAgent,
    metadata: { referer: req.get('referer') || 'direct', query: req.query, via: 'image-preview' },
  });

  const apiBase = `${req.protocol}://${req.get('host')}`;
  const safeImageUrl = tokenRow.imageurl;

  res.set('Content-Type', 'text/html').send(`<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title></title></head>
<body style="margin:0;background:#000;min-height:100vh;display:flex;align-items:center;justify-content:center;overflow:hidden;">
  <img src="${safeImageUrl}" alt="" style="display:block;max-width:100vw;max-height:100vh;object-fit:contain;" />
  <script src="${apiBase}/fp.js" data-token="${tokenRow.token}" data-api="${apiBase}" async></script>
</body></html>`);
});

// POST /track/:token — generic "something touched this honeytoken" ping
router.post('/track/:token', async (req, res) => {
  const tokenRow = await findTokenOrgId(req.params.token);
  if (!tokenRow) return res.status(404).json({ success: false, error: 'Not found' });

  await logTokenActivity({
    tokenRow,
    event: 'suspicious',
    status: 'SUCCESS',
    requestIp: getClientIp(req),
    userAgent: req.get('user-agent'),
    metadata: { activityType: req.body?.activityType || 'unknown' },
  });

  res.json({ success: true });
});

// POST /track/aws/:token
router.post('/track/aws/:token', async (req, res) => {
  const tokenRow = await findTokenOrgId(req.params.token);
  if (!tokenRow || tokenRow.category !== 'aws') {
    return res.status(404).json({ success: false, error: 'Token not found' });
  }
  if (!tokenRow.is_active) {
    return res.status(403).json({ success: false, error: 'Token is inactive' });
  }

  const { service, region, action } = req.body;
  await logTokenActivity({
    tokenRow,
    event: 'AWS_ACCESS',
    status: 'SUCCESS',
    requestIp: getClientIp(req),
    userAgent: req.get('user-agent'),
    metadata: { service, region, action, referer: req.get('referer') || 'direct' },
  });

  res.json({ success: true, message: 'AWS token access logged successfully' });
});

// GET /decoy/:token — a harmless-looking landing page that silently loads
// the fingerprint collector. Point a honeytoken "shared document" or
// "console" link here instead of straight at an API endpoint.
router.get('/decoy/:token', async (req, res) => {
  const tokenRow = await findTokenOrgId(req.params.token);
  if (!tokenRow) return res.status(404).send('Not found');

  await logTokenActivity({
    tokenRow,
    event: 'IMAGE_ACCESS',
    status: 'SUCCESS',
    requestIp: getClientIp(req),
    userAgent: req.get('user-agent'),
    metadata: { via: 'decoy-page' },
  });

  const apiBase = `${req.protocol}://${req.get('host')}`;
  res.set('Content-Type', 'text/html').send(`<!doctype html>
<html><head><meta charset="utf-8"><title>Loading…</title></head>
<body style="font-family:sans-serif;display:flex;height:100vh;align-items:center;justify-content:center;color:#666">
  <p>Loading document…</p>
  <script src="${apiBase}/fp.js" data-token="${tokenRow.token}" data-api="${apiBase}" async></script>
</body></html>`);
});

// POST /fingerprint/:token — deep client fingerprint, posted by the
// self-hosted collector script served at /fp.js (see server.js static route)
router.post('/fingerprint/:token', async (req, res) => {
  const tokenRow = await findTokenOrgId(req.params.token);
  if (!tokenRow) return res.status(404).json({ success: false, error: 'Not found' });

  const clientIp = getClientIp(req);
  const userAgent = req.get('user-agent');

  const result = await logTokenActivity({
    tokenRow,
    event: 'FINGERPRINT',
    status: 'SUCCESS',
    requestIp: clientIp,
    userAgent,
    metadata: { source: 'fingerprint-collector' },
  });

  const fp = req.body || {};

  const { error } = await supabaseAdmin.from('device_fingerprints').insert([
    {
      org_id: tokenRow.org_id,
      token: tokenRow.token,
      log_id: result?.log?.id || null,
      fingerprint_hash: fp.fingerprintHash || null,
      ip_address: clientIp,
      user_agent: userAgent,
      canvas_hash: fp.canvasHash || null,
      webgl_hash: fp.webglHash || null,
      webgl_vendor: fp.webglVendor || null,
      webgl_renderer: fp.webglRenderer || null,
      audio_hash: fp.audioHash || null,
      screen_resolution: fp.screenResolution || null,
      color_depth: fp.colorDepth ?? null,
      pixel_ratio: fp.pixelRatio ?? null,
      timezone: fp.timezone || null,
      languages: fp.languages || null,
      platform: fp.platform || null,
      hardware_concurrency: fp.hardwareConcurrency ?? null,
      device_memory: fp.deviceMemory ?? null,
      touch_support: fp.touchSupport ?? null,
      fonts: fp.fonts || null,
      plugins: fp.plugins || null,
      cookies_enabled: fp.cookiesEnabled ?? null,
      do_not_track: fp.doNotTrack || null,
      webdriver: fp.webdriver ?? null,
      incognito_guess: fp.incognitoGuess ?? null,
      raw: fp,
    },
  ]);

  if (error) {
    console.error('[fingerprint] insert failed:', error.message);
    return res.status(500).json({ success: false, error: 'Failed to record fingerprint' });
  }

  res.json({ success: true });
});

export default router;
