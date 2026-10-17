"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePaymentStatus = exports.updateOrderStatus = exports.getAdminOrderById = exports.getAdminOrders = exports.getOrdersByPhone = exports.getOrderByToken = exports.createOrder = void 0;
const db_1 = require("../config/db");
const crypto_1 = __importDefault(require("crypto"));
const settings_service_1 = require("./settings.service");
const pricing_1 = require("./pricing");
const AppError_1 = require("../utils/AppError");
const createOrder = async (reqData) => {
    const connection = await db_1.pool.getConnection();
    try {
        await connection.beginTransaction();
        // 1. Load active combos
        const comboIds = reqData.items.map(item => item.comboId);
        const [combos] = await connection.query('SELECT * FROM combos WHERE id IN (?) AND is_active = 1', [comboIds]);
        if (combos.length !== comboIds.length) {
            throw new AppError_1.AppError('COMBO_UNAVAILABLE', 409, 'One or more combos are unavailable or inactive');
        }
        const pricingInputs = [];
        const comboMap = new Map();
        const itemsSnapshotMap = new Map();
        for (const combo of combos) {
            comboMap.set(combo.id, combo);
            const reqItem = reqData.items.find(i => i.comboId === combo.id);
            pricingInputs.push({
                comboId: combo.id,
                quantity: reqItem.quantity,
                marketPrice: combo.market_price,
                unitPrice: combo.price
            });
            const [comboItems] = await connection.query('SELECT * FROM combo_items WHERE combo_id = ? ORDER BY sort_order ASC', [combo.id]);
            const snapshots = comboItems.map(ci => ({
                nameBn: ci.name_bn,
                nameEn: ci.name_en,
                name_bn: ci.name_bn,
                name_en: ci.name_en,
                qtyLabel: ci.qty_label,
                qty_label: ci.qty_label,
                marketPrice: ci.market_price,
                price: ci.price,
            }));
            itemsSnapshotMap.set(combo.id, snapshots);
        }
        // 2. Load Settings
        const settings = await (0, settings_service_1.getSettings)();
        // 3. Load & lock Coupon if provided
        let couponRow = null;
        if (reqData.coupon_code) {
            const [coupons] = await connection.query('SELECT * FROM coupons WHERE code = ? FOR UPDATE', [reqData.coupon_code.toUpperCase()]);
            if (coupons.length > 0) {
                couponRow = coupons[0];
            }
        }
        // 4. Calculate Pricing
        const pricing = (0, pricing_1.calculatePricing)(pricingInputs, reqData.delivery_zone, settings, couponRow);
        if (pricing.couponError) {
            throw new AppError_1.AppError('INVALID_COUPON', 400, `Coupon error: ${pricing.couponError}`);
        }
        // 5. Increment coupon usage
        if (couponRow) {
            await connection.query('UPDATE coupons SET used_count = used_count + 1 WHERE id = ?', [couponRow.id]);
        }
        // 6. Insert Order
        const publicToken = crypto_1.default.randomBytes(16).toString('hex');
        const [orderResult] = await connection.query(`INSERT INTO orders (
        public_token, customer_name, phone, email, division, district, area, address, 
        delivery_note, delivery_slot, delivery_zone, payment_method, payment_sender_number, payment_txn_id,
        subtotal, delivery_charge, coupon_id, coupon_code, discount_amount, grand_total
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            publicToken, reqData.customer_name, reqData.phone, reqData.email || null,
            reqData.division, reqData.district, reqData.area, reqData.address,
            reqData.delivery_note || null, reqData.delivery_slot || null, reqData.delivery_zone,
            reqData.payment_method, reqData.payment_sender_number || null, reqData.payment_txn_id || null,
            pricing.subtotal, pricing.deliveryCharge, couponRow ? couponRow.id : null, pricing.appliedCoupon || null,
            pricing.discountAmount, pricing.grandTotal
        ]);
        const orderId = orderResult.insertId;
        const orderNo = `FA-${orderId}`;
        await connection.query('UPDATE orders SET order_no = ? WHERE id = ?', [orderNo, orderId]);
        // 7. Insert Order Items
        for (const line of pricing.lines) {
            const combo = comboMap.get(line.comboId);
            const snapshot = itemsSnapshotMap.get(line.comboId);
            await connection.query(`INSERT INTO order_items (
          order_id, combo_id, name_bn, name_en, items_snapshot, market_price, unit_price, quantity, line_total
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                orderId, line.comboId, combo.name_bn, combo.name_en, JSON.stringify(snapshot),
                line.marketPrice, line.unitPrice, line.quantity, line.lineTotal
            ]);
        }
        await connection.commit();
        return { orderNo, publicToken };
    }
    catch (error) {
        await connection.rollback();
        throw error;
    }
    finally {
        connection.release();
    }
};
exports.createOrder = createOrder;
const getOrderByToken = async (token) => {
    const [orders] = await db_1.pool.query('SELECT * FROM orders WHERE public_token = ?', [token]);
    if (orders.length === 0)
        return null;
    const order = orders[0];
    const [items] = await db_1.pool.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    order.items = items.map(item => ({
        ...item,
        items_snapshot: typeof item.items_snapshot === 'string' ? JSON.parse(item.items_snapshot) : item.items_snapshot
    }));
    return order;
};
exports.getOrderByToken = getOrderByToken;
const getOrdersByPhone = async (phone) => {
    let digits = phone.replace(/\D/g, '');
    if (digits.startsWith('880'))
        digits = '0' + digits.slice(3);
    const [orders] = await db_1.pool.query(`SELECT id, order_no, public_token, order_status, payment_status, payment_method,
            grand_total, created_at, updated_at
     FROM orders WHERE phone = ?
     ORDER BY created_at DESC LIMIT 50`, [digits]);
    if (orders.length === 0)
        return [];
    const ids = orders.map(o => o.id);
    const [items] = await db_1.pool.query('SELECT order_id, name_en, name_bn, quantity FROM order_items WHERE order_id IN (?)', [ids]);
    return orders.map(o => ({
        ...o,
        items: items.filter(i => i.order_id === o.id).map(i => ({ name_en: i.name_en, name_bn: i.name_bn, quantity: i.quantity }))
    }));
};
exports.getOrdersByPhone = getOrdersByPhone;
// Admin methods
const getAdminOrders = async (filters) => {
    let query = 'SELECT * FROM orders WHERE 1=1';
    const params = [];
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
    const [rows] = await db_1.pool.query(query, params);
    // Get total count
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total').split(' ORDER BY')[0];
    const [countRows] = await db_1.pool.query(countQuery, params.slice(0, -2));
    return {
        data: rows,
        total: countRows[0].total
    };
};
exports.getAdminOrders = getAdminOrders;
const getAdminOrderById = async (id) => {
    const [orders] = await db_1.pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (orders.length === 0)
        return null;
    const order = orders[0];
    const [items] = await db_1.pool.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    order.items = items.map(item => ({
        ...item,
        items_snapshot: typeof item.items_snapshot === 'string' ? JSON.parse(item.items_snapshot) : item.items_snapshot
    }));
    return order;
};
exports.getAdminOrderById = getAdminOrderById;
const updateOrderStatus = async (id, status) => {
    await db_1.pool.query('UPDATE orders SET order_status = ? WHERE id = ?', [status, id]);
};
exports.updateOrderStatus = updateOrderStatus;
const updatePaymentStatus = async (id, status) => {
    await db_1.pool.query('UPDATE orders SET payment_status = ? WHERE id = ?', [status, id]);
};
exports.updatePaymentStatus = updatePaymentStatus;
