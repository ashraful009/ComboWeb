import { BaseRepository } from './base.repository';
import type { Knex } from 'knex';
import type { UserRow, AddressRow } from '../types/user.types';

export class UserRepository extends BaseRepository {
  async findByPhone(phone: string, trx?: Knex.Transaction): Promise<UserRow | undefined> {
    return this.conn(trx).table('users').where({ phone, deleted_at: null }).first();
  }

  async create(data: Partial<UserRow>, trx?: Knex.Transaction): Promise<number> {
    const [id] = await this.conn(trx).table('users').insert(data);
    return id as number;
  }

  async getAddresses(userId: number, trx?: Knex.Transaction): Promise<any[]> {
    return this.conn(trx).table('addresses')
      .leftJoin('delivery_zones', 'addresses.delivery_zone_id', 'delivery_zones.id')
      .where('addresses.user_id', userId)
      .select(
        'addresses.id',
        'addresses.title',
        'addresses.is_default',
        'addresses.recipient_name',
        'addresses.recipient_phone',
        'addresses.street_address',
        'delivery_zones.name as zone_name'
      );
  }

  async addAddress(data: Partial<AddressRow>, trx?: Knex.Transaction): Promise<number> {
    const [id] = await this.conn(trx).table('addresses').insert(data);
    return id as number;
  }

  async updateAddress(id: number, userId: number, data: Partial<AddressRow>, trx?: Knex.Transaction): Promise<void> {
    await this.conn(trx).table('addresses').where({ id, user_id: userId }).update({ ...data, updated_at: new Date() });
  }

  async deleteAddress(id: number, userId: number, trx?: Knex.Transaction): Promise<void> {
    await this.conn(trx).table('addresses').where({ id, user_id: userId }).delete();
  }

  async clearDefaultAddresses(userId: number, trx?: Knex.Transaction): Promise<void> {
    await this.conn(trx).table('addresses').where({ user_id: userId }).update({ is_default: false });
  }

  async setDefaultAddress(id: number, userId: number, trx?: Knex.Transaction): Promise<void> {
    await this.conn(trx).table('addresses').where({ id, user_id: userId }).update({ is_default: true, updated_at: new Date() });
  }
}
