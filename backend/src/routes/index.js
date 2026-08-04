import { Router } from 'express';
import { dashboardLimiter, trackingLimiter } from '../middleware/security.middleware.js';

import meRoutes from './me.routes.js';
import organizationRoutes from './organization.routes.js';
import categoryRoutes from './category.routes.js';
import tokenRoutes from './token.routes.js';
import statsRoutes from './stats.routes.js';
import alertRoutes from './alert.routes.js';
import fingerprintRoutes from './fingerprint.routes.js';
import trackRoutes from './track.routes.js';
import internalRoutes from './internal.routes.js';

const router = Router();

// Public, unauthenticated honeytoken tracking surface — this is what
// attackers hit, so it gets its own (tighter, per-IP) rate limit tier.
router.use('/', trackingLimiter, trackRoutes);
router.use('/internal', trackingLimiter, internalRoutes);

// Authenticated dashboard API
router.use('/me', dashboardLimiter, meRoutes);
router.use('/orgs', dashboardLimiter, organizationRoutes);
router.use('/categories', dashboardLimiter, categoryRoutes);
router.use('/tokens', dashboardLimiter, tokenRoutes);
router.use('/stats', dashboardLimiter, statsRoutes);
router.use('/alerts', dashboardLimiter, alertRoutes);
router.use('/fingerprints', dashboardLimiter, fingerprintRoutes);

export default router;
