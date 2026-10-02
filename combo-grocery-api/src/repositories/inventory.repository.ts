import { BaseRepository } from './base.repository';
import type { Knex } from 'knex';
import type { PurchaseRow } from '../types/item.types';

export class InventoryRepository extends BaseRepository {
  async createPurchase(data: Partial<PurchaseRow>, trx?: Knex.Transaction): Promise<number> {
    const [id] = await this.conn(trx).table('purchases').insert(data);
    return id as number;
  }

  async addPurchaseItems(items: any[], trx?: Knex.Transaction): Promise<void> {
    await this.conn(trx).table('purchase_items').insert(items);
  }

  async addInventoryLogs(logs: any[], trx?: Knex.Transaction): Promise<void> {
    await this.conn(trx).table('inventory_logs').insert(logs);
  }

  async updateItemStock(itemId: number, qtyChange: number, totalCostToAdd: number, trx?: Knex.Transaction): Promise<void> {
    // This updates the stock and recalculates moving average cost
    await this.conn(trx).raw(`
      UPDATE items 
      SET 
        avg_cost_paisa = CASE 
          WHEN stock_qty + ? > 0 THEN ((stock_qty * avg_cost_paisa) + ?) / (stock_qty + ?) 
          ELSE avg_cost_paisa 
        END,
        stock_qty = stock_qty + ?
      WHERE id = ?
    `, [qtyChange, totalCostToAdd, qtyChange, qtyChange, itemId]);
  }
}
