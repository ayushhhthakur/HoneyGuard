import { Router } from 'express';
import multer from 'multer';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { requireAuth } from '../middleware/auth.js';
import { requireOrg, requireOrgRole } from '../middleware/org.js';
import { uploadHoneytokenImage, deleteHoneytokenImage } from '../lib/storage.js';
import { generateAwsToken, generateFinancialToken, generateHealthcareToken, generateImageToken } from '../lib/tokenGenerators.js';
import { sendEmailNotification } from '../lib/mailer.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

const router = Router();
router.use(requireAuth, requireOrg);

// GET /tokens
router.get('/', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('tokens')
    .select('*')
    .eq('org_id', req.org.id)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, data });
});

// GET /tokens/count
router.get('/count', async (req, res) => {
  const { count, error } = await supabaseAdmin
    .from('tokens')
    .select('id', { count: 'exact', head: true })
    .eq('org_id', req.org.id);

  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, data: count });
});

// GET /tokens/id/:token
router.get('/id/:token', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('tokens')
    .select('*')
    .eq('org_id', req.org.id)
    .eq('token', req.params.token)
    .single();

  if (error || !data) return res.status(404).json({ success: false, error: 'Token not found' });
  res.json({ success: true, data });
});

// GET /tokens/:token/logs
router.get('/:token/logs', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('token_logs')
    .select('*')
    .eq('org_id', req.org.id)
    .eq('token', req.params.token)
    .order('timestamp', { ascending: false });

  if (error) return res.status(500).json({ success: false, error: error.message });
  res.json({ success: true, data: data || [] });
});

// GET /tokens/:token/stats
router.get('/:token/stats', async (req, res) => {
  const { data: stats, error } = await supabaseAdmin
    .from('token_logs')
    .select('*')
    .eq('org_id', req.org.id)
    .eq('token', req.params.token);

  if (error) return res.status(500).json({ success: false, error: error.message });

  const totalAccesses = stats.length;
  const successfulAccesses = stats.filter((l) => l.status === 'SUCCESS' || l.status === 'success').length;
  const failedAccesses = stats.filter((l) => l.status === 'ERROR' || l.status === 'error').length;
  const uniqueIPs = new Set(stats.map((l) => l.ip_address).filter(Boolean)).size;
  const latestAccess = stats.length
    ? new Date(Math.max(...stats.map((l) => new Date(l.timestamp).getTime())))
    : null;

  res.json({
    success: true,
    data: {
      total_accesses: totalAccesses,
      successful_accesses: successfulAccesses,
      failed_accesses: failedAccesses,
      unique_visitors: uniqueIPs,
      latest_access: latestAccess,
      logs: stats,
    },
  });
});

// POST /tokens — generate a new honeytoken
router.post('/', requireOrgRole.atLeast('analyst'), upload.single('file'), async (req, res) => {
  try {
    const { tokenName, description, category } = req.body;
    if (!tokenName || !category) {
      return res.status(400).json({ success: false, error: 'Token name and category are required' });
    }

    let generatedToken;
    let imageurl = null;
    let imagepath = null;
    let filename = null;
    let mimetype = null;
    let size = null;
    let metadata = {};

    switch (category.toLowerCase()) {
      case 'image': {
        if (!req.file) {
          return res.status(400).json({ success: false, error: 'Image file is required for the image category' });
        }
        const uploaded = await uploadHoneytokenImage(req.file);
        imageurl = uploaded.imageurl;
        imagepath = uploaded.imagepath;
        filename = req.file.originalname;
        mimetype = req.file.mimetype;
        size = String(req.file.size);
        generatedToken = generateImageToken();
        break;
      }
      case 'aws': {
        const { awsRegion, awsService } = req.body;
        if (!awsRegion || !awsService) {
          return res.status(400).json({ success: false, error: 'AWS region and service are required' });
        }
        generatedToken = generateAwsToken(awsRegion, awsService);
        metadata = { region: awsRegion, service: awsService };
        break;
      }
      case 'financial': {
        const { financialType } = req.body;
        if (!financialType) {
          return res.status(400).json({ success: false, error: 'Financial type is required' });
        }
        generatedToken = generateFinancialToken(financialType);
        metadata = { type: financialType };
        break;
      }
      case 'healthcare': {
        const { healthcareSystem, patientId } = req.body;
        if (!healthcareSystem) {
          return res.status(400).json({ success: false, error: 'Healthcare system is required' });
        }
        generatedToken = generateHealthcareToken(healthcareSystem, patientId);
        metadata = { system: healthcareSystem, patientIdFormat: patientId };
        break;
      }
      default:
        return res.status(400).json({ success: false, error: 'Invalid category' });
    }

    const { data: tokenDoc, error } = await supabaseAdmin
      .from('tokens')
      .insert([
        {
          org_id: req.org.id,
          token_name: tokenName,
          description,
          category,
          token: generatedToken,
          imageurl,
          imagepath,
          filename,
          mimetype,
          size,
          created_by: req.user.id,
          metadata,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    sendEmailNotification(
      `New Token Generated — ${category}`,
      `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2>New Honeytoken Generated</h2>
        <p><strong>Org:</strong> ${req.org.name}</p>
        <p><strong>Token:</strong> ${generatedToken}</p>
        <p><strong>Category:</strong> ${category}</p>
        <p><strong>Name:</strong> ${tokenName}</p>
        <p><strong>Created by:</strong> ${req.user.email}</p>
      </div>`
    ).catch(() => {});

    res.status(201).json({ success: true, token: generatedToken, imageUrl: imageurl, data: tokenDoc });
  } catch (error) {
    console.error('[tokens] generate error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to generate token' });
  }
});

// DELETE /tokens/:token
router.delete('/:token', requireOrgRole.atLeast('admin'), async (req, res) => {
  const { data: existing } = await supabaseAdmin
    .from('tokens')
    .select('imagepath')
    .eq('org_id', req.org.id)
    .eq('token', req.params.token)
    .single();

  const { error } = await supabaseAdmin
    .from('tokens')
    .delete()
    .eq('org_id', req.org.id)
    .eq('token', req.params.token);

  if (error) return res.status(500).json({ success: false, error: error.message });

  if (existing?.imagepath) {
    deleteHoneytokenImage(existing.imagepath).catch(() => {});
  }

  res.json({ success: true, message: 'Token deleted successfully' });
});

export default router;
