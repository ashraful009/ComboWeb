import { BaseRepository } from './base.repository';
import type { Knex } from 'knex';
import type { CategoryRow } from '../types/category.types';

export class CategoryRepository extends BaseRepository {
  async findAll(trx?: Knex.Transaction): Promise<CategoryRow[]> {
    return this.conn(trx).table('categories').orderBy('display_order', 'asc');
  }

  async create(data: Partial<CategoryRow>, trx?: Knex.Transaction): Promise<number> {
    const [id] = await this.conn(trx).table('categories').insert(data);
    return id as number;
  }
}
