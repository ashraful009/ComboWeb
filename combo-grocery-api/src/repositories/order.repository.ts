import { BaseRepository } from './base.repository';
import type { Knex } from 'knex';
import type { AddressRow } from '../types/user.types';
import type { DeliveryZoneRow } from '../types/cart.types';
import type { OrderRow, OrderItemRow, PaymentRow } from '../types/order.types';

export class OrderRepository extends BaseRepository {
  async getAddress(addressId: number, userId: number, trx?: Knex.Transaction): Promise<AddressRow | undefined> {
    return this.conn(trx).table('addresses').where({ id: addressId, user_id: userId }).first();
  }

  async getDeliveryZone(zoneId: number, trx?: Knex.Transaction): Promise<DeliveryZoneRow | undefined> {
    return this.conn(trx).table('delivery_zones').where({ id: zoneId, is_active: true }).first();
  }

  async createOrder(data: Partial<OrderRow>, trx?: Knex.Transaction): Promise<number> {
    const [id] = await this.conn(trx).table('orders').insert(data);
    return id as number;
  }

  async addOrderItems(items: Partial<OrderItemRow>[], trx?: Knex.Transaction): Promise<void> {
    await this.conn(trx).table('order_items').insert(items);
  }

  async addStatusHistory(orderId: number, status: string, trx?: Knex.Transaction): Promise<void> {
    await this.conn(trx).table('order_status_history').insert({ order_id: orderId, status });
  }

  async createPayment(data: Partial<PaymentRow>, trx?: Knex.Transaction): Promise<void> {
    await this.conn(trx).table('payments').insert(data);
  }

  async trackOrder(orderNumber: string, userId: number, trx?: Knex.Transaction) {
    const order = await this.conn(trx).table('orders')
      .where({ order_number: orderNumber, user_id: userId })
      .first();

    if (!order) return null;

    const items = await this.conn(trx).table('order_items')
      .join('combos', 'order_items.combo_id', 'combos.id')
      .where('order_items.order_id', order.id)
      .select(
        'order_items.*',
        'combos.name as combo_name',
        'combos.base_price_paisa as combo_base_price'
      );

    const history = await this.conn(trx).table('order_status_history')
      .where('order_id', order.id)
      .orderBy('created_at', 'asc');

    return { ...order, items, history };
  }
}
