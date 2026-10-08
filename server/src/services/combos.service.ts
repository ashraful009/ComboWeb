import { pool } from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { Combo, ComboItem } from '@freshagro/shared';


export const getAllCombos = async (includeInactive = false): Promise<Combo[]> => {
  let query = 'SELECT * FROM combos';
  if (!includeInactive) {
    query += ' WHERE is_active = 1';
  }
  query += ' ORDER BY sort_order ASC';

  const [comboRows] = await pool.query<RowDataPacket[]>(query);
  if (comboRows.length === 0) return [];

  const comboIds = comboRows.map(c => c.id);
  const [itemRows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM combo_items WHERE combo_id IN (?) ORDER BY sort_order ASC',
    [comboIds]
  );

  const combos: Combo[] = comboRows.map(row => ({
    id: row.id,
    name_bn: row.name_bn,
    name_en: row.name_en,
    tag_bn: row.tag_bn,
    tag_en: row.tag_en,
    serves: row.serves,
    weight_label: row.weight_label,
    image_url: row.image_url,
    market_price: row.market_price,
    price: row.price,
    is_active: !!row.is_active,
    sort_order: row.sort_order,
    created_at: row.created_at,
    updated_at: row.updated_at,
    items: [],
  }));

  itemRows.forEach(itemRow => {
    const combo = combos.find(c => c.id === itemRow.combo_id);
    if (combo) {
      combo.items!.push({
        id: itemRow.id,
        combo_id: itemRow.combo_id,
        name_bn: itemRow.name_bn,
        name_en: itemRow.name_en,
        qty_label: itemRow.qty_label,
        market_price: itemRow.market_price,
        price: itemRow.price,
        sort_order: itemRow.sort_order,
      });
    }
  });

  return combos;
};

export const getComboById = async (id: number): Promise<Combo | null> => {
  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM combos WHERE id = ?', [id]);
  if (rows.length === 0) return null;

  const [itemRows] = await pool.query<RowDataPacket[]>('SELECT * FROM combo_items WHERE combo_id = ? ORDER BY sort_order ASC', [id]);
  
  return {
    ...rows[0],
    is_active: !!rows[0].is_active,
    items: itemRows as ComboItem[]
  } as Combo;
};

export const createCombo = async (data: Omit<Combo, 'id' | 'created_at' | 'updated_at'>): Promise<number> => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [comboResult] = await connection.query<ResultSetHeader>(
      `INSERT INTO combos (name_bn, name_en, tag_bn, tag_en, serves, weight_label, image_url, market_price, price, is_active, sort_order) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.name_bn, data.name_en, data.tag_bn, data.tag_en, data.serves, data.weight_label, data.image_url, data.market_price, data.price, data.is_active ? 1 : 0, data.sort_order]
    );

    const comboId = comboResult.insertId;

    if (data.items && data.items.length > 0) {
      const itemsData = data.items.map((item: ComboItem) => [
        comboId, item.name_bn, item.name_en, item.qty_label, item.market_price, item.price, item.sort_order
      ]);
      await connection.query(
        'INSERT INTO combo_items (combo_id, name_bn, name_en, qty_label, market_price, price, sort_order) VALUES ?',
        [itemsData]
      );
    }

    await connection.commit();
    return comboId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const updateCombo = async (id: number, data: Omit<Combo, 'id' | 'created_at' | 'updated_at'>): Promise<void> => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(
      `UPDATE combos SET 
        name_bn = ?, name_en = ?, tag_bn = ?, tag_en = ?, serves = ?, weight_label = ?, 
        image_url = ?, market_price = ?, price = ?, sort_order = ?
       WHERE id = ?`,
      [data.name_bn, data.name_en, data.tag_bn, data.tag_en, data.serves, data.weight_label, data.image_url, data.market_price, data.price, data.sort_order, id]
    );

    if (data.items) {
      await connection.query('DELETE FROM combo_items WHERE combo_id = ?', [id]);
      if (data.items.length > 0) {
        const itemsData = data.items.map((item: ComboItem) => [
          id, item.name_bn, item.name_en, item.qty_label, item.market_price, item.price, item.sort_order
        ]);
        await connection.query(
          'INSERT INTO combo_items (combo_id, name_bn, name_en, qty_label, market_price, price, sort_order) VALUES ?',
          [itemsData]
        );
      }
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const toggleComboActive = async (id: number, is_active: boolean): Promise<void> => {
  await pool.query('UPDATE combos SET is_active = ? WHERE id = ?', [is_active ? 1 : 0, id]);
};

export const deleteCombo = async (id: number): Promise<void> => {
  await pool.query('DELETE FROM combos WHERE id = ?', [id]);
};
