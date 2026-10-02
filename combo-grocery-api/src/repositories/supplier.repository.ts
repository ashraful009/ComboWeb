import { BaseRepository } from './base.repository';
import type { Knex } from 'knex';
import type { SupplierRow } from '../types/item.types';

export class SupplierRepository extends BaseRepository {
  async create(data: Partial<SupplierRow>, trx?: Knex.Transaction): Promise<number> {
    const [id] = await this.conn(trx).table('suppliers').insert(data);
    return id as number;
  }
}
