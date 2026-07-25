import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /me — profile + every org membership, so the dashboard can build the
// org switcher right after login without a second round trip per org.
router.get('/', requireAuth, async (req, res) => {
  const { data: memberships, error } = await supabaseAdmin
    .from('memberships')
    .select('role, organizations(id, name, slug)')
    .eq('user_id', req.user.id);

  if (error) return res.status(500).json({ success: false, error: error.message });

  res.json({
    success: true,
    data: {
      profile: req.profile,
      organizations: (memberships || []).map((m) => ({ ...m.organizations, role: m.role })),
    },
  });
});

export default router;
