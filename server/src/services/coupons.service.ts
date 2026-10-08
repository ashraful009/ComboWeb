import { pool } from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { Coupon } from '@freshagro/shared';

export const getAllCoupons = async (): Promise<Coupon[]> => {
  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM coupons ORDER BY id DESC');
  return rows.map(row => ({
    ...row,
    is_active: !!row.is_active,
  })) as Coupon[];
};

export const getCouponByCode = async (code: string): Promise<Coupon | null> => {
  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM coupons WHERE code = ?', [code.toUpperCase()]);
  if (rows.length === 0) return null;
  return {
    ...rows[0],
    is_active: !!rows[0].is_active,
  } as Coupon;
};

export const getCouponById = async (id: number): Promise<Coupon | null> => {
  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM coupons WHERE id = ?', [id]);
  if (rows.length === 0) return null;
  return {
    ...rows[0],
    is_active: !!rows[0].is_active,
  } as Coupon;
};

export const createCoupon = async (data: Omit<Coupon, 'id' | 'used_count' | 'created_at' | 'updated_at'>): Promise<number> => {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO coupons (code, type, value, min_order_amount, max_discount_amount, usage_limit, starts_at, expires_at, is_active) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.code.toUpperCase(), data.type, data.value, data.min_order_amount, 
      data.max_discount_amount, data.usage_limit, data.starts_at, data.expires_at, data.is_active ? 1 : 0
    ]
  );
  return result.insertId;
};

export const updateCoupon = async (id: number, data: Omit<Coupon, 'id' | 'used_count' | 'created_at' | 'updated_at' | 'code'>): Promise<void> => {
  await pool.query(
    `UPDATE coupons SET type = ?, value = ?, min_order_amount = ?, max_discount_amount = ?, usage_limit = ?, starts_at = ?, expires_at = ?
     WHERE id = ?`,
    [data.type, data.value, data.min_order_amount, data.max_discount_amount, data.usage_limit, data.starts_at, data.expires_at, id]
  );
};

export const toggleCouponActive = async (id: number, is_active: boolean): Promise<void> => {
  await pool.query('UPDATE coupons SET is_active = ? WHERE id = ?', [is_active ? 1 : 0, id]);
};

export const deleteCoupon = async (id: number): Promise<void> => {
  await pool.query('DELETE FROM coupons WHERE id = ?', [id]);
};
