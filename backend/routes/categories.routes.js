import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { requireAuth } from '../middleware/auth.js';
import { requireOrg, requireOrgRole } from '../middleware/org.js';

const router = Router();
router.use(requireAuth, requireOrg);

router.get('/', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .eq('org_id', req.org.id)
    .order('category', { ascending: true });

  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, data });
});

router.post('/', requireOrgRole.atLeast('analyst'), async (req, res) => {
  const { category, description } = req.body;
  if (!category || !category.trim()) {
    return res.status(400).json({ success: false, error: 'Category is required' });
  }

  const { data, error } = await supabaseAdmin
    .from('categories')
    .insert([{ org_id: req.org.id, category: category.trim().toLowerCase(), description, created_by: req.user.id }])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return res.status(409).json({ success: false, error: 'That category already exists' });
    }
    return res.status(500).json({ success: false, error: error.message });
  }
  res.status(201).json({ success: true, data });
});

router.delete('/:id', requireOrgRole.atLeast('admin'), async (req, res) => {
  const { error } = await supabaseAdmin
    .from('categories')
    .delete()
    .eq('id', req.params.id)
    .eq('org_id', req.org.id);

  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, message: 'Category deleted' });
});

export default router;
