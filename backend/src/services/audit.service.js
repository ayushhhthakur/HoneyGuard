import { auditLogsRepository } from '../repositories/auditLogs.repository.js';
import { createLogger } from '../core/logger.js';

const log = createLogger('AuditService');

/**
 * Records a security-sensitive action. Fire-and-forget from the caller's
 * point of view: a failure to write an audit row must never fail the
 * request that triggered it (that would make auditing a denial-of-service
 * vector), so this only ever logs a warning on failure.
 */
export const recordAudit = async ({ orgId, actorId, action, targetType, targetId, metadata = {}, ipAddress }) => {
  try {
    const success = await auditLogsRepository.create({
      org_id: orgId,
      actor_id: actorId || null,
      action,
      target_type: targetType || null,
      target_id: targetId ? String(targetId) : null,
      metadata,
      ip_address: ipAddress || null,
    });
    if (!success) log.warn({ action, orgId }, 'Failed to persist audit log row');
  } catch (error) {
    log.warn({ action, orgId, err: error.message }, 'Audit logging threw');
  }
};

export default { recordAudit };
