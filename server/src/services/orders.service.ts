import { pool } from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import crypto from 'crypto';
import { Order, CreateOrderRequest, Coupon, OrderItem } from '@freshagro/shared';
import { getSettings } from './settings.service';
import { calculatePricing, PricingComboInput } from './pricing';
import { AppError } from '../utils/AppError';

export const createOrder = async (reqData: CreateOrderRequest): Promise<{ orderNo: string, publicToken: string }> => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Load active combos
    const comboIds = reqData.items.map(item => item.comboId);
    const [combos] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM combos WHERE id IN (?) AND is_active = 1', 
      [comboIds]
    );

    if (combos.length !== comboIds.length) {
      throw new AppError('COMBO_UNAVAILABLE', 409, 'One or more combos are unavailable or inactive');
    }

    const pricingInputs: PricingComboInput[] = [];
    const comboMap = new Map<number, RowDataPacket>();
    const itemsSnapshotMap = new Map<number, unknown[]>();

    for (const combo of combos) {
      comboMap.set(combo.id, combo);
      
      const reqItem = reqData.items.find(i => i.comboId === combo.id)!;
      pricingInputs.push({
        comboId: combo.id,
        quantity: reqItem.quantity,
        marketPrice: combo.market_price,
        unitPrice: combo.price
      });

      const [comboItems] = await connection.query<RowDataPacket[]>(
        'SELECT * FROM combo_items WHERE combo_id = ? ORDER BY sort_order ASC', 
        [combo.id]
      );
      
      const snapshots = comboItems.map(ci => ({
        nameBn: ci.name_bn,
        nameEn: ci.name_en,
        qtyLabel: ci.qty_label,
        marketPrice: ci.market_price,
        price: ci.price,
      }));
      itemsSnapshotMap.set(combo.id, snapshots);
    }

    // 2. Load Settings
    const settings = await getSettings();

    // 3. Load & lock Coupon if provided
    let couponRow: RowDataPacket | null = null;
    if (reqData.coupon_code) {
      const [coupons] = await connection.query<RowDataPacket[]>(
        'SELECT * FROM coupons WHERE code = ? FOR UPDATE', 
        [reqData.coupon_code.toUpperCase()]
      );
      if (coupons.length > 0) {
        couponRow = coupons[0];
      }
    }

    // 4. Calculate Pricing
    const pricing = calculatePricing(pricingInputs, reqData.delivery_zone, settings, couponRow as (Coupon & { used_count: number }) | null);
    if (pricing.couponError) {
      throw new AppError('INVALID_COUPON', 400, `Coupon error: ${pricing.couponError}`);
    }

    // 5. Increment coupon usage
    if (couponRow) {
      await connection.query('UPDATE coupons SET used_count = used_count + 1 WHERE id = ?', [couponRow.id]);
    }

    // 6. Insert Order
    const publicToken = crypto.randomBytes(16).toString('hex');
    
    const [orderResult] = await connection.query<ResultSetHeader>(
      `INSERT INTO orders (
        public_token, customer_name, phone, email, division, district, area, address, 
        delivery_note, delivery_slot, delivery_zone, payment_method, payment_sender_number, payment_txn_id,
        subtotal, delivery_charge, coupon_id, coupon_code, discount_amount, grand_total
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        publicToken, reqData.customer_name, reqData.phone, reqData.email || null, 
        reqData.division, reqData.district, reqData.area, reqData.address,
        reqData.delivery_note || null, reqData.delivery_slot || null, reqData.delivery_zone,
        reqData.payment_method, reqData.payment_sender_number || null, reqData.payment_txn_id || null,
        pricing.subtotal, pricing.deliveryCharge, couponRow ? couponRow.id : null, pricing.appliedCoupon || null,
        pricing.discountAmount, pricing.grandTotal
      ]
    );

    const orderId = orderResult.insertId;
    const orderNo = `FA-${orderId}`;
    
    await connection.query('UPDATE orders SET order_no = ? WHERE id = ?', [orderNo, orderId]);

    // 7. Insert Order Items
    for (const line of pricing.lines) {
      const combo = comboMap.get(line.comboId)!;
      const snapshot = itemsSnapshotMap.get(line.comboId)!;
      
      await connection.query(
        `INSERT INTO order_items (
          order_id, combo_id, name_bn, name_en, items_snapshot, market_price, unit_price, quantity, line_total
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId, line.comboId, combo.name_bn, combo.name_en, JSON.stringify(snapshot),
          line.marketPrice, line.unitPrice, line.quantity, line.lineTotal
        ]
      );
    }

    await connection.commit();
    return { orderNo, publicToken };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const getOrderByToken = async (token: string): Promise<Order | null> => {
  const [orders] = await pool.query<RowDataPacket[]>('SELECT * FROM orders WHERE public_token = ?', [token]);
  if (orders.length === 0) return null;

  const order = orders[0] as Order;
  
  const [items] = await pool.query<RowDataPacket[]>('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
  order.items = items.map(item => ({
    ...item,
    items_snapshot: typeof item.items_snapshot === 'string' ? JSON.parse(item.items_snapshot) : item.items_snapshot
  }) as OrderItem);

  return order as Order;
};

// Admin methods
export const getAdminOrders = async (filters: { status?: string, paymentStatus?: string, search?: string, limit?: number, offset?: number }) => {
  let query = 'SELECT * FROM orders WHERE 1=1';
  const params: unknown[] = [];

  if (filters.status) {
    query += ' AND order_status = ?';
    params.push(filters.status);
  }
  if (filters.paymentStatus) {
    query += ' AND payment_status = ?';
    params.push(filters.paymentStatus);
  }
  if (filters.search) {
    query += ' AND (order_no LIKE ? OR customer_name LIKE ? OR phone LIKE ?)';
    params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
  }

  query += ' ORDER BY created_at DESC';

  if (filters.limit) {
    query += ' LIMIT ? OFFSET ?';
    params.push(filters.limit, filters.offset || 0);
  }

  const [rows] = await pool.query<RowDataPacket[]>(query, params);
  
  // Get total count
  const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total').split(' ORDER BY')[0];
  const [countRows] = await pool.query<RowDataPacket[]>(countQuery, params.slice(0, -2));
  
  return {
    data: rows,
    total: countRows[0].total
  };
};

export const getAdminOrderById = async (id: number): Promise<Order | null> => {
  const [orders] = await pool.query<RowDataPacket[]>('SELECT * FROM orders WHERE id = ?', [id]);
  if (orders.length === 0) return null;

  const order = orders[0] as Order;
  const [items] = await pool.query<RowDataPacket[]>('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
  order.items = items.map(item => ({
    ...item,
    items_snapshot: typeof item.items_snapshot === 'string' ? JSON.parse(item.items_snapshot) : item.items_snapshot
  }) as OrderItem);

  return order as Order;
};

export const updateOrderStatus = async (id: number, status: string): Promise<void> => {
  await pool.query('UPDATE orders SET order_status = ? WHERE id = ?', [status, id]);
};

export const updatePaymentStatus = async (id: number, status: string): Promise<void> => {
  await pool.query('UPDATE orders SET payment_status = ? WHERE id = ?', [status, id]);
};
