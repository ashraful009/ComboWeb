import { ComboRepository } from '../repositories/combo.repository';
import { withTransaction } from '../config/db';
import type { Knex } from 'knex';
import type { ComboRow } from '../types/combo.types';

export class ComboService {
  private repo = new ComboRepository();


  private async resolveComboItems(
    items: { item_id?: number | string; name?: string; unit?: string; costPerUnit?: number; unit_cost?: number; quantity?: number }[], 
    comboId: number, 
    trx: Knex.Transaction
  ) {
    const comboItems = [];
    for (const i of items) {
      let itemId = i.item_id ? Number(i.item_id) : undefined;
      const rawName = i.name ? String(i.name).trim() : '';
      const trimmedName = rawName.slice(0, 100);

      if (itemId && trimmedName) {
        // Verify if existing item matches name
        const currentItem = await trx('items').where('id', itemId).first();
        if (!currentItem || currentItem.name.toLowerCase() !== trimmedName.toLowerCase()) {
          itemId = undefined; // Name changed or mismatched, re-resolve
        }
      }

      if (!itemId && trimmedName) {
        // Look up item in `items` table by name (case-insensitive)
        let existingItem = await trx('items').whereRaw('LOWER(name) = ?', [trimmedName.toLowerCase()]).first();
        if (!existingItem) {
          const sku = 'SKU-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
          const [newId] = await trx('items').insert({
            name: trimmedName,
            sku: sku,
            unit_type: i.unit || 'unit',
            stock_qty: 100,
            avg_cost_paisa: Math.round((Number(i.costPerUnit) || Number(i.unit_cost) || 0) * 100),
            reorder_level: 10,
            is_active: true
          });
          itemId = newId;
        } else {
          itemId = existingItem.id;
        }
      }

      if (itemId) {
        comboItems.push({
          combo_id: comboId,
          item_id: itemId,
          quantity: Math.max(1, Math.round(Number(i.quantity) || 1))
        });
      }
    }
    return comboItems;
  }

  async createCombo(data: Partial<ComboRow> & { items?: any[]; images?: any[] }) {
    return withTransaction(async (trx) => {
      const { items, images, ...comboData } = data;
      
      const comboId = await this.repo.createCombo(comboData, trx);
      
      if (items && items.length > 0) {
        const comboItems = await this.resolveComboItems(items, comboId, trx);
        if (comboItems.length > 0) {
          await this.repo.addComboItems(comboItems, trx);
        }
      }

      if (images && images.length > 0) {
        const comboImages = images.map((img: any) => ({
          combo_id: comboId,
          ...img
        }));
        await this.repo.addComboImages(comboImages, trx);
      }

      return { comboId, ...comboData };
    });
  }

  async updateCombo(id: number, data: Partial<ComboRow> & { items?: any[]; images?: any[] }) {
    return withTransaction(async (trx) => {
      const { items, images, ...comboData } = data;
      
      if (Object.keys(comboData).length > 0) {
        await this.repo.updateCombo(id, comboData, trx);
      }
      
      if (items) {
        await this.repo.deleteComboItems(id, trx);
        if (items.length > 0) {
          const comboItems = await this.resolveComboItems(items, id, trx);
          if (comboItems.length > 0) {
            await this.repo.addComboItems(comboItems, trx);
          }
        }
      }

      if (images) {
        await this.repo.deleteComboImages(id, trx);
        if (images.length > 0) {
          const comboImages = images.map((img: any) => ({
            combo_id: id,
            ...img
          }));
          await this.repo.addComboImages(comboImages, trx);
        }
      }

      return { comboId: id, ...comboData };
    });
  }

  async deleteCombo(id: number) {
    return withTransaction(async (trx) => {
      await this.repo.deleteCombo(id, trx);
    });
  }
}
