import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireOrg, requireOrgRole } from '../middleware/org.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { asyncHandler } from '../core/asyncHandler.js';
import * as categoryController from '../controllers/category.controller.js';
import { createCategorySchema, categoryIdParamSchema } from '../validators/category.schemas.js';

const router = Router();
router.use(requireAuth, requireOrg);

router.get('/', asyncHandler(categoryController.list));
router.post('/', requireOrgRole.atLeast('analyst'), validate(createCategorySchema), asyncHandler(categoryController.create));
router.delete('/:id', requireOrgRole.atLeast('admin'), validate(categoryIdParamSchema), asyncHandler(categoryController.remove));

export default router;
