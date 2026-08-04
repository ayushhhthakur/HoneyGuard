import { supabaseAdmin } from '../db/supabaseAdmin.js';
import { profilesRepository } from '../repositories/profiles.repository.js';
import { UnauthorizedError, ForbiddenError } from '../core/errors.js';
import { asyncHandler } from '../core/asyncHandler.js';

/**
 * Verifies the `Authorization: Bearer <access_token>` header against
 * Supabase Auth, then loads the matching profile row. Attaches req.user and
 * req.profile. This only establishes WHO is calling — it says nothing about
 * WHICH organization or WHAT role; see org.middleware.js for that.
 */
export const requireAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) throw new UnauthorizedError('Missing bearer token');

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData?.user) throw new UnauthorizedError('Invalid or expired session');

  const profile = await profilesRepository.findById(userData.user.id);
  if (!profile) throw new ForbiddenError('No profile found for this account');
  if (!profile.is_active) throw new ForbiddenError('This account has been deactivated');

  req.user = userData.user;
  req.profile = profile;
  next();
});

export default requireAuth;
