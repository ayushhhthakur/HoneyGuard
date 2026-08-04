import { tokensRepository } from '../repositories/tokens.repository.js';
import { logTokenActivity } from './activity.service.js';
import { buildFingerprintRow, recordFingerprint } from './fingerprint.service.js';
import { LOG_EVENTS } from '../config/constants.js';
import { NotFoundError } from '../core/errors.js';

/** Token values are globally unique, so the public tracking surface can
 * resolve an org purely from the token string — no org header needed. */
export const findActiveToken = async (token) => {
  const row = await tokensRepository.findByToken(token);
  if (!row || !row.is_active) throw new NotFoundError('Token not found or inactive');
  return row;
};

export const findAnyToken = async (token) => {
  const row = await tokensRepository.findByToken(token);
  if (!row) throw new NotFoundError('Not found');
  return row;
};

export const verifyToken = async ({ token, ip, userAgent }) => {
  const tokenRow = await findActiveToken(token);
  await logTokenActivity({ tokenRow, event: LOG_EVENTS.VERIFY, status: 'SUCCESS', requestIp: ip, userAgent });
  return { token: tokenRow.token, category: tokenRow.category, is_active: tokenRow.is_active };
};

export const recordImageAccess = async ({ token, ip, userAgent, referer }) => {
  const tokenRow = await findAnyToken(token);
  if (!tokenRow.is_active || !tokenRow.imageurl) throw new NotFoundError('Not found');

  await logTokenActivity({
    tokenRow,
    event: LOG_EVENTS.IMAGE_ACCESS,
    status: 'SUCCESS',
    requestIp: ip,
    userAgent,
    metadata: { referer: referer || 'direct', via: 'image-pixel' },
  });

  return tokenRow.imageurl;
};

export const recordDecoyVisit = async ({ token, ip, userAgent }) => {
  const tokenRow = await findAnyToken(token);
  await logTokenActivity({
    tokenRow,
    event: LOG_EVENTS.IMAGE_ACCESS,
    status: 'SUCCESS',
    requestIp: ip,
    userAgent,
    metadata: { via: 'decoy-page' },
  });
  return tokenRow;
};

export const recordGenericTrack = async ({ token, ip, userAgent, activityType }) => {
  const tokenRow = await findAnyToken(token);
  await logTokenActivity({
    tokenRow,
    event: LOG_EVENTS.SUSPICIOUS,
    status: 'SUCCESS',
    requestIp: ip,
    userAgent,
    metadata: { activityType: activityType || 'unknown' },
  });
};

export const recordAwsTrack = async ({ token, ip, userAgent, referer, service, region, action }) => {
  const tokenRow = await findActiveToken(token);
  if (tokenRow.category !== 'aws') throw new NotFoundError('Token not found');

  await logTokenActivity({
    tokenRow,
    event: LOG_EVENTS.AWS_ACCESS,
    status: 'SUCCESS',
    requestIp: ip,
    userAgent,
    metadata: { service, region, action, referer: referer || 'direct' },
  });
};

export const recordFingerprintCapture = async ({ token, ip, userAgent, payload }) => {
  const tokenRow = await findAnyToken(token);

  const result = await logTokenActivity({
    tokenRow,
    event: LOG_EVENTS.FINGERPRINT,
    status: 'SUCCESS',
    requestIp: ip,
    userAgent,
    metadata: { source: 'fingerprint-collector' },
  });

  const row = buildFingerprintRow({ tokenRow, logId: result?.log?.id, ip, userAgent, payload });
  await recordFingerprint(row);
};

export default {
  findActiveToken,
  findAnyToken,
  verifyToken,
  recordImageAccess,
  recordDecoyVisit,
  recordGenericTrack,
  recordAwsTrack,
  recordFingerprintCapture,
};
