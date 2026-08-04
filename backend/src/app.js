import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import { env } from './config/env.js';
import { corsMiddleware, securityHeaders } from './middleware/security.middleware.js';
import { requestContext } from './middleware/requestContext.middleware.js';
import { requestLogger } from './middleware/requestLogger.middleware.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import routes from './routes/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const createApp = () => {
  const app = express();

  // Trust exactly N hops (the platform's own reverse proxy — Render,
  // Vercel, etc). `true` would trust the whole x-forwarded-for chain,
  // letting anyone spoof their apparent IP and bypass rate limiting.
  app.set('trust proxy', env.trustProxyHops);

  app.use(requestContext);
  app.use(corsMiddleware);
  app.use(securityHeaders);
  app.use(express.json({ limit: '2mb' }));
  app.use(requestLogger);

  // Static assets: the fingerprint collector script + decoy landing pages
  app.use(express.static(path.join(__dirname, '..', 'public')));

  app.get('/health', (req, res) =>
    res.json({ success: true, status: 'ok', time: new Date().toISOString(), env: env.nodeEnv })
  );

  app.use(routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default createApp;
