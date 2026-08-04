import { tokensRepository } from '../repositories/tokens.repository.js';
import { tokenLogsRepository } from '../repositories/tokenLogs.repository.js';
import { uploadHoneytokenImage, uploadHoneytokenFile, deleteHoneytokenImage } from './storage.service.js';
import { sendEmailNotification } from './mailer.service.js';
import { recordAudit } from './audit.service.js';
import { AUDIT_ACTIONS } from '../config/constants.js';
import { getTokenTypeDef } from '../domain/tokenTypes/index.js';
import { randomAlphaNum } from '../domain/generators/primitives.js';
import { env } from '../config/env.js';
import { BadRequestError, NotFoundError } from '../core/errors.js';
import { sanitizeText } from '../core/sanitize.js';

export const listTokens = (orgId) => tokensRepository.listByOrg(orgId);

export const countTokens = (orgId) => tokensRepository.countByOrg(orgId);

export const getTokenByValue = async (orgId, token) => {
  const row = await tokensRepository.findByTokenInOrg(orgId, token);
  if (!row) throw new NotFoundError('Token not found');
  return row;
};

export const getTokenLogs = (orgId, token) => tokenLogsRepository.listByTokenInOrg(orgId, token);

export const getTokenStats = async (orgId, token) => {
  const logs = await tokenLogsRepository.listByTokenInOrg(orgId, token);
  const totalAccesses = logs.length;
  const successfulAccesses = logs.filter((l) => String(l.status).toLowerCase() === 'success').length;
  const failedAccesses = logs.filter((l) => String(l.status).toLowerCase() === 'error').length;
  const uniqueVisitors = new Set(logs.map((l) => l.ip_address).filter(Boolean)).size;
  const latestAccess = logs.length ? new Date(Math.max(...logs.map((l) => new Date(l.timestamp).getTime()))) : null;

  return {
    total_accesses: totalAccesses,
    successful_accesses: successfulAccesses,
    failed_accesses: failedAccesses,
    unique_visitors: uniqueVisitors,
    latest_access: latestAccess,
    logs,
  };
};

// Old category -> new registry key, so the original image/aws/financial/
// healthcare flow (and anything still calling the API the old way) keeps
// working unchanged.
const LEGACY_CATEGORY_TO_TYPE = {
  image: 'image',
  aws: 'aws_credentials',
  financial: 'financial_document',
  healthcare: 'healthcare_record',
};

const buildTrackingContext = (candidateToken) => ({
  token: candidateToken,
  decoyUrl: `${env.publicBaseUrl}/decoy/${candidateToken}`,
  imageUrl: `${env.publicBaseUrl}/image/${candidateToken}`,
  apiBase: env.publicBaseUrl,
  fingerprintScriptUrl: `${env.publicBaseUrl}/fp.js`,
});

/**
 * Creates a honeytoken of any registered type. `file` is the multer file
 * object — only used by upload-based types (currently just `image_token`);
 * every other type generates its own content (credential string or a
 * server-generated document) via the type registry.
 */
export const createToken = async ({ org, actor, body, file, ipAddress }) => {
  const { tokenName, description, category } = body;
  const tokenType = body.tokenType || LEGACY_CATEGORY_TO_TYPE[category];

  if (!tokenType) throw new BadRequestError('tokenType (or a legacy category) is required');
  const typeDef = getTokenTypeDef(tokenType);
  if (!typeDef) throw new BadRequestError(`Unknown token type: ${tokenType}`);

  let imageurl = null;
  let imagepath = null;
  let filename = null;
  let mimetype = null;
  let size = null;
  let metadata = {};
  let tokenValue;
  let fileFormat = typeDef.fileFormat;

  if (typeDef.requiresUpload) {
    if (!file) throw new BadRequestError(`A file upload is required for ${typeDef.label}`);
    const uploaded = await uploadHoneytokenImage(file);
    imageurl = uploaded.imageurl;
    imagepath = uploaded.imagepath;
    filename = sanitizeText(file.originalname, { maxLength: 255 });
    mimetype = file.mimetype;
    size = String(file.size);
    tokenValue = `img_${randomAlphaNum(20)}`;
  } else {
    const candidateToken = randomAlphaNum(24);
    const ctx = buildTrackingContext(candidateToken);
    const result = await typeDef.generate(body, ctx);

    tokenValue = result.token || candidateToken;
    metadata = result.metadata || {};
    if (result.fileFormat) fileFormat = result.fileFormat;

    if (result.file) {
      const uploaded = await uploadHoneytokenFile(
        { buffer: result.file.buffer, mimetype: result.file.mimetype, originalname: result.file.filename },
        { folder: 'honeytoken-files' }
      );
      imageurl = uploaded.fileurl;
      imagepath = uploaded.filepath;
      filename = result.file.filename;
      mimetype = result.file.mimetype;
      size = String(result.file.buffer.length);
    }
  }

  const expiresAt = typeDef.defaultExpiryDays
    ? new Date(Date.now() + typeDef.defaultExpiryDays * 86400e3).toISOString()
    : null;

  const tokenDoc = await tokensRepository.create({
    org_id: org.id,
    token_name: sanitizeText(tokenName, { maxLength: 200 }),
    description: sanitizeText(description, { maxLength: 1000 }),
    category: category || typeDef.family,
    token_type: tokenType,
    token: tokenValue,
    imageurl,
    imagepath,
    filename,
    mimetype,
    size,
    created_by: actor.id,
    metadata,
    tags: Array.isArray(body.tags) ? body.tags.slice(0, 20).map((t) => sanitizeText(t, { maxLength: 40 })) : [],
    status: 'active',
    expires_at: expiresAt,
    delivery_method: typeDef.deliveryMethod,
    file_format: fileFormat,
  });

  sendEmailNotification(
    `New Token Generated — ${typeDef.label}`,
    `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <h2>New Honeytoken Generated</h2>
      <p><strong>Org:</strong> ${org.name}</p>
      <p><strong>Type:</strong> ${typeDef.label}</p>
      <p><strong>Name:</strong> ${tokenDoc.token_name}</p>
      <p><strong>Created by:</strong> ${actor.email}</p>
    </div>`
  ).catch(() => {});

  recordAudit({
    orgId: org.id,
    actorId: actor.id,
    action: AUDIT_ACTIONS.TOKEN_CREATED,
    targetType: 'token',
    targetId: tokenValue,
    metadata: { tokenType, tokenName: tokenDoc.token_name },
    ipAddress,
  });

  return { token: tokenValue, imageUrl: imageurl, data: tokenDoc };
};

export const deleteToken = async ({ org, actor, token, ipAddress }) => {
  const existing = await tokensRepository.findByTokenInOrg(org.id, token);
  if (!existing) throw new NotFoundError('Token not found');

  await tokensRepository.deleteByTokenInOrg(org.id, token);

  if (existing.imagepath) deleteHoneytokenImage(existing.imagepath).catch(() => {});

  recordAudit({
    orgId: org.id,
    actorId: actor.id,
    action: AUDIT_ACTIONS.TOKEN_DELETED,
    targetType: 'token',
    targetId: token,
    metadata: { tokenName: existing.token_name, category: existing.category },
    ipAddress,
  });

  return { message: 'Token deleted successfully' };
};

export default {
  listTokens,
  countTokens,
  getTokenByValue,
  getTokenLogs,
  getTokenStats,
  createToken,
  deleteToken,
};
