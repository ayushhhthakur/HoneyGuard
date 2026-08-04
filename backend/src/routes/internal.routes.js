import { Router } from 'express';
import { requireWebhookSecret } from '../middleware/webhookAuth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { asyncHandler } from '../core/asyncHandler.js';
import * as internalController from '../controllers/internal.controller.js';
import { notifyAlertEmailSchema } from '../validators/internal.schemas.js';

const router = Router();

router.post(
  '/notify-alert-email',
  requireWebhookSecret('x-alert-webhook-secret'),
  validate(notifyAlertEmailSchema),
  asyncHandler(internalController.notifyAlertEmail)
);

export default router;
