import { BaseRepository } from './base.repository';
import type { Knex } from 'knex';
import type { ComboRow, ComboItemRow } from '../types/combo.types';

export class ComboRepository extends BaseRepository {
  async findAllActive(trx?: Knex.Transaction) {
    const combos = await this.conn(trx)
      .select('combos.*', 'combo_images.image_url')
      .from('combos')
      .leftJoin('combo_images', function() {
        this.on('combos.id', '=', 'combo_images.combo_id').andOnVal('combo_images.is_primary', '=', true);
      })
      .where({ 'combos.is_active': true, 'combos.deleted_at': null });

    if (combos.length === 0) return [];

    const comboIds = combos.map(c => c.id);
    const allItems = await this.conn(trx)
      .select('combo_items.combo_id', 'combo_items.quantity', 'items.id as item_id', 'items.name', 'items.avg_cost_paisa', 'items.unit_type')
      .from('combo_items')
      .join('items', 'combo_items.item_id', 'items.id')
      .whereIn('combo_items.combo_id', comboIds);

    const itemsMap: Record<number, {combo_id: number, quantity: number, item_id: number, name: string, avg_cost_paisa: number, unit_type: string}[]> = {};
    for (const it of allItems) {
      if (it && it.combo_id != null) {
        if (!itemsMap[it.combo_id]) {
          itemsMap[it.combo_id] = [];
        }
        itemsMap[it.combo_id]!.push(it);
      }
    }

    return combos.map(c => ({
      ...c,
      items: (c.id && itemsMap[c.id]) ? itemsMap[c.id] : []
    }));
  }

  async findById(id: number, trx?: Knex.Transaction) {
    const combo = await this.conn(trx).table('combos').where({ id, is_active: true, deleted_at: null }).first();
    if (!combo) return null;

    const items = await this.conn(trx).select('combo_items.quantity', 'items.id as item_id', 'items.name', 'items.avg_cost_paisa', 'items.unit_type')
      .from('combo_items')
      .join('items', 'combo_items.item_id', 'items.id')
      .where({ 'combo_items.combo_id': id });

    const images = await this.conn(trx).table('combo_images').where({ combo_id: id }).orderBy('display_order', 'asc');

    return { ...combo, items, images };
  }

  async createCombo(data: Partial<ComboRow>, trx?: Knex.Transaction): Promise<number> {
    const [id] = await this.conn(trx).table('combos').insert(data);
    return id as number;
  }

  async addComboItems(items: Partial<ComboItemRow>[], trx?: Knex.Transaction): Promise<void> {
    await this.conn(trx).table('combo_items').insert(items);
  }

  async addComboImages(images: { combo_id: number; image_url: string; is_primary?: boolean; display_order?: number }[], trx?: Knex.Transaction): Promise<void> {
    await this.conn(trx).table('combo_images').insert(images);
  }

  async updateCombo(id: number, data: Partial<ComboRow>, trx?: Knex.Transaction): Promise<void> {
    await this.conn(trx).table('combos').where({ id }).update({ ...data, updated_at: new Date() });
  }

  async deleteComboItems(comboId: number, trx?: Knex.Transaction): Promise<void> {
    await this.conn(trx).table('combo_items').where({ combo_id: comboId }).delete();
  }

  async deleteComboImages(comboId: number, trx?: Knex.Transaction): Promise<void> {
    await this.conn(trx).table('combo_images').where({ combo_id: comboId }).delete();
  }

  async deleteCombo(id: number, trx?: Knex.Transaction): Promise<void> {
    // Soft delete if possible, otherwise hard delete
    await this.conn(trx).table('combos').where({ id }).update({ deleted_at: new Date() });
  }
}
