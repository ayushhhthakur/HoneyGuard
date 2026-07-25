import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { requireAuth } from '../middleware/auth.js';
import { ROLE_RANK } from '../middleware/org.js';
import { sendEmailNotificationToRecipients } from '../lib/mailer.js';

const router = Router();
router.use(requireAuth);

const slugify = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40) || 'org';

const getMembership = async (orgId, userId) => {
  const { data } = await supabaseAdmin
    .from('memberships')
    .select('*')
    .eq('org_id', orgId)
    .eq('user_id', userId)
    .single();
  return data || null;
};

// Every route below that touches a specific :orgId checks membership itself
// (there's no single header-based org context here, unlike the security
// routes, because you need to be able to list/manage orgs you're a member
// of without having "selected" one yet).
const requireMinRole = (minRole) => async (req, res, next) => {
  const membership = await getMembership(req.params.orgId, req.user.id);
  if (!membership) {
    return res.status(403).json({ success: false, error: 'You are not a member of this organization' });
  }
  if (ROLE_RANK[membership.role] < ROLE_RANK[minRole]) {
    return res.status(403).json({ success: false, error: `Requires at least the '${minRole}' role` });
  }
  req.membership = membership;
  next();
};

// GET /orgs — organizations the current user belongs to
router.get('/', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('memberships')
    .select('role, organizations(id, name, slug, created_at)')
    .eq('user_id', req.user.id);

  if (error) return res.status(500).json({ success: false, error: error.message });

  const orgs = (data || []).map((m) => ({ ...m.organizations, role: m.role }));
  res.json({ success: true, data: orgs });
});

// POST /orgs — create a new organization; creator becomes owner
router.post('/', async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, error: 'Organization name is required' });
  }

  const baseSlug = slugify(name);
  let slug = baseSlug;
  for (let i = 0; i < 5; i++) {
    const { data: clash } = await supabaseAdmin.from('organizations').select('id').eq('slug', slug).maybeSingle();
    if (!clash) break;
    slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const { data: org, error: orgError } = await supabaseAdmin
    .from('organizations')
    .insert([{ name: name.trim(), slug, created_by: req.user.id }])
    .select()
    .single();

  if (orgError) return res.status(500).json({ success: false, error: orgError.message });

  const { error: memberError } = await supabaseAdmin
    .from('memberships')
    .insert([{ org_id: org.id, user_id: req.user.id, role: 'owner' }]);

  if (memberError) {
    await supabaseAdmin.from('organizations').delete().eq('id', org.id);
    return res.status(500).json({ success: false, error: memberError.message });
  }

  // Seed default honeytoken categories for the new tenant
  await supabaseAdmin.from('categories').insert(
    ['image', 'aws', 'financial', 'healthcare'].map((category) => ({
      org_id: org.id,
      category,
      created_by: req.user.id,
    }))
  );

  res.status(201).json({ success: true, data: { ...org, role: 'owner' } });
});

// GET /orgs/:orgId/members
router.get('/:orgId/members', requireMinRole('viewer'), async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('memberships')
    .select('id, role, created_at, profiles(id, email, full_name, is_active)')
    .eq('org_id', req.params.orgId)
    .order('created_at', { ascending: true });

  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, data });
});

// PATCH /orgs/:orgId/members/:userId — change a member's role
router.patch('/:orgId/members/:userId', requireMinRole('admin'), async (req, res) => {
  const { role } = req.body;
  if (!['admin', 'analyst', 'viewer', 'owner'].includes(role)) {
    return res.status(400).json({ success: false, error: 'Invalid role' });
  }
  // Only an owner can promote someone else to owner or change another owner's role
  if ((role === 'owner' || (await getMembership(req.params.orgId, req.params.userId))?.role === 'owner') && req.membership.role !== 'owner') {
    return res.status(403).json({ success: false, error: 'Only an owner can manage owner-level access' });
  }

  const { data, error } = await supabaseAdmin
    .from('memberships')
    .update({ role })
    .eq('org_id', req.params.orgId)
    .eq('user_id', req.params.userId)
    .select()
    .single();

  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, data });
});

// DELETE /orgs/:orgId/members/:userId — remove a member
router.delete('/:orgId/members/:userId', requireMinRole('admin'), async (req, res) => {
  const target = await getMembership(req.params.orgId, req.params.userId);
  if (target?.role === 'owner') {
    const { count } = await supabaseAdmin
      .from('memberships')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', req.params.orgId)
      .eq('role', 'owner');
    if ((count || 0) <= 1) {
      return res.status(400).json({ success: false, error: 'Cannot remove the last owner of an organization' });
    }
  }

  const { error } = await supabaseAdmin
    .from('memberships')
    .delete()
    .eq('org_id', req.params.orgId)
    .eq('user_id', req.params.userId);

  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, message: 'Member removed' });
});

