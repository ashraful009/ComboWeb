"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const adminAuth_1 = require("../middleware/adminAuth");
const asyncHandler_1 = require("../utils/asyncHandler");
const validate_1 = require("../middleware/validate");
const zod_1 = require("zod");
const shared_1 = require("@freshagro/shared");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dashboard_service_1 = require("../services/dashboard.service");
const combos_service_1 = require("../services/combos.service");
const coupons_service_1 = require("../services/coupons.service");
const orders_service_1 = require("../services/orders.service");
const settings_service_1 = require("../services/settings.service");
const upload_1 = require("../middleware/upload");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const router = (0, express_1.Router)();
const loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    validate: { xForwardedForHeader: false },
    message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many login attempts.' } }
});
router.post('/login', loginLimiter, (0, validate_1.validateBody)(shared_1.AdminLoginSchema), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { username, password } = req.body;
    if (username !== env_1.env.ADMIN_USERNAME || !bcryptjs_1.default.compareSync(password, env_1.env.ADMIN_PASSWORD_HASH)) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' } });
    }
    const token = jsonwebtoken_1.default.sign({ username }, env_1.env.JWT_SECRET, { expiresIn: '1d' });
    res.cookie('admin_token', token, {
        httpOnly: true,
        secure: env_1.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    });
    res.json({ success: true, data: { username } });
}));
router.post('/logout', (req, res) => {
    res.clearCookie('admin_token');
    res.json({ success: true, data: null });
});
// All routes below require auth
router.use(adminAuth_1.adminAuth);
router.get('/me', (req, res) => {
    res.json({ success: true, data: { username: env_1.env.ADMIN_USERNAME } });
});
router.post('/upload', upload_1.upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: { code: 'NO_FILE', message: 'No file uploaded' } });
    }
    const url = req.file.path || req.file.url; // multer-storage-cloudinary uses path or url
    res.json({ success: true, data: { url } });
});
router.get('/dashboard', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const stats = await (0, dashboard_service_1.getDashboardStats)();
    res.json({ success: true, data: stats });
}));
// Combos
router.get('/combos', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const combos = await (0, combos_service_1.getAllCombos)(true);
    res.json({ success: true, data: combos });
}));
router.get('/combos/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const combo = await (0, combos_service_1.getComboById)(Number(req.params.id));
    if (!combo)
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Combo not found' } });
    res.json({ success: true, data: combo });
}));
const CreateComboSchema = shared_1.ComboSchema.omit({ id: true, created_at: true, updated_at: true }).extend({
    items: zod_1.z.array(shared_1.ComboItemSchema.omit({ id: true, combo_id: true }).extend({ id: zod_1.z.number().optional(), combo_id: zod_1.z.number().optional() })).optional()
});
router.post('/combos', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = CreateComboSchema.parse(req.body);
    const id = await (0, combos_service_1.createCombo)(data);
    res.json({ success: true, data: { id } });
}));
router.put('/combos/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = CreateComboSchema.parse(req.body);
    await (0, combos_service_1.updateCombo)(Number(req.params.id), data);
    res.json({ success: true, data: null });
}));
router.patch('/combos/:id/active', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { is_active } = req.body;
    await (0, combos_service_1.toggleComboActive)(Number(req.params.id), is_active);
    res.json({ success: true, data: null });
}));
router.delete('/combos/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await (0, combos_service_1.deleteCombo)(Number(req.params.id));
    res.json({ success: true, data: null });
}));
// Coupons
router.get('/coupons', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const coupons = await (0, coupons_service_1.getAllCoupons)();
    res.json({ success: true, data: coupons });
}));
const CreateCouponSchema = shared_1.CouponSchema.omit({ id: true, used_count: true, created_at: true, updated_at: true }).extend({
    starts_at: zod_1.z.string().or(zod_1.z.date()).nullish(),
    expires_at: zod_1.z.string().or(zod_1.z.date()).nullish()
});
router.post('/coupons', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = CreateCouponSchema.parse(req.body);
    const id = await (0, coupons_service_1.createCoupon)(data);
    res.json({ success: true, data: { id } });
}));
router.get('/coupons/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const coupon = await (0, coupons_service_1.getCouponById)(Number(req.params.id));
    if (!coupon)
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Coupon not found' } });
    res.json({ success: true, data: coupon });
}));
router.put('/coupons/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = CreateCouponSchema.omit({ code: true }).parse(req.body);
    await (0, coupons_service_1.updateCoupon)(Number(req.params.id), data);
    res.json({ success: true, data: null });
}));
router.patch('/coupons/:id/active', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { is_active } = req.body;
    await (0, coupons_service_1.toggleCouponActive)(Number(req.params.id), is_active);
    res.json({ success: true, data: null });
}));
router.delete('/coupons/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await (0, coupons_service_1.deleteCoupon)(Number(req.params.id));
    res.json({ success: true, data: null });
}));
// Orders
router.get('/orders', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { status, paymentStatus, search, limit = '20', offset = '0' } = req.query;
    const result = await (0, orders_service_1.getAdminOrders)({
        status: status,
        paymentStatus: paymentStatus,
        search: search,
        limit: Number(limit),
        offset: Number(offset)
    });
    res.json({ success: true, data: result });
}));
router.get('/orders/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const order = await (0, orders_service_1.getAdminOrderById)(Number(req.params.id));
    if (!order)
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
    res.json({ success: true, data: order });
}));
router.patch('/orders/:id/status', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { status } = req.body;
    await (0, orders_service_1.updateOrderStatus)(Number(req.params.id), status);
    res.json({ success: true, data: null });
}));
router.patch('/orders/:id/payment-status', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { status } = req.body;
    await (0, orders_service_1.updatePaymentStatus)(Number(req.params.id), status);
    res.json({ success: true, data: null });
}));
// Settings
router.get('/settings', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const settings = await (0, settings_service_1.getSettings)();
    res.json({ success: true, data: settings });
}));
router.put('/settings', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = shared_1.SettingsSchema.partial().parse(req.body);
    await (0, settings_service_1.updateSettings)(data);
    res.json({ success: true, data: null });
}));
// Uploads
router.post('/upload', upload_1.upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'No file uploaded' } });
    }
    const url = `/uploads/${req.file.filename}`;
    res.json({ success: true, data: { url } });
});
exports.default = router;
