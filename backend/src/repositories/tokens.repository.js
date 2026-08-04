import { BaseRepository } from './base.repository.js';

export class TokensRepository extends BaseRepository {
  constructor() {
    super('tokens');
  }

  async listByOrg(orgId) {
    return this.unwrap(
      await this.db.from(this.table).select('*').eq('org_id', orgId).order('created_at', { ascending: false })
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

  async findByToken(token) {
    const result = await this.db.from(this.table).select('*').eq('token', token).maybeSingle();
    return this.unwrap(result);
  }

  async findByTokenInOrg(orgId, token) {
    const result = await this.db.from(this.table).select('*').eq('org_id', orgId).eq('token', token).maybeSingle();
    return this.unwrap(result);
  }

  async create(row) {
    return this.unwrap(await this.db.from(this.table).insert([row]).select().single());
  }

  async deleteByTokenInOrg(orgId, token) {
    return this.unwrap(await this.db.from(this.table).delete().eq('org_id', orgId).eq('token', token));
  }

  async expireDueTokens(orgId) {
    const { data, error } = await this.db.rpc('expire_due_tokens', { p_org_id: orgId });
    if (error) return 0;
    return data;
  }

  async updateFieldsInOrg(orgId, token, patch) {
    return this.unwrap(
      await this.db.from(this.table).update(patch).eq('org_id', orgId).eq('token', token).select().single(),
      { notFoundMessage: 'Token not found' }
    );
  }

  async categorySeries(orgId) {
    return this.unwrap(await this.db.from(this.table).select('category').eq('org_id', orgId));
  }

  async createdAtSeries(orgId) {
    return this.unwrap(
      await this.db.from(this.table).select('created_at').eq('org_id', orgId).order('created_at', { ascending: true })
    );
  }
}

export const tokensRepository = new TokensRepository();
export default tokensRepository;
