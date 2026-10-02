import { InventoryRepository } from '../repositories/inventory.repository';
import { withTransaction } from '../config/db';
import { AppError } from '../utils/appError';

export class InventoryService {
  private repo = new InventoryRepository();

  async recordPurchase(data: any, userId: number) {
    let totalAmount = 0;
    const purchaseItems = data.items.map((i: any) => {
      const totalCost = i.qty * i.unit_cost_paisa;
      totalAmount += totalCost;
      return {
        item_id: i.item_id,
        qty: i.qty,
        unit_cost_paisa: i.unit_cost_paisa,
        total_cost_paisa: totalCost,
      };
    });

    return withTransaction(async (trx) => {
      const purchaseId = await this.repo.createPurchase({
        supplier_id: data.supplier_id,
        reference_no: data.reference_no,
        purchase_date: new Date(data.purchase_date),
        total_amount_paisa: totalAmount,
        status: 'completed',
        created_by: userId,
      }, trx);

      const itemsWithPurchaseId = purchaseItems.map((i: any) => ({ ...i, purchase_id: purchaseId }));
      await this.repo.addPurchaseItems(itemsWithPurchaseId, trx);

      const logs = purchaseItems.map((i: any) => ({
        item_id: i.item_id,
        transaction_type: 'in',
        qty_change: i.qty,
        previous_stock: 0, // In a real app we'd fetch previous stock first
        new_stock: 0, // Will be handled properly by DB triggers or separate read
        reference_type: 'purchase',
        reference_id: purchaseId,
        created_by: userId,
      }));
      // Simplified log insertion for Phase 1
      await this.repo.addInventoryLogs(logs, trx);

      for (const item of purchaseItems) {
        await this.repo.updateItemStock(item.item_id, item.qty, item.total_cost_paisa, trx);
      }

      return { purchaseId, totalAmount };
    });
  }
}
