import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireOrg, requireOrgRole } from '../middleware/org.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { asyncHandler } from '../core/asyncHandler.js';
import * as alertController from '../controllers/alert.controller.js';
import { listAlertsQuerySchema, alertIdParamSchema, updateAlertStatusSchema } from '../validators/alert.schemas.js';

const router = Router();
router.use(requireAuth, requireOrg);

router.get('/', validate(listAlertsQuerySchema), asyncHandler(alertController.list));
router.patch(
  '/:id',
  requireOrgRole.atLeast('analyst'),
  validate({ ...alertIdParamSchema, ...updateAlertStatusSchema }),
  asyncHandler(alertController.updateStatus)
);

export default router;
