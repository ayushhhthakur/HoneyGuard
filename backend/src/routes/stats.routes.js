import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireOrg } from '../middleware/org.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { asyncHandler } from '../core/asyncHandler.js';
import * as statsController from '../controllers/stats.controller.js';
import { logsQuerySchema } from '../validators/stats.schemas.js';

const router = Router();
router.use(requireAuth, requireOrg);

router.get('/summary', asyncHandler(statsController.summary));
router.get('/dashboard', asyncHandler(statsController.dashboard));
router.get('/threat-score', asyncHandler(statsController.threatScore));
router.get('/categories', asyncHandler(statsController.categories));
router.get('/countries', asyncHandler(statsController.countries));
router.get('/mitre', asyncHandler(statsController.mitre));
router.get('/recent-events', asyncHandler(statsController.recentEvents));
router.get('/tokens', asyncHandler(statsController.tokenSeries));
router.get('/activity', asyncHandler(statsController.activitySeries));
router.get('/logs-count', asyncHandler(statsController.logsCount));
router.get('/logs', validate(logsQuerySchema), asyncHandler(statsController.logs));
router.get('/map', asyncHandler(statsController.map));

export default router;
