import { BaseRepository } from './base.repository.js';

export class CategoriesRepository extends BaseRepository {
  constructor() {
    super('categories');
  }

  async listByOrg(orgId) {
    return this.unwrap(await this.db.from(this.table).select('*').eq('org_id', orgId).order('category', { ascending: true }));
  }

  async create(row) {
    return this.unwrap(await this.db.from(this.table).insert([row]).select().single());
  }

  async createMany(rows) {
    return this.unwrap(await this.db.from(this.table).insert(rows).select());
  }

  async deleteByIdInOrg(orgId, id) {
    return this.unwrap(await this.db.from(this.table).delete().eq('id', id).eq('org_id', orgId));
  }
}

export const categoriesRepository = new CategoriesRepository();
export default categoriesRepository;
