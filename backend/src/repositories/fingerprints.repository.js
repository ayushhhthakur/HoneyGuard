import { BaseRepository } from './base.repository.js';

export class FingerprintsRepository extends BaseRepository {
  constructor() {
    super('device_fingerprints');
  }

  async create(row) {
    return this.unwrap(await this.db.from(this.table).insert([row]).select().single());
  }

  async findByIdInOrg(orgId, id) {
    const result = await this.db.from(this.table).select('*').eq('org_id', orgId).eq('id', id).maybeSingle();
    return this.unwrap(result);
  }

  async listByOrg(orgId, { token, limit = 200 } = {}) {
    let query = this.db
      .from(this.table)
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (token) query = query.eq('token', token);
    return this.unwrap(await query);
  }
}

export const fingerprintsRepository = new FingerprintsRepository();
export default fingerprintsRepository;
