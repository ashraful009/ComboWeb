import { BaseRepository } from './base.repository';
import type { Knex } from 'knex';
import type { ItemRow } from '../types/item.types';

export class ItemRepository extends BaseRepository {
  async create(data: Partial<ItemRow>, trx?: Knex.Transaction): Promise<number> {
    const [id] = await this.conn(trx).table('items').insert(data);
    return id as number;
  }

  async findAllActive(trx?: Knex.Transaction) {
    return this.conn(trx).table('items').where({ is_active: true });
  }
}