// GET /orgs/:orgId/invites — pending invites
router.get('/:orgId/invites', requireMinRole('admin'), async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('invites')
    .select('*')
    .eq('org_id', req.params.orgId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, data });
});

// POST /orgs/:orgId/invites — invite a teammate by email
router.post('/:orgId/invites', requireMinRole('admin'), async (req, res) => {
  const { email, role = 'viewer' } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, error: 'A valid email is required' });
  }
  if (!['admin', 'analyst', 'viewer'].includes(role)) {
    return res.status(400).json({ success: false, error: 'Invalid role' });
  }
  if (role === 'admin' && req.membership.role !== 'owner') {
    return res.status(403).json({ success: false, error: 'Only an owner can invite someone as admin' });
  }

  const { data: invite, error } = await supabaseAdmin
    .from('invites')
    .insert([{ org_id: req.params.orgId, email: email.toLowerCase().trim(), role, invited_by: req.user.id }])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return res.status(409).json({ success: false, error: 'There is already a pending invite for this email' });
    }
    return res.status(500).json({ success: false, error: error.message });
  }

  const { data: org } = await supabaseAdmin.from('organizations').select('name').eq('id', req.params.orgId).single();
  const frontendUrl = (process.env.FRONTEND_URL || 'https://honeyguard.vercel.app').replace(/\/$/, '');
  const inviteUrl = `${frontendUrl}/accept-invite?token=${invite.token}`;

  await sendEmailNotificationToRecipients(
    `You're invited to join ${org?.name || 'HoneyGuard'} on HoneyGuard`,
    `<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;line-height:1.6;">
      <h2 style="margin:0 0 12px 0;">You've been invited to HoneyGuard</h2>
      <p><strong>Organization:</strong> ${org?.name || 'HoneyGuard'}</p>
      <p><strong>Role:</strong> ${role}</p>
      <p>Click the button below to accept the invite:</p>
      <p><a href="${inviteUrl}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;">Accept Invite</a></p>
      <p style="font-size:12px;color:#6b7280;">If the button does not work, paste this URL into your browser:</p>
      <p style="word-break:break-all;font-size:12px;color:#374151;">${inviteUrl}</p>
    </div>`,
    [invite.email]
  ).catch((err) => {
    console.error('[orgs] invite email failed:', err.message);
  });

  res.status(201).json({ success: true, data: invite });
});

// DELETE /orgs/:orgId/invites/:inviteId — revoke a pending invite
router.delete('/:orgId/invites/:inviteId', requireMinRole('admin'), async (req, res) => {
  const { error } = await supabaseAdmin
    .from('invites')
    .update({ status: 'revoked' })
    .eq('id', req.params.inviteId)
    .eq('org_id', req.params.orgId);

  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, message: 'Invite revoked' });
});

// POST /orgs/invites/accept — the signed-in user redeems an invite token
router.post('/invites/accept', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ success: false, error: 'Missing invite token' });

  const { data: invite, error: inviteError } = await supabaseAdmin
    .from('invites')
    .select('*')
    .eq('token', token)
    .eq('status', 'pending')
    .single();

  if (inviteError || !invite) {
    return res.status(404).json({ success: false, error: 'Invite not found or already used' });
  }
  if (new Date(invite.expires_at) < new Date()) {
    await supabaseAdmin.from('invites').update({ status: 'expired' }).eq('id', invite.id);
    return res.status(410).json({ success: false, error: 'This invite has expired' });
  }
  if (invite.email.toLowerCase() !== req.user.email.toLowerCase()) {
    return res.status(403).json({ success: false, error: 'This invite was sent to a different email address' });
  }

  const { error: memberError } = await supabaseAdmin
    .from('memberships')
    .upsert([{ org_id: invite.org_id, user_id: req.user.id, role: invite.role }], { onConflict: 'org_id,user_id' });

  if (memberError) return res.status(500).json({ success: false, error: memberError.message });

  await supabaseAdmin
    .from('invites')
    .update({ status: 'accepted', accepted_at: new Date().toISOString() })
    .eq('id', invite.id);

  const { data: org } = await supabaseAdmin.from('organizations').select('*').eq('id', invite.org_id).single();

  res.json({ success: true, data: { ...org, role: invite.role } });
});

export default router;
