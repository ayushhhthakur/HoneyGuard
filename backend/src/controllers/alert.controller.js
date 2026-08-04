import { ok } from '../core/ApiResponse.js';
import { getClientIp } from '../services/metadata.service.js';
import * as alertService from '../services/alert.service.js';

export const list = async (req, res) => ok(res, await alertService.listAlerts(req.org.id, req.query));

export const updateStatus = async (req, res) =>
  ok(
    res,
    await alertService.updateAlertStatus({
      org: req.org,
      actor: { id: req.user.id },
      alertId: req.params.id,
      status: req.body.status,
      ipAddress: getClientIp(req),
    })
  );

export default { list, updateStatus };
