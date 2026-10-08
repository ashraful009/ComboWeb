import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { adminAuth } from '../middleware/adminAuth';
import { asyncHandler } from '../utils/asyncHandler';
import { validateBody } from '../middleware/validate';
import { z } from 'zod';
import { AdminLoginSchema, ComboSchema, ComboItemSchema, CouponSchema, SettingsSchema } from '@freshagro/shared';
import bcrypt from 'bcryptjs';
import { getDashboardStats } from '../services/dashboard.service';
import { createCombo, deleteCombo, getAllCombos, getComboById, toggleComboActive, updateCombo } from '../services/combos.service';
import { createCoupon, deleteCoupon, getAllCoupons, getCouponById, toggleCouponActive, updateCoupon } from '../services/coupons.service';
import { getAdminOrderById, getAdminOrders, updateOrderStatus, updatePaymentStatus } from '../services/orders.service';
import { getSettings, updateSettings } from '../services/settings.service';
import { upload } from '../middleware/upload';
import rateLimit from 'express-rate-limit';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many login attempts.' } }
});

router.post('/login', loginLimiter, validateBody(AdminLoginSchema), asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  
  if (username !== env.ADMIN_USERNAME || !bcrypt.compareSync(password, env.ADMIN_PASSWORD_HASH)) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' } });
  }

  const token = jwt.sign({ username }, env.JWT_SECRET, { expiresIn: '1d' });
  
  res.cookie('admin_token', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
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
router.use(adminAuth);

router.get('/me', (req, res) => {
  res.json({ success: true, data: { username: env.ADMIN_USERNAME } });
});

router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: { code: 'NO_FILE', message: 'No file uploaded' } });
  }
  const url = req.file.path || (req.file as Express.Multer.File & { url?: string }).url; // multer-storage-cloudinary uses path or url
  res.json({ success: true, data: { url } });
});

router.get('/dashboard', asyncHandler(async (req, res) => {
  const stats = await getDashboardStats();
  res.json({ success: true, data: stats });
}));

// Combos
router.get('/combos', asyncHandler(async (req, res) => {
  const combos = await getAllCombos(true);
  res.json({ success: true, data: combos });
}));

router.get('/combos/:id', asyncHandler(async (req, res) => {
  const combo = await getComboById(Number(req.params.id));
  if (!combo) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Combo not found' } });
  res.json({ success: true, data: combo });
}));

const CreateComboSchema = ComboSchema.omit({ id: true, created_at: true, updated_at: true }).extend({
  items: z.array(ComboItemSchema.omit({ id: true, combo_id: true }).extend({ id: z.number().optional(), combo_id: z.number().optional() })).optional()
});

router.post('/combos', asyncHandler(async (req, res) => {
  const data = CreateComboSchema.parse(req.body);
  const id = await createCombo(data as Parameters<typeof createCombo>[0]);
  res.json({ success: true, data: { id } });
}));

router.put('/combos/:id', asyncHandler(async (req, res) => {
  const data = CreateComboSchema.parse(req.body);
  await updateCombo(Number(req.params.id), data as Parameters<typeof updateCombo>[1]);
  res.json({ success: true, data: null });
}));

router.patch('/combos/:id/active', asyncHandler(async (req, res) => {
  const { is_active } = req.body;
  await toggleComboActive(Number(req.params.id), is_active);
  res.json({ success: true, data: null });
}));

router.delete('/combos/:id', asyncHandler(async (req, res) => {
  await deleteCombo(Number(req.params.id));
  res.json({ success: true, data: null });
}));

// Coupons
router.get('/coupons', asyncHandler(async (req, res) => {
  const coupons = await getAllCoupons();
  res.json({ success: true, data: coupons });
}));

const CreateCouponSchema = CouponSchema.omit({ id: true, used_count: true, created_at: true, updated_at: true }).extend({
  starts_at: z.string().or(z.date()).nullish(),
  expires_at: z.string().or(z.date()).nullish()
});

router.post('/coupons', asyncHandler(async (req, res) => {
  const data = CreateCouponSchema.parse(req.body);
  const id = await createCoupon(data as Parameters<typeof createCoupon>[0]);
  res.json({ success: true, data: { id } });
}));

router.get('/coupons/:id', asyncHandler(async (req, res) => {
  const coupon = await getCouponById(Number(req.params.id));
  if (!coupon) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Coupon not found' } });
  res.json({ success: true, data: coupon });
}));

router.put('/coupons/:id', asyncHandler(async (req, res) => {
  const data = CreateCouponSchema.omit({ code: true }).parse(req.body);
  await updateCoupon(Number(req.params.id), data as Parameters<typeof updateCoupon>[1]);
  res.json({ success: true, data: null });
}));

router.patch('/coupons/:id/active', asyncHandler(async (req, res) => {
  const { is_active } = req.body;
  await toggleCouponActive(Number(req.params.id), is_active);
  res.json({ success: true, data: null });
}));

router.delete('/coupons/:id', asyncHandler(async (req, res) => {
  await deleteCoupon(Number(req.params.id));
  res.json({ success: true, data: null });
}));

// Orders
router.get('/orders', asyncHandler(async (req, res) => {
  const { status, paymentStatus, search, limit = '20', offset = '0' } = req.query;
  const result = await getAdminOrders({
    status: status as string,
    paymentStatus: paymentStatus as string,
    search: search as string,
    limit: Number(limit),
    offset: Number(offset)
  });
  res.json({ success: true, data: result });
}));

router.get('/orders/:id', asyncHandler(async (req, res) => {
  const order = await getAdminOrderById(Number(req.params.id));
  if (!order) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
  res.json({ success: true, data: order });
}));

router.patch('/orders/:id/status', asyncHandler(async (req, res) => {
  const { status } = req.body;
  await updateOrderStatus(Number(req.params.id), status);
  res.json({ success: true, data: null });
}));

router.patch('/orders/:id/payment-status', asyncHandler(async (req, res) => {
  const { status } = req.body;
  await updatePaymentStatus(Number(req.params.id), status);
  res.json({ success: true, data: null });
}));

// Settings
router.get('/settings', asyncHandler(async (req, res) => {
  const settings = await getSettings();
  res.json({ success: true, data: settings });
}));

router.put('/settings', asyncHandler(async (req, res) => {
  const data = SettingsSchema.partial().parse(req.body);
  await updateSettings(data);
  res.json({ success: true, data: null });
}));

// Uploads
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'No file uploaded' } });
  }
  const url = `/uploads/${req.file.filename}`;
  res.json({ success: true, data: { url } });
});

export default router;
