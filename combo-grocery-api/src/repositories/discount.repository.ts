import { BaseRepository } from './base.repository';
import type { Knex } from 'knex';
import type { DiscountRow } from '../types/discount.types';

export class DiscountRepository extends BaseRepository {
  async getActiveDiscounts(now: Date, trx?: Knex.Transaction): Promise<DiscountRow[]> {
    return this.conn(trx).table('discounts')
      .where('is_active', true)
      .andWhere('start_date', '<=', now)
      .andWhere('end_date', '>=', now);
  }

  async create(data: Partial<DiscountRow>, trx?: Knex.Transaction): Promise<number> {
    const [id] = await this.conn(trx).table('discounts').insert(data);
    return id as number;
  }
}
