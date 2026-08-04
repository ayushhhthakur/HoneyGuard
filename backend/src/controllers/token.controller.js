import { ok } from '../core/ApiResponse.js';
import { getClientIp } from '../services/metadata.service.js';
import * as tokenService from '../services/token.service.js';
import * as lifecycleService from '../services/tokenLifecycle.service.js';
import { listTokenTypes, listTokenTypesByFamily } from '../domain/tokenTypes/index.js';

export const listTypes = async (req, res) => ok(res, listTokenTypesByFamily());
export const listTypesFlat = async (req, res) => ok(res, listTokenTypes());

export const list = async (req, res) => {
  await lifecycleService.sweepExpiredTokens(req.org.id);
  return ok(res, await tokenService.listTokens(req.org.id));
};

export const count = async (req, res) => ok(res, await tokenService.countTokens(req.org.id));

export const getByValue = async (req, res) => ok(res, await tokenService.getTokenByValue(req.org.id, req.params.token));

export const getLogs = async (req, res) => ok(res, await tokenService.getTokenLogs(req.org.id, req.params.token));

export const getStats = async (req, res) => ok(res, await tokenService.getTokenStats(req.org.id, req.params.token));

export const create = async (req, res) => {
  const result = await tokenService.createToken({
    org: req.org,
    actor: { id: req.user.id, email: req.user.email },
    body: req.body,
    file: req.file,
    ipAddress: getClientIp(req),
  });
  // Preserve the exact historical response shape { success, token, imageUrl, data }
  // that the dashboard's token-generation flow depends on.
  return res.status(201).json({ success: true, token: result.token, imageUrl: result.imageUrl, data: result.data });
};

export const remove = async (req, res) =>
  ok(
    res,
    await tokenService.deleteToken({
      org: req.org,
      actor: { id: req.user.id, email: req.user.email },
      token: req.params.token,
      ipAddress: getClientIp(req),
    })
  );

export const rotate = async (req, res) =>
  ok(
    res,
    await lifecycleService.rotateToken({
      org: req.org,
      actor: { id: req.user.id, email: req.user.email },
      token: req.params.token,
      reason: req.body.reason,
      ipAddress: getClientIp(req),
    })
  );

export const expire = async (req, res) =>
  ok(
    res,
    await lifecycleService.expireToken({
      org: req.org,
      actor: { id: req.user.id },
      token: req.params.token,
      ipAddress: getClientIp(req),
    })
  );

export const revoke = async (req, res) =>
  ok(
    res,
    await lifecycleService.revokeToken({
      org: req.org,
      actor: { id: req.user.id },
      token: req.params.token,
      ipAddress: getClientIp(req),
    })
  );

export const updateTags = async (req, res) =>
  ok(
    res,
    await lifecycleService.updateTokenTags({
      org: req.org,
      actor: { id: req.user.id },
      token: req.params.token,
      tags: req.body.tags,
      ipAddress: getClientIp(req),
    })
  );

export const exportAll = async (req, res) => {
  const { contentType, body } = await lifecycleService.exportTokens({
    org: req.org,
    actor: { id: req.user.id },
    format: req.query.format,
    ipAddress: getClientIp(req),
  });
  const ext = req.query.format === 'csv' ? 'csv' : 'json';
  res.setHeader('Content-Disposition', `attachment; filename="honeytokens-export.${ext}"`);
  res.type(contentType).send(body);
};

export default { list, count, getByValue, getLogs, getStats, create, remove, rotate, expire, revoke, updateTags, exportAll, listTypes, listTypesFlat };
