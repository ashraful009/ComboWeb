import { BaseRepository } from './base.repository';
import type { Knex } from 'knex';
import type { DeliveryZoneRow, DeliveryZoneAreaRow } from '../types/cart.types';

export class DeliveryRepository extends BaseRepository {
  async getZones(trx?: Knex.Transaction): Promise<DeliveryZoneRow[]> {
    return this.conn(trx).table('delivery_zones').where('is_active', true).select('id', 'name', 'base_fee_paisa');
  }

  async createZone(data: Partial<DeliveryZoneRow>, trx?: Knex.Transaction): Promise<number> {
    const [id] = await this.conn(trx).table('delivery_zones').insert(data);
    return id as number;
  }
  
  async addAreas(areas: Partial<DeliveryZoneAreaRow>[], trx?: Knex.Transaction): Promise<void> {
    await this.conn(trx).table('delivery_zone_areas').insert(areas);
  }
}
