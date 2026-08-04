import { timingSafeEqual } from 'crypto';
import { env } from '../config/env.js';
import { UnauthorizedError } from '../core/errors.js';

/**
 * Gates internal server-to-server webhooks (e.g. the Supabase edge function
 * that asks this API to send an alert email) behind a shared secret, using
 * a constant-time comparison so the check itself can't leak the secret one
 * byte at a time via response-timing analysis.
 */
export const requireWebhookSecret = (headerName) => (req, res, next) => {
  if (!env.alertWebhookSecret) {
    return next(new UnauthorizedError('This webhook is not configured'));
  }

  const provided = Buffer.from(String(req.get(headerName) || ''));
  const expected = Buffer.from(env.alertWebhookSecret);

  const matches = provided.length === expected.length && timingSafeEqual(provided, expected);
  if (!matches) return next(new UnauthorizedError('Unauthorized'));

  next();
};

export default requireWebhookSecret;
