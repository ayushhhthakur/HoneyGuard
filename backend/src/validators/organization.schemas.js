import { z } from 'zod';
import { ROLES } from '../config/constants.js';

export const createOrgSchema = {
  body: z.object({
    name: z.string().trim().min(1, 'Organization name is required').max(120),
  }),
};

export const orgIdParamSchema = {
  params: z.object({ orgId: z.string().uuid('Invalid organization id') }),
};

export const memberIdParamSchema = {
  params: z.object({
    orgId: z.string().uuid('Invalid organization id'),
    userId: z.string().uuid('Invalid user id'),
  }),
};

export const changeMemberRoleSchema = {
  body: z.object({ role: z.nativeEnum(ROLES) }),
};

export const inviteIdParamSchema = {
  params: z.object({
    orgId: z.string().uuid('Invalid organization id'),
    inviteId: z.string().uuid('Invalid invite id'),
  }),
};

export const createInviteSchema = {
  body: z.object({
    email: z.string().trim().email('A valid email is required').max(254),
    role: z.enum([ROLES.ADMIN, ROLES.ANALYST, ROLES.VIEWER]).default(ROLES.VIEWER),
  }),
};

export const acceptInviteSchema = {
  body: z.object({
    token: z.string().trim().min(1, 'Invite token is required'),
  }),
};

export default {
  createOrgSchema,
  orgIdParamSchema,
  memberIdParamSchema,
  changeMemberRoleSchema,
  inviteIdParamSchema,
  createInviteSchema,
  acceptInviteSchema,
};
