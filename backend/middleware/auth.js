import { supabaseAdmin } from '../lib/supabaseAdmin.js';

/**
 * Verifies the `Authorization: Bearer <access_token>` header against
 * Supabase Auth, then loads the matching profile row. Attaches req.user and
 * req.profile. This only establishes WHO is calling — it says nothing about
 * WHICH organization or WHAT role; see middleware/org.js for that.
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, error: 'Missing bearer token' });
    }

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData?.user) {
      return res.status(401).json({ success: false, error: 'Invalid or expired session' });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userData.user.id)
      .single();

    if (profileError || !profile) {
      return res.status(403).json({ success: false, error: 'No profile found for this account' });
    }

    if (!profile.is_active) {
      return res.status(403).json({ success: false, error: 'This account has been deactivated' });
    }

    req.user = userData.user;
    req.profile = profile;
    return next();
  } catch (error) {
    console.error('[auth] requireAuth error:', error);
    return res.status(500).json({ success: false, error: 'Authentication check failed' });
  }
};
