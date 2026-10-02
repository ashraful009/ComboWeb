import { BaseRepository } from './base.repository';
import type { Knex } from 'knex';
import type { CartRow, CartItemRow } from '../types/cart.types';

export class CartRepository extends BaseRepository {
  async getCartByUserId(userId: number, trx?: Knex.Transaction): Promise<CartRow> {
    let cart = await this.conn(trx).table('carts').where({ user_id: userId }).first();
    if (!cart) {
      const [id] = await this.conn(trx).table('carts').insert({ user_id: userId });
      cart = { id, user_id: userId };
    }
    return cart;
  }

  async getCartItems(cartId: number, trx?: Knex.Transaction): Promise<(CartItemRow & { name: string; base_price_paisa: number })[]> {
    return this.conn(trx)
      .table('cart_items')
      .join('combos', 'cart_items.combo_id', '=', 'combos.id')
      .select('cart_items.*', 'combos.name', 'combos.base_price_paisa')
      .where({ cart_id: cartId });
  }

  async addOrUpdateCartItem(cartId: number, comboId: number, quantity: number, trx?: Knex.Transaction) {
    const existing = await this.conn(trx).table('cart_items').where({ cart_id: cartId, combo_id: comboId }).first();
    if (existing) {
      await this.conn(trx).table('cart_items').where({ id: existing.id }).update({ quantity: existing.quantity + quantity });
    } else {
      await this.conn(trx).table('cart_items').insert({ cart_id: cartId, combo_id: comboId, quantity });
    }
  }

  async removeItem(cartId: number, itemId: number, trx?: Knex.Transaction) {
    await this.conn(trx).table('cart_items').where({ cart_id: cartId, id: itemId }).delete();
  }

  async syncCartItems(cartId: number, items: { combo_id: number, quantity: number }[], trx?: Knex.Transaction) {
    await this.conn(trx).table('cart_items').where({ cart_id: cartId }).delete();
    if (items.length > 0) {
      const inserts = items.map(i => ({ cart_id: cartId, combo_id: i.combo_id, quantity: i.quantity }));
      await this.conn(trx).table('cart_items').insert(inserts);
    }
  }
}
