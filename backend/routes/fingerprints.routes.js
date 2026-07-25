import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { requireAuth } from '../middleware/auth.js';
import { requireOrg } from '../middleware/org.js';

const router = Router();
router.use(requireAuth, requireOrg);

// GET /fingerprints/:id
router.get('/:id', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('device_fingerprints')
    .select('*')
    .eq('org_id', req.org.id)
    .eq('id', req.params.id)
    .single();

  if (error || !data) return res.status(404).json({ success: false, error: 'Fingerprint not found' });
  res.json({ success: true, data });
});

// GET /fingerprints?token=xyz
router.get('/', async (req, res) => {
  let query = supabaseAdmin
    .from('device_fingerprints')
    .select('*')
    .eq('org_id', req.org.id)
    .order('created_at', { ascending: false })
    .limit(200);

  if (req.query.token) query = query.eq('token', req.query.token);

  const { data, error } = await query;
  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, data });
});

export default router;
