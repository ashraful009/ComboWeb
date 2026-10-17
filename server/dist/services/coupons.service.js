"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCoupon = exports.toggleCouponActive = exports.updateCoupon = exports.createCoupon = exports.getCouponById = exports.getCouponByCode = exports.getAllCoupons = void 0;
const db_1 = require("../config/db");
const getAllCoupons = async () => {
    const [rows] = await db_1.pool.query('SELECT * FROM coupons ORDER BY id DESC');
    return rows.map(row => ({
        ...row,
        is_active: !!row.is_active,
    }));
};
exports.getAllCoupons = getAllCoupons;
const getCouponByCode = async (code) => {
    const [rows] = await db_1.pool.query('SELECT * FROM coupons WHERE code = ?', [code.toUpperCase()]);
    if (rows.length === 0)
        return null;
    return {
        ...rows[0],
        is_active: !!rows[0].is_active,
    };
};
exports.getCouponByCode = getCouponByCode;
const getCouponById = async (id) => {
    const [rows] = await db_1.pool.query('SELECT * FROM coupons WHERE id = ?', [id]);
    if (rows.length === 0)
        return null;
    return {
        ...rows[0],
        is_active: !!rows[0].is_active,
    };
};
exports.getCouponById = getCouponById;
const createCoupon = async (data) => {
    const [result] = await db_1.pool.query(`INSERT INTO coupons (code, type, value, min_order_amount, max_discount_amount, usage_limit, starts_at, expires_at, is_active) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        data.code.toUpperCase(), data.type, data.value, data.min_order_amount,
        data.max_discount_amount, data.usage_limit, data.starts_at, data.expires_at, data.is_active ? 1 : 0
    ]);
    return result.insertId;
};
exports.createCoupon = createCoupon;
const updateCoupon = async (id, data) => {
    await db_1.pool.query(`UPDATE coupons SET type = ?, value = ?, min_order_amount = ?, max_discount_amount = ?, usage_limit = ?, starts_at = ?, expires_at = ?
     WHERE id = ?`, [data.type, data.value, data.min_order_amount, data.max_discount_amount, data.usage_limit, data.starts_at, data.expires_at, id]);
};
exports.updateCoupon = updateCoupon;
const toggleCouponActive = async (id, is_active) => {
    await db_1.pool.query('UPDATE coupons SET is_active = ? WHERE id = ?', [is_active ? 1 : 0, id]);
};
exports.toggleCouponActive = toggleCouponActive;
const deleteCoupon = async (id) => {
    await db_1.pool.query('DELETE FROM coupons WHERE id = ?', [id]);
};
exports.deleteCoupon = deleteCoupon;
