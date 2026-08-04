import { alertsRepository } from '../repositories/alerts.repository.js';
import { recordAudit } from './audit.service.js';
import { AUDIT_ACTIONS, ALERT_STATUSES } from '../config/constants.js';

export const listAlerts = (orgId, filters) => alertsRepository.listByOrg(orgId, filters);

export const countOpenAlerts = (orgId) => alertsRepository.countOpenByOrg(orgId);

export const updateAlertStatus = async ({ org, actor, alertId, status, ipAddress }) => {
  const patch = { status };
  if (status === ALERT_STATUSES.RESOLVED) {
    patch.resolved_at = new Date().toISOString();
    patch.resolved_by = actor.id;
  }

  const row = await alertsRepository.updateStatusInOrg(org.id, alertId, patch);

  recordAudit({
    orgId: org.id,
    actorId: actor.id,
    action: AUDIT_ACTIONS.ALERT_STATUS_CHANGED,
    targetType: 'alert',
    targetId: alertId,
    metadata: { status },
    ipAddress,
  });

  return row;
};

export default { listAlerts, countOpenAlerts, updateAlertStatus };
