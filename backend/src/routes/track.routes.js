import { Router } from 'express';
import { validate } from '../middleware/validate.middleware.js';
import { asyncHandler } from '../core/asyncHandler.js';
import * as trackController from '../controllers/track.controller.js';
import {
  trackTokenParamSchema,
  genericTrackBodySchema,
  awsTrackBodySchema,
  fingerprintBodySchema,
} from '../validators/track.schemas.js';

const router = Router();

router.get('/verify-token/:token', validate(trackTokenParamSchema), asyncHandler(trackController.verify));
router.get('/image/:token', validate(trackTokenParamSchema), asyncHandler(trackController.imagePixel));
router.get('/decoy/:token', validate(trackTokenParamSchema), asyncHandler(trackController.decoyPage));
router.post('/track/:token', validate({ ...trackTokenParamSchema, ...genericTrackBodySchema }), asyncHandler(trackController.genericTrack));
router.post('/track/aws/:token', validate({ ...trackTokenParamSchema, ...awsTrackBodySchema }), asyncHandler(trackController.awsTrack));
router.post('/fingerprint/:token', validate({ ...trackTokenParamSchema, ...fingerprintBodySchema }), asyncHandler(trackController.fingerprint));

export default router;
