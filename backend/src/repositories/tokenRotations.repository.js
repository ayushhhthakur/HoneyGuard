import { BaseRepository } from './base.repository.js';

export class TokenRotationsRepository extends BaseRepository {
  constructor() {
    super('token_rotations');
  }

  async create(row) {
    return this.unwrap(await this.db.from(this.table).insert([row]).select().single());
  }

  async listByOrg(orgId, limit = 200) {
    return this.unwrap(
      await this.db.from(this.table).select('*').eq('org_id', orgId).order('rotated_at', { ascending: false }).limit(limit)
    );
  }
}

export const tokenRotationsRepository = new TokenRotationsRepository();
export default tokenRotationsRepository;
