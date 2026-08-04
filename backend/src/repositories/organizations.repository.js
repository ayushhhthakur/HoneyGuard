import { BaseRepository } from './base.repository.js';

export class OrganizationsRepository extends BaseRepository {
  constructor() {
    super('organizations');
  }

  async create(row) {
    return this.unwrap(await this.db.from(this.table).insert([row]).select().single());
  }

  async findBySlug(slug) {
    const result = await this.db.from(this.table).select('id').eq('slug', slug).maybeSingle();
    return this.unwrap(result);
  }

  async deleteById(id) {
    return this.unwrap(await this.db.from(this.table).delete().eq('id', id));
  }
}

export const organizationsRepository = new OrganizationsRepository();
export default organizationsRepository;
