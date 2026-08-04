import { BaseRepository } from './base.repository.js';

export class TokenLogsRepository extends BaseRepository {
  constructor() {
    super('token_logs');
  }

  async create(row) {
    return this.unwrap(await this.db.from(this.table).insert([row]).select().single());
  }

  async listByTokenInOrg(orgId, token) {
    return this.unwrap(
      await this.db
        .from(this.table)
        .select('*')
        .eq('org_id', orgId)
        .eq('token', token)
        .order('timestamp', { ascending: false })
    );
  }

  async listByOrgSince(orgId, sinceIso, limit = 500) {
    return this.unwrap(
      await this.db
        .from(this.table)
        .select('*')
        .eq('org_id', orgId)
        .gte('timestamp', sinceIso)
        .order('timestamp', { ascending: false })
        .limit(limit)
    );
  }

  async countByOrg(orgId) {
    const { count, error } = await this.db
      .from(this.table)
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId);
    if (error) return this.unwrap({ data: null, error });
    return count || 0;
  }

  async timestampSeries(orgId) {
    return this.unwrap(
      await this.db.from(this.table).select('timestamp, status').eq('org_id', orgId).order('timestamp', { ascending: true })
    );
  }

  async recentIpsByOrg(orgId, limit = 500) {
    return this.unwrap(
      await this.db
        .from(this.table)
        .select('ip_address')
        .eq('org_id', orgId)
        .order('timestamp', { ascending: false })
        .limit(limit)
    );
  }

  async countrySeries(orgId, limit = 2000) {
    return this.unwrap(
      await this.db
        .from(this.table)
        .select('country, ip_address')
        .eq('org_id', orgId)
        .order('timestamp', { ascending: false })
        .limit(limit)
    );
  }

  async eventSeries(orgId, sinceIso) {
    return this.unwrap(await this.db.from(this.table).select('event').eq('org_id', orgId).gte('timestamp', sinceIso));
  }

  async recentEvents(orgId, limit = 25) {
    return this.unwrap(
      await this.db
        .from(this.table)
        .select('id, token, event, status, ip_address, country, city, browser, os, device, timestamp, tokens(token_name, category)')
        .eq('org_id', orgId)
        .order('timestamp', { ascending: false })
        .limit(limit)
    );
  }

  async geoPointsByOrg(orgId, limit = 2000) {
    return this.unwrap(
      await this.db
        .from(this.table)
        .select('ip_address, country, city, region, timezone, isp, latitude, longitude')
        .eq('org_id', orgId)
        .order('timestamp', { ascending: false })
        .limit(limit)
    );
  }
}

export const tokenLogsRepository = new TokenLogsRepository();
export default tokenLogsRepository;
