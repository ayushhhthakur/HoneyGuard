import { tokensRepository } from '../repositories/tokens.repository.js';
import { tokenRotationsRepository } from '../repositories/tokenRotations.repository.js';
import { getTokenTypeDef } from '../domain/tokenTypes/index.js';
import { createToken } from './token.service.js';
import { recordAudit } from './audit.service.js';
import { AUDIT_ACTIONS } from '../config/constants.js';
import { BadRequestError, NotFoundError } from '../core/errors.js';
import { sanitizeText } from '../core/sanitize.js';

/**
 * Rotation = generate a brand-new token of the same type (fresh secret,
 * fresh tracking identifier), mark the old one `rotated`, and link them in
 * `token_rotations`. We don't mutate the old row's value in place — a
 * rotated-out credential staying visible (but inert) in history is useful
 * for incident review ("was THIS the one that leaked, before or after
 * rotation?").
 */
export const rotateToken = async ({ org, actor, token, reason, ipAddress }) => {
  const existing = await tokensRepository.findByTokenInOrg(org.id, token);
  if (!existing) throw new NotFoundError('Token not found');

  const typeDef = getTokenTypeDef(existing.token_type);
  if (typeDef && typeDef.rotatable === false) {
    throw new BadRequestError(`${typeDef.label} tokens are generated per-document and can't be rotated in place — create a new one instead.`);
  }

  const created = await createToken({
    org,
    actor,
    body: {
      tokenName: existing.token_name,
      description: existing.description,
      tokenType: existing.token_type,
      category: existing.category,
      tags: existing.tags,
      // Type-specific input fields (e.g. dbEngine, format) aren't persisted
      // from the original generation call today, so rotation re-generates
      // using each type's defaults. Fine for every current type (all
      // optional fields have sane defaults); a future type with a required
      // field should persist it into metadata at creation time and
      // round-trip it here.
    },
    file: null,
    ipAddress,
  });

  await tokensRepository.updateFieldsInOrg(org.id, token, { status: 'rotated', rotated_at: new Date().toISOString() });
  await tokensRepository.updateFieldsInOrg(org.id, created.token, { rotated_from: existing.id });

  await tokenRotationsRepository.create({
    org_id: org.id,
    previous_token: token,
    new_token: created.token,
    reason: sanitizeText(reason, { maxLength: 300 }) || null,
    rotated_by: actor.id,
  });

  recordAudit({
    orgId: org.id,
    actorId: actor.id,
    action: AUDIT_ACTIONS.TOKEN_ROTATED,
    targetType: 'token',
    targetId: token,
    metadata: { newToken: created.token, reason },
    ipAddress,
  });

  return created;
};

export const expireToken = async ({ org, actor, token, ipAddress }) => {
  const data = await tokensRepository.updateFieldsInOrg(org.id, token, { status: 'expired' });
  recordAudit({ orgId: org.id, actorId: actor.id, action: AUDIT_ACTIONS.TOKEN_EXPIRED, targetType: 'token', targetId: token, ipAddress });
  return data;
};

export const revokeToken = async ({ org, actor, token, ipAddress }) => {
  const data = await tokensRepository.updateFieldsInOrg(org.id, token, { status: 'revoked' });
  recordAudit({ orgId: org.id, actorId: actor.id, action: AUDIT_ACTIONS.TOKEN_REVOKED, targetType: 'token', targetId: token, ipAddress });
  return data;
};

export const updateTokenTags = async ({ org, actor, token, tags, ipAddress }) => {
  const cleanTags = [...new Set((tags || []).map((t) => sanitizeText(t, { maxLength: 40 })).filter(Boolean))].slice(0, 20);
  const data = await tokensRepository.updateFieldsInOrg(org.id, token, { tags: cleanTags });
  recordAudit({ orgId: org.id, actorId: actor.id, action: AUDIT_ACTIONS.TOKEN_TAGGED, targetType: 'token', targetId: token, metadata: { tags: cleanTags }, ipAddress });
  return data;
};

/** Lazily sweeps past-due tokens to `expired` for this org. Called
 * opportunistically from the tokens list endpoint, so expiry is reflected
 * even without a cron running. A scheduled sweep (pg_cron calling
 * expire_due_tokens(), or an edge function on a timer) covers orgs nobody
 * is actively looking at — see supabase/migrations/0006 for the function. */
export const sweepExpiredTokens = async (orgId) => tokensRepository.expireDueTokens(orgId);

const CSV_COLUMNS = ['token_name', 'token_type', 'category', 'token', 'status', 'tags', 'created_at', 'expires_at', 'rotated_at'];

const toCsv = (rows) => {
  const escape = (v) => {
    const s = Array.isArray(v) ? v.join('|') : v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = CSV_COLUMNS.join(',');
  const lines = rows.map((row) => CSV_COLUMNS.map((c) => escape(row[c])).join(','));
  return [header, ...lines].join('\n');
};

export const exportTokens = async ({ org, actor, format = 'json', ipAddress }) => {
  const rows = await tokensRepository.listByOrg(org.id);

  // Never export the secret material itself in bulk exports — export is an
  // inventory/compliance view (what exists, its lifecycle state, its tags),
  // not a credential dump. Anyone needing the actual secret value already
  // has per-token access via GET /tokens/id/:token.
  const sanitized = rows.map(({ metadata, imageurl, imagepath, ...rest }) => rest);

  recordAudit({ orgId: org.id, actorId: actor.id, action: AUDIT_ACTIONS.TOKENS_EXPORTED, metadata: { format, count: sanitized.length }, ipAddress });

  if (format === 'csv') return { contentType: 'text/csv', body: toCsv(sanitized) };
  return { contentType: 'application/json', body: JSON.stringify(sanitized, null, 2) };
};

export default { rotateToken, expireToken, revokeToken, updateTokenTags, sweepExpiredTokens, exportTokens };
