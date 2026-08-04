import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

/**
 * CORS — only the configured dashboard origins may call the authenticated
 * API with credentials-bearing headers. The public tracking surface is
 * intentionally NOT behind this (attackers don't send an Origin header
 * HoneyGuard controls, and the tracking routes don't need CORS to work
 * server-to-server or via a bare <img>/<script> tag).
 */
export const corsMiddleware = cors({
  origin: env.corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-org-id', 'x-request-id'],
});

/**
 * Helmet with an explicit Content-Security-Policy instead of the (looser)
 * defaults. This is an API server — it serves no HTML pages of its own
 * except the tracking decoy page, so the policy is deliberately strict:
 * no inline scripts/styles, no third-party origins.
 */
export const securityHeaders = helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // fp.js / images must load cross-origin from the dashboard
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // the decoy page's inline style attribute
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  hsts: env.isProduction ? { maxAge: 15552000, includeSubDomains: true } : false,
  referrerPolicy: { policy: 'no-referrer' },
});

/**
 * Two rate-limiting tiers:
 *  - dashboardLimiter: generous, keyed by authenticated user where possible
 *    (falls back to IP pre-auth) — this is normal app traffic.
 *  - trackingLimiter: tighter per-IP limit on the public honeytoken surface.
 *    Loose enough that a burst of real attacker traffic isn't the reason a
 *    hit goes unlogged, tight enough to blunt naive scripted abuse.
 *  - mutationLimiter: extra-tight limiter for expensive/sensitive writes
 *    (invites, org creation) to blunt spam/enumeration.
 */
export const dashboardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: { success: false, error: 'Too many requests, please slow down.', code: 'RATE_LIMITED' },
});

export const trackingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests.', code: 'RATE_LIMITED' },
});

export const mutationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: { success: false, error: 'Too many requests, please slow down.', code: 'RATE_LIMITED' },
});

export default { corsMiddleware, securityHeaders, dashboardLimiter, trackingLimiter, mutationLimiter };
