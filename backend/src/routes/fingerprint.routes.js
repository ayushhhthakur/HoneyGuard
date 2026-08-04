import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireOrg } from '../middleware/org.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { asyncHandler } from '../core/asyncHandler.js';
import * as fingerprintController from '../controllers/fingerprint.controller.js';

const router = Router();
router.use(requireAuth, requireOrg);

router.get('/', asyncHandler(fingerprintController.list));
router.get(
  '/:id',
  validate({ params: z.object({ id: z.string().uuid('Invalid fingerprint id') }) }),
  asyncHandler(fingerprintController.getById)
);

export default router;
