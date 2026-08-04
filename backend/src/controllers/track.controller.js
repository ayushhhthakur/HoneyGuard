import { ok } from '../core/ApiResponse.js';
import { getClientIp } from '../services/metadata.service.js';
import * as trackService from '../services/track.service.js';

export const verify = async (req, res) => {
  const data = await trackService.verifyToken({
    token: req.params.token,
    ip: getClientIp(req),
    userAgent: req.get('user-agent'),
  });
  return ok(res, data);
};

export const imagePixel = async (req, res) => {
  const imageUrl = await trackService.recordImageAccess({
    token: req.params.token,
    ip: getClientIp(req),
    userAgent: req.get('user-agent'),
    referer: req.get('referer'),
  });
  return res.redirect(imageUrl);
};

export const decoyPage = async (req, res) => {
  const tokenRow = await trackService.recordDecoyVisit({
    token: req.params.token,
    ip: getClientIp(req),
    userAgent: req.get('user-agent'),
  });

  const apiBase = `${req.protocol}://${req.get('host')}`;
  res.set('Content-Type', 'text/html').send(`<!doctype html>
<html><head><meta charset="utf-8"><title>Loading…</title></head>
<body style="font-family:sans-serif;display:flex;height:100vh;align-items:center;justify-content:center;color:#666">
  <p>Loading document…</p>
  <script src="${apiBase}/fp.js" data-token="${tokenRow.token}" data-api="${apiBase}" async></script>
</body></html>`);
};

export const genericTrack = async (req, res) => {
  await trackService.recordGenericTrack({
    token: req.params.token,
    ip: getClientIp(req),
    userAgent: req.get('user-agent'),
    activityType: req.body.activityType,
  });
  return ok(res, null);
};

export const awsTrack = async (req, res) => {
  await trackService.recordAwsTrack({
    token: req.params.token,
    ip: getClientIp(req),
    userAgent: req.get('user-agent'),
    referer: req.get('referer'),
    ...req.body,
  });
  return ok(res, { message: 'AWS token access logged successfully' });
};

export const fingerprint = async (req, res) => {
  await trackService.recordFingerprintCapture({
    token: req.params.token,
    ip: getClientIp(req),
    userAgent: req.get('user-agent'),
    payload: req.body,
  });
  return ok(res, null);
};

export default { verify, imagePixel, decoyPage, genericTrack, awsTrack, fingerprint };
