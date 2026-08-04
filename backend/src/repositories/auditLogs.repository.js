import { BaseRepository } from './base.repository.js';

export class AuditLogsRepository extends BaseRepository {
  constructor() {
    super('audit_logs');
  }

  async create(row) {
    // Audit logging must never break the request that triggered it — the
    // service layer already wraps this in try/catch, but we also swallow
    // the DB error here defensively rather than throw via unwrap().
    const { error } = await this.db.from(this.table).insert([row]);
    if (error) return false;
    return true;
  }

  async listByOrg(orgId, { limit = 200 } = {}) {
    return this.unwrap(
      await this.db
        .from(this.table)
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })
        .limit(limit)
    );
  }
}

export const auditLogsRepository = new AuditLogsRepository();
export default auditLogsRepository;
