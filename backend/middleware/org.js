import { supabaseAdmin } from '../lib/supabaseAdmin.js';

export const ROLE_RANK = { viewer: 1, analyst: 2, admin: 3, owner: 4 };

/**
 * Resolves the active organization for this request from the
 * `x-org-id` header, confirms req.user is a member of it, and attaches
 * req.org (organization row) + req.membership (role in that org).
 * Must run after requireAuth.
 */
export const requireOrg = async (req, res, next) => {
  try {
    const orgId = req.headers['x-org-id'];
    if (!orgId) {
      return res.status(400).json({ success: false, error: 'Missing x-org-id header' });
    }

    const { data: membership, error: membershipError } = await supabaseAdmin
      .from('memberships')
      .select('*, organizations(*)')
      .eq('org_id', orgId)
      .eq('user_id', req.user.id)
      .single();

    if (membershipError || !membership) {
      return res.status(403).json({ success: false, error: 'You are not a member of this organization' });
    }

    req.org = membership.organizations;
    req.membership = membership;
    return next();
  } catch (error) {
    console.error('[org] requireOrg error:', error);
    return res.status(500).json({ success: false, error: 'Organization check failed' });
  }
};

/**
 * Role-gate a route within the resolved org. Usage:
 *   requireOrgRole('admin', 'owner')       // exact match against a set
 *   requireOrgRole.atLeast('analyst')      // role rank >= analyst
 * Must run after requireOrg.
 */
export const requireOrgRole =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.membership) {
      return res.status(401).json({ success: false, error: 'Organization context not resolved' });
    }
    if (!allowedRoles.includes(req.membership.role)) {
      return res.status(403).json({
        success: false,
        error: `This action requires one of the following roles: ${allowedRoles.join(', ')}`,
      });
    }
    return next();
  };

requireOrgRole.atLeast = (minRole) => (req, res, next) => {
  if (!req.membership) {
    return res.status(401).json({ success: false, error: 'Organization context not resolved' });
  }
  if (ROLE_RANK[req.membership.role] < ROLE_RANK[minRole]) {
    return res.status(403).json({
      success: false,
      error: `This action requires at least the '${minRole}' role`,
    });
  }
  return next();
};
