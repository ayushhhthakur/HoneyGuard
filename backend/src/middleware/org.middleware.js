import { membershipsRepository } from '../repositories/memberships.repository.js';
import { organizationsRepository } from '../repositories/organizations.repository.js';
import { ROLE_RANK } from '../config/constants.js';
import { BadRequestError, ForbiddenError, UnauthorizedError } from '../core/errors.js';
import { asyncHandler } from '../core/asyncHandler.js';

/**
 * Resolves the active organization for this request from the `x-org-id`
 * header, confirms req.user is a member of it, and attaches req.org
 * (organization row) + req.membership (role in that org). Must run after
 * requireAuth.
 */
export const requireOrg = asyncHandler(async (req, res, next) => {
  const orgId = req.headers['x-org-id'];
  if (!orgId) throw new BadRequestError('Missing x-org-id header');

  const membership = await membershipsRepository.findForUserInOrg(orgId, req.user.id);
  if (!membership) throw new ForbiddenError('You are not a member of this organization');

  // findForUserInOrg doesn't join organizations by default in the base
  // query used elsewhere; fetch it explicitly so req.org is always a full row.
  const org = await organizationsRepository.findById(orgId);
  if (!org) throw new ForbiddenError('Organization not found');

  req.org = org;
  req.membership = membership;
  next();
});

/**
 * Role-gate a route within the resolved org. Usage:
 *   requireOrgRole('admin', 'owner')       // exact match against a set
 *   requireOrgRole.atLeast('analyst')      // role rank >= analyst
 * Must run after requireOrg.
 */
export const requireOrgRole =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.membership) return next(new UnauthorizedError('Organization context not resolved'));
    if (!allowedRoles.includes(req.membership.role)) {
      return next(new ForbiddenError(`This action requires one of the following roles: ${allowedRoles.join(', ')}`));
    }
    next();
  };

requireOrgRole.atLeast = (minRole) => (req, res, next) => {
  if (!req.membership) return next(new UnauthorizedError('Organization context not resolved'));
  if (ROLE_RANK[req.membership.role] < ROLE_RANK[minRole]) {
    return next(new ForbiddenError(`This action requires at least the '${minRole}' role`));
  }
  next();
};

export default { requireOrg, requireOrgRole };
