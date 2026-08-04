import { ok } from '../core/ApiResponse.js';
import * as fingerprintService from '../services/fingerprint.service.js';

export const list = async (req, res) =>
  ok(res, await fingerprintService.listFingerprints(req.org.id, { token: req.query.token }));

export const getById = async (req, res) => ok(res, await fingerprintService.getFingerprintById(req.org.id, req.params.id));

export default { list, getById };
