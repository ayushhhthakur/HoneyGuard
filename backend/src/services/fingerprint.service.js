import { fingerprintsRepository } from '../repositories/fingerprints.repository.js';
import { NotFoundError } from '../core/errors.js';

export const listFingerprints = (orgId, filters) => fingerprintsRepository.listByOrg(orgId, filters);

export const getFingerprintById = async (orgId, id) => {
  const row = await fingerprintsRepository.findByIdInOrg(orgId, id);
  if (!row) throw new NotFoundError('Fingerprint not found');
  return row;
};

/** Maps the raw collector payload onto DB columns, keeping the untouched
 * payload in `raw` for anything we haven't promoted to a column yet. */
export const buildFingerprintRow = ({ tokenRow, logId, ip, userAgent, payload }) => ({
  org_id: tokenRow.org_id,
  token: tokenRow.token,
  log_id: logId || null,
  fingerprint_hash: payload.fingerprintHash || null,
  ip_address: ip,
  user_agent: userAgent,
  canvas_hash: payload.canvasHash || null,
  webgl_hash: payload.webglHash || null,
  webgl_vendor: payload.webglVendor || null,
  webgl_renderer: payload.webglRenderer || null,
  audio_hash: payload.audioHash || null,
  screen_resolution: payload.screenResolution || null,
  color_depth: payload.colorDepth ?? null,
  pixel_ratio: payload.pixelRatio ?? null,
  timezone: payload.timezone || null,
  languages: payload.languages || null,
  platform: payload.platform || null,
  hardware_concurrency: payload.hardwareConcurrency ?? null,
  device_memory: payload.deviceMemory ?? null,
  touch_support: payload.touchSupport ?? null,
  fonts: payload.fonts || null,
  plugins: payload.plugins || null,
  cookies_enabled: payload.cookiesEnabled ?? null,
  do_not_track: payload.doNotTrack || null,
  webdriver: payload.webdriver ?? null,
  incognito_guess: payload.incognitoGuess ?? null,
  raw: payload,
});

export const recordFingerprint = (row) => fingerprintsRepository.create(row);

export default { listFingerprints, getFingerprintById, buildFingerprintRow, recordFingerprint };
