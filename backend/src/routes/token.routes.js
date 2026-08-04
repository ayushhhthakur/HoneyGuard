import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireOrg, requireOrgRole } from '../middleware/org.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { mutationLimiter } from '../middleware/security.middleware.js';
import { asyncHandler } from '../core/asyncHandler.js';
import * as tokenController from '../controllers/token.controller.js';
import {
  createTokenSchema,
  tokenParamSchema,
  rotateTokenSchema,
  updateTagsSchema,
  exportTokensQuerySchema,
} from '../validators/token.schemas.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  },
});

const router = Router();
router.use(requireAuth, requireOrg);

// The type catalogue — lets the frontend build the "deploy a honeytoken"
// form dynamically instead of hardcoding all 27 types client-side.
router.get('/types', asyncHandler(tokenController.listTypes));
router.get('/types/flat', asyncHandler(tokenController.listTypesFlat));

router.get('/', asyncHandler(tokenController.list));
router.get('/count', asyncHandler(tokenController.count));
router.get('/export', validate(exportTokensQuerySchema), asyncHandler(tokenController.exportAll));
router.get('/id/:token', validate(tokenParamSchema), asyncHandler(tokenController.getByValue));
router.get('/:token/logs', validate(tokenParamSchema), asyncHandler(tokenController.getLogs));
router.get('/:token/stats', validate(tokenParamSchema), asyncHandler(tokenController.getStats));

router.post(
  '/',
  requireOrgRole.atLeast('analyst'),
  upload.single('file'),
  validate(createTokenSchema),
  asyncHandler(tokenController.create)
);

router.post(
  '/:token/rotate',
  requireOrgRole.atLeast('analyst'),
  mutationLimiter,
  validate({ ...tokenParamSchema, ...rotateTokenSchema }),
  asyncHandler(tokenController.rotate)
);

router.post('/:token/expire', requireOrgRole.atLeast('analyst'), validate(tokenParamSchema), asyncHandler(tokenController.expire));
router.post('/:token/revoke', requireOrgRole.atLeast('admin'), validate(tokenParamSchema), asyncHandler(tokenController.revoke));

router.patch(
  '/:token/tags',
  requireOrgRole.atLeast('analyst'),
  validate({ ...tokenParamSchema, ...updateTagsSchema }),
  asyncHandler(tokenController.updateTags)
);

router.delete('/:token', requireOrgRole.atLeast('admin'), validate(tokenParamSchema), asyncHandler(tokenController.remove));

export default router;
