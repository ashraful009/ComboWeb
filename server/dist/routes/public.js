"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const settings_service_1 = require("../services/settings.service");
const combos_service_1 = require("../services/combos.service");
const orders_service_1 = require("../services/orders.service");
const pricing_1 = require("../services/pricing");
const asyncHandler_1 = require("../utils/asyncHandler");
const shared_1 = require("@freshagro/shared");
const validate_1 = require("../middleware/validate");
const coupons_service_1 = require("../services/coupons.service");
const db_1 = require("../config/db");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const router = (0, express_1.Router)();
router.get('/health', (req, res) => {
    res.json({ success: true, message: 'Server is healthy and running!', time: new Date() });
});
router.get('/db-check', async (req, res) => {
    try {
        const [rows] = await db_1.pool.query('SELECT 1 as connected');
        const [combos] = await db_1.pool.query('SELECT COUNT(*) as count FROM combos');
        res.json({ success: true, db: 'Connected!', combosCount: combos[0]?.count ?? 0 });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message, code: err.code });
    }
});
const orderLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 10,
    validate: { xForwardedForHeader: false },
    message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many orders created, please try again later.' } }
});
router.get('/settings/public', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const settings = await (0, settings_service_1.getSettings)();
    res.json({ success: true, data: settings });
}));
router.get('/combos', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const combos = await (0, combos_service_1.getAllCombos)(false);
    res.json({ success: true, data: combos });
}));
router.post('/cart/quote', (0, validate_1.validateBody)(shared_1.QuoteRequestSchema), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { items, couponCode, deliveryZone } = req.body;
    const settings = await (0, settings_service_1.getSettings)();
    let coupon = null;
    if (couponCode) {
        coupon = await (0, coupons_service_1.getCouponByCode)(couponCode);
    }
    const allCombos = await (0, combos_service_1.getAllCombos)(false);
    const pricingInputs = [];
    for (const item of items) {
        const combo = allCombos.find(c => c.id === item.comboId);
        if (!combo)
            continue;
        pricingInputs.push({
            comboId: combo.id,
            quantity: item.quantity,
            marketPrice: combo.market_price,
            unitPrice: combo.price
        });
    }
    const quote = (0, pricing_1.calculatePricing)(pricingInputs, deliveryZone, settings, coupon);
    res.json({ success: true, data: quote });
}));
router.post('/orders', orderLimiter, (0, validate_1.validateBody)(shared_1.CreateOrderRequestSchema), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, orders_service_1.createOrder)(req.body);
    res.json({ success: true, data: result });
}));
const trackLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 30,
    validate: { xForwardedForHeader: false },
    message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many requests, please try again later.' } }
});
router.get('/orders/track', trackLimiter, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const phone = String(req.query.phone || '');
    if (!/^(\+?88)?01[3-9]\d{8}$/.test(phone.replace(/[\s-]/g, ''))) {
        return res.status(400).json({ success: false, error: { code: 'INVALID_PHONE', message: 'Invalid Bangladeshi mobile number' } });
    }
    const orders = await (0, orders_service_1.getOrdersByPhone)(phone);
    res.json({ success: true, data: orders });
}));
router.get('/orders/public/:token', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const order = await (0, orders_service_1.getOrderByToken)(req.params.token);
    if (!order) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
    }
    const settings = await (0, settings_service_1.getSettings)();
    res.json({
        success: true,
        data: {
            order,
            shopInfo: {
                phone: settings.site_phone,
                email: settings.site_email,
                address_bn: settings.site_address_bn,
                address_en: settings.site_address_en,
                invoice_policy_note_bn: settings.invoice_policy_note_bn,
                invoice_policy_note_en: settings.invoice_policy_note_en,
            }
        }
    });
}));
exports.default = router;
