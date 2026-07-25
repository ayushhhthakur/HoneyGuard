import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { requireAuth } from '../middleware/auth.js';
import { requireOrg, requireOrgRole } from '../middleware/org.js';

const router = Router();
router.use(requireAuth, requireOrg);

// GET /alerts?status=open&severity=high
router.get('/', async (req, res) => {
  let query = supabaseAdmin.from('alerts').select('*').eq('org_id', req.org.id).order('created_at', { ascending: false });

  if (req.query.status) query = query.eq('status', req.query.status);
  if (req.query.severity) query = query.eq('severity', req.query.severity);

  const { data, error } = await query;
  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, data });
});

// PATCH /alerts/:id — acknowledge or resolve
router.patch('/:id', requireOrgRole.atLeast('analyst'), async (req, res) => {
  const { status } = req.body;
  if (!['open', 'acknowledged', 'resolved'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status' });
  }

  const patch = { status };
  if (status === 'resolved') {
    patch.resolved_at = new Date().toISOString();
    patch.resolved_by = req.user.id;
  }

  const { data, error } = await supabaseAdmin
    .from('alerts')
    .update(patch)
    .eq('id', req.params.id)
    .eq('org_id', req.org.id)
    .select()
    .single();

  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, data });
});

export default router;
