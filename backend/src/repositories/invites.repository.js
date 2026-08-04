import { BaseRepository } from './base.repository.js';

export class InvitesRepository extends BaseRepository {
  constructor() {
    super('invites');
  }

  async create(row) {
    return this.unwrap(await this.db.from(this.table).insert([row]).select().single());
  }

  async listPendingForOrg(orgId) {
    return this.unwrap(
      await this.db
        .from(this.table)
        .select('*')
        .eq('org_id', orgId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
    );
  }

  async findPendingByToken(token) {
    const result = await this.db.from(this.table).select('*').eq('token', token).eq('status', 'pending').maybeSingle();
    return this.unwrap(result);
  }

  async updateStatus(id, patch) {
    return this.unwrap(await this.db.from(this.table).update(patch).eq('id', id));
  }

  async revokeInOrg(orgId, id) {
    return this.unwrap(await this.db.from(this.table).update({ status: 'revoked' }).eq('id', id).eq('org_id', orgId));
  }
}

export const invitesRepository = new InvitesRepository();
export default invitesRepository;
