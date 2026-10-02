import { BaseRepository } from './base.repository';
import type { Knex } from 'knex';

export class CouponRepository extends BaseRepository {
  async createCoupon(data: any, trx?: Knex.Transaction): Promise<number> {
    const [id] = await this.conn(trx).table('coupons').insert(data);
    return id as number;
  }

  async findByCode(code: string, trx?: Knex.Transaction) {
    return this.conn(trx).table('coupons').where({ code, is_active: true }).first();
  }
}
