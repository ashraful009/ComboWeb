import { Router } from 'express';
import { getSettings } from '../services/settings.service';
import { getAllCombos } from '../services/combos.service';
import { createOrder, getOrderByToken } from '../services/orders.service';
import { calculatePricing, PricingComboInput } from '../services/pricing';
import { asyncHandler } from '../utils/asyncHandler';
import { QuoteRequestSchema, CreateOrderRequestSchema } from '@freshagro/shared';
import { validateBody } from '../middleware/validate';
import { getCouponByCode } from '../services/coupons.service';
import rateLimit from 'express-rate-limit';

const router = Router();

const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many orders created, please try again later.' } }
});

router.get('/settings/public', asyncHandler(async (req, res) => {
  const settings = await getSettings();
  res.json({ success: true, data: settings });
}));

router.get('/combos', asyncHandler(async (req, res) => {
  const combos = await getAllCombos(false);
  res.json({ success: true, data: combos });
}));

router.post('/cart/quote', validateBody(QuoteRequestSchema), asyncHandler(async (req, res) => {
  const { items, couponCode, deliveryZone } = req.body;
  const settings = await getSettings();
  
  let coupon = null;
  if (couponCode) {
    coupon = await getCouponByCode(couponCode);
  }

  const allCombos = await getAllCombos(false);
  const pricingInputs: PricingComboInput[] = [];

  for (const item of items) {
    const combo = allCombos.find(c => c.id === item.comboId);
    if (!combo) continue;
    pricingInputs.push({
      comboId: combo.id,
      quantity: item.quantity,
      marketPrice: combo.market_price,
      unitPrice: combo.price
    });
  }

  const quote = calculatePricing(pricingInputs, deliveryZone, settings, coupon);
  res.json({ success: true, data: quote });
}));

router.post('/orders', orderLimiter, validateBody(CreateOrderRequestSchema), asyncHandler(async (req, res) => {
  const result = await createOrder(req.body);
  res.json({ success: true, data: result });
}));

router.get('/orders/public/:token', asyncHandler(async (req, res) => {
  const order = await getOrderByToken(req.params.token);
  if (!order) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
  }
  
  const settings = await getSettings();
  
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

export default router;
