import { BaseRepository } from './base.repository.js';

export class AlertsRepository extends BaseRepository {
  constructor() {
    super('alerts');
  }

  async create(row) {
    return this.unwrap(await this.db.from(this.table).insert([row]).select().single());
  }

  async listByOrg(orgId, { status, severity } = {}) {
    let query = this.db.from(this.table).select('*').eq('org_id', orgId).order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);
    if (severity) query = query.eq('severity', severity);
    return this.unwrap(await query);
  }

  async openSeverityCounts(orgId) {
    return this.unwrap(await this.db.from(this.table).select('severity').eq('org_id', orgId).eq('status', 'open'));
  }

  async countOpenByOrg(orgId) {
    const { count, error } = await this.db
      .from(this.table)
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('status', 'open');
    if (error) return this.unwrap({ data: null, error });
    return count || 0;
  }

  async updateStatusInOrg(orgId, id, patch) {
    return this.unwrap(
      await this.db.from(this.table).update(patch).eq('id', id).eq('org_id', orgId).select().single(),
      { notFoundMessage: 'Alert not found' }
    );
  }
}

export const alertsRepository = new AlertsRepository();
export default alertsRepository;
