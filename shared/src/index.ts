import { z } from 'zod';

export const ComboItemSchema = z.object({
  id: z.number(),
  combo_id: z.number(),
  name_bn: z.string(),
  name_en: z.string(),
  qty_label: z.string(),
  market_price: z.number(),
  price: z.number(),
  sort_order: z.number(),
});

export const ComboSchema = z.object({
  id: z.number(),
  name_bn: z.string(),
  name_en: z.string(),
  tag_bn: z.string().nullable(),
  tag_en: z.string().nullable(),
  serves: z.string().nullable(),
  weight_label: z.string().nullable(),
  image_url: z.string().nullable(),
  market_price: z.number(),
  price: z.number(),
  is_active: z.boolean().or(z.number()),
  sort_order: z.number(),
  created_at: z.string().or(z.date()),
  updated_at: z.string().or(z.date()),
  items: z.array(ComboItemSchema).optional(),
});

export const CouponSchema = z.object({
  id: z.number(),
  code: z.string(),
  type: z.enum(['fixed', 'percent']),
  value: z.number(),
  min_order_amount: z.number(),
  max_discount_amount: z.number().nullable(),
  usage_limit: z.number().nullable(),
  used_count: z.number(),
  starts_at: z.string().or(z.date()).nullable(),
  expires_at: z.string().or(z.date()).nullable(),
  is_active: z.boolean().or(z.number()),
  created_at: z.string().or(z.date()),
  updated_at: z.string().or(z.date()),
});

export const OrderStatusEnum = z.enum(['pending', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled']);
export const PaymentStatusEnum = z.enum(['unpaid', 'paid']);
export const DeliveryZoneEnum = z.enum(['inside_dhaka', 'outside_dhaka']);
export const PaymentMethodEnum = z.enum(['cod', 'bkash', 'nagad']);

export const OrderItemSnapshotSchema = z.object({
  nameBn: z.string(),
  nameEn: z.string(),
  qtyLabel: z.string(),
  marketPrice: z.number(),
  price: z.number(),
});

export const OrderItemSchema = z.object({
  id: z.number(),
  order_id: z.number(),
  combo_id: z.number().nullable(),
  name_bn: z.string(),
  name_en: z.string(),
  items_snapshot: z.array(OrderItemSnapshotSchema),
  market_price: z.number(),
  unit_price: z.number(),
  quantity: z.number(),
  line_total: z.number(),
});

export const OrderSchema = z.object({
  id: z.number(),
  order_no: z.string(),
  public_token: z.string(),
  customer_name: z.string(),
  phone: z.string(),
  email: z.string().nullable(),
  division: z.string(),
  district: z.string(),
  area: z.string(),
  address: z.string(),
  delivery_note: z.string().nullable(),
  delivery_slot: z.string().nullable(),
  delivery_zone: DeliveryZoneEnum,
  payment_method: PaymentMethodEnum,
  payment_sender_number: z.string().nullable(),
  payment_txn_id: z.string().nullable(),
  payment_status: PaymentStatusEnum,
  order_status: OrderStatusEnum,
  subtotal: z.number(),
  delivery_charge: z.number(),
  coupon_id: z.number().nullable(),
  coupon_code: z.string().nullable(),
  discount_amount: z.number(),
  grand_total: z.number(),
  created_at: z.string().or(z.date()),
  updated_at: z.string().or(z.date()),
  items: z.array(OrderItemSchema).optional(),
});

export const SettingsSchema = z.object({
  delivery_charge_inside_dhaka: z.number().catch(60),
  delivery_charge_outside_dhaka: z.number().catch(120),
  free_delivery_min_amount: z.number().catch(5000),
  site_phone: z.string().catch(''),
  site_whatsapp: z.string().catch(''),
  site_email: z.string().catch(''),
  site_address_bn: z.string().catch(''),
  site_address_en: z.string().catch(''),
  bkash_number: z.string().catch(''),
  nagad_number: z.string().catch(''),
  hero_image_url: z.string().catch(''),
  hero_title_bn: z.string().catch(''),
  hero_title_en: z.string().catch(''),
  hero_subtitle_bn: z.string().catch(''),
  hero_subtitle_en: z.string().catch(''),
  invoice_policy_note_bn: z.string().catch(''),
  invoice_policy_note_en: z.string().catch(''),
  delivery_time_slots: z.array(z.string()).catch([]),
});

export const QuoteRequestSchema = z.object({
  items: z.array(
    z.object({
      comboId: z.number(),
      quantity: z.number().min(1).max(20),
    })
  ).min(1).max(20),
  couponCode: z.string().optional(),
  deliveryZone: DeliveryZoneEnum,
});

export const QuoteResponseSchema = z.object({
  lines: z.array(z.object({
    comboId: z.number(),
    unitPrice: z.number(),
    marketPrice: z.number(),
    quantity: z.number(),
    lineTotal: z.number(),
  })),
  subtotal: z.number(),
  deliveryCharge: z.number(),
  freeDeliveryRemaining: z.number(),
  discountAmount: z.number(),
  grandTotal: z.number(),
  couponError: z.string().optional(),
  appliedCoupon: z.string().optional(),
});

export const CreateOrderRequestSchema = z.object({
  customer_name: z.string().min(1),
  phone: z.string().regex(/^01[3-9]\d{8}$/, 'Invalid BD phone number'),
  email: z.string().email().optional().or(z.literal('')),
  division: z.string().min(1),
  district: z.string().min(1),
  area: z.string().min(1),
  address: z.string().min(1),
  delivery_note: z.string().optional(),
  delivery_slot: z.string().optional(),
  delivery_zone: DeliveryZoneEnum,
  payment_method: PaymentMethodEnum,
  payment_sender_number: z.string().optional(),
  payment_txn_id: z.string().optional(),
  items: z.array(
    z.object({
      comboId: z.number(),
      quantity: z.number().min(1).max(20),
    })
  ).min(1).max(20),
  coupon_code: z.string().optional(),
}).refine(data => {
  if (data.delivery_zone === 'inside_dhaka' && data.district.toLowerCase() !== 'dhaka') {
    return false;
  }
  return true;
}, {
  message: "Inside Dhaka delivery zone is only valid for Dhaka district",
  path: ["delivery_zone"]
}).refine(data => {
  if (['bkash', 'nagad'].includes(data.payment_method)) {
    return !!data.payment_sender_number && !!data.payment_txn_id;
  }
  return true;
}, {
  message: "Payment sender number and transaction ID are required for bKash and Nagad",
  path: ["payment_method"]
});

export const AdminLoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export type ComboItem = z.infer<typeof ComboItemSchema>;
export type Combo = z.infer<typeof ComboSchema>;
export type Coupon = z.infer<typeof CouponSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type Settings = z.infer<typeof SettingsSchema>;
export type QuoteRequest = z.infer<typeof QuoteRequestSchema>;
export type QuoteResponse = z.infer<typeof QuoteResponseSchema>;
export type CreateOrderRequest = z.infer<typeof CreateOrderRequestSchema>;
export type AdminLoginRequest = z.infer<typeof AdminLoginSchema>;
