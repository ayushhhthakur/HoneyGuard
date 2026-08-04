import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { mutationLimiter } from '../middleware/security.middleware.js';
import { asyncHandler } from '../core/asyncHandler.js';
import * as orgController from '../controllers/organization.controller.js';
import {
  createOrgSchema,
  orgIdParamSchema,
  memberIdParamSchema,
  changeMemberRoleSchema,
  inviteIdParamSchema,
  createInviteSchema,
  acceptInviteSchema,
} from '../validators/organization.schemas.js';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(orgController.listMine));
router.post('/', mutationLimiter, validate(createOrgSchema), asyncHandler(orgController.create));

router.get('/:orgId/members', validate(orgIdParamSchema), asyncHandler(orgController.listMembers));
router.patch('/:orgId/members/:userId', validate({ ...memberIdParamSchema, ...changeMemberRoleSchema }), asyncHandler(orgController.changeMemberRole));
router.delete('/:orgId/members/:userId', validate(memberIdParamSchema), asyncHandler(orgController.removeMember));

router.get('/:orgId/invites', validate(orgIdParamSchema), asyncHandler(orgController.listInvites));
router.post('/:orgId/invites', mutationLimiter, validate({ ...orgIdParamSchema, ...createInviteSchema }), asyncHandler(orgController.createInvite));
router.delete('/:orgId/invites/:inviteId', validate(inviteIdParamSchema), asyncHandler(orgController.revokeInvite));

router.post('/invites/accept', validate(acceptInviteSchema), asyncHandler(orgController.acceptInvite));

export default router;
