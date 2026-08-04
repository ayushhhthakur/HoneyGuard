import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../core/asyncHandler.js';
import * as meController from '../controllers/me.controller.js';

const router = Router();
router.get('/', requireAuth, asyncHandler(meController.getMe));

export default router;
