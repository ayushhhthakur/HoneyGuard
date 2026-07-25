// Must be the very first import: ESM hoists all imports above any local
// code, so a later `dotenv.config()` call would run AFTER route modules
// (which read process.env at import time) had already loaded.
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.routes.js';
import orgsRoutes from './routes/orgs.routes.js';
import categoriesRoutes from './routes/categories.routes.js';
import tokensRoutes from './routes/tokens.routes.js';
import statsRoutes from './routes/stats.routes.js';
import alertsRoutes from './routes/alerts.routes.js';
import fingerprintsRoutes from './routes/fingerprints.routes.js';
import trackRoutes from './routes/track.routes.js';
import internalRoutes from './routes/internal.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

// Trust exactly one hop (the platform's own reverse proxy — Render, Vercel,
// etc). `true` would trust the whole x-forwarded-for chain, letting anyone
// spoof their apparent IP and trivially bypass rate limiting.
app.set('trust proxy', Number(process.env.TRUST_PROXY_HOPS || 1));

app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-org-id'],
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// The public tracking surface (honeytoken pings) gets a much looser limit
// than the authenticated dashboard API — it's meant to be hit by attackers,
// sometimes in bursts, and we never want a rate limit to be the reason a hit
// goes unlogged.
const dashboardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  message: { success: false, error: 'Too many requests, please slow down.' },
});
const trackingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { success: false, error: 'Too many requests.' },
});

// Static assets: the fingerprint collector script + decoy landing pages
app.use(express.static(path.join(__dirname, 'public')));

// ---- Public, unauthenticated honeytoken tracking surface ----
app.use('/', trackingLimiter, trackRoutes);
app.use('/internal', trackingLimiter, internalRoutes);

// ---- Authenticated dashboard API ----
app.use('/me', dashboardLimiter, authRoutes);
app.use('/orgs', dashboardLimiter, orgsRoutes);
app.use('/categories', dashboardLimiter, categoriesRoutes);
app.use('/tokens', dashboardLimiter, tokensRoutes);
app.use('/stats', dashboardLimiter, statsRoutes);
app.use('/alerts', dashboardLimiter, alertsRoutes);
app.use('/fingerprints', dashboardLimiter, fingerprintsRoutes);

app.get('/health', (req, res) => res.json({ success: true, status: 'ok', time: new Date().toISOString() }));

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

// Central error handler
app.use((error, req, res, next) => {
  console.error('[server] Unhandled error:', error);
  if (error.name === 'MulterError') {
    return res.status(400).json({ success: false, error: error.message });
  }
  res.status(error.status || 500).json({ success: false, error: error.message || 'Internal server error' });
});

const server = app.listen(PORT, () => {
  console.log(`HoneyGuard API listening on port ${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received: closing HTTP server');
  server.close(() => process.exit(0));
});
