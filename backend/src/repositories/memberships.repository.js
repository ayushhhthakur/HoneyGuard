import { BaseRepository } from './base.repository.js';

export class MembershipsRepository extends BaseRepository {
  constructor() {
    super('memberships');
  }

  async findForUserInOrg(orgId, userId) {
    const result = await this.db.from(this.table).select('*').eq('org_id', orgId).eq('user_id', userId).maybeSingle();
    return this.unwrap(result);
  }

  async listForUser(userId) {
    return this.unwrap(
      await this.db.from(this.table).select('role, organizations(id, name, slug)').eq('user_id', userId)
    );
  }

  async listForOrg(orgId) {
    return this.unwrap(
      await this.db
        .from(this.table)
        .select('id, role, created_at, profiles(id, email, full_name, is_active)')
        .eq('org_id', orgId)
        .order('created_at', { ascending: true })
    );
  }

  async create(row) {
    return this.unwrap(await this.db.from(this.table).insert([row]).select().single());
  }

  async upsert(row) {
    return this.unwrap(await this.db.from(this.table).upsert([row], { onConflict: 'org_id,user_id' }).select().single());
  }

  async updateRole(orgId, userId, role) {
    return this.unwrap(
      await this.db.from(this.table).update({ role }).eq('org_id', orgId).eq('user_id', userId).select().single(),
      { notFoundMessage: 'Membership not found' }
    );
  }

  async remove(orgId, userId) {
    return this.unwrap(await this.db.from(this.table).delete().eq('org_id', orgId).eq('user_id', userId));
  }

  async countOwners(orgId) {
    const { count, error } = await this.db
      .from(this.table)
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('role', 'owner');
    if (error) return this.unwrap({ data: null, error });
    return count || 0;
  }
}

export const membershipsRepository = new MembershipsRepository();
export default membershipsRepository;
