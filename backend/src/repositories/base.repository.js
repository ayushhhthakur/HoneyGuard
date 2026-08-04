import { supabaseAdmin } from '../db/supabaseAdmin.js';
import { AppError } from '../core/errors.js';

/**
 * Repository layer: the ONLY place raw `.from(table)` Supabase calls should
 * appear. Services depend on repositories, never on supabaseAdmin directly —
 * that's what lets a service's business logic be read/tested without caring
 * that the datastore happens to be Postgres-via-Supabase today.
 */
export class BaseRepository {
  constructor(table) {
    this.table = table;
    this.db = supabaseAdmin;
  }

  /** Wraps a Supabase `{ data, error }` result, throwing a typed AppError on failure. */
  unwrap(result, { notFoundMessage } = {}) {
    const { data, error } = result;
    if (error) {
      if (error.code === 'PGRST116' && notFoundMessage) {
        throw new AppError(notFoundMessage, 404, 'NOT_FOUND');
      }
      throw new AppError(error.message, 500, 'DB_ERROR', { table: this.table, dbCode: error.code });
    }
    return data;
  }

  async findById(id, columns = '*') {
    const result = await this.db.from(this.table).select(columns).eq('id', id).maybeSingle();
    return this.unwrap(result);
  }
}

export default BaseRepository;
